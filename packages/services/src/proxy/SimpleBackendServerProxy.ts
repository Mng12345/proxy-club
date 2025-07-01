import { type IServerProxy } from "@app/shared";
import { ModuleResult, type Result } from "mng-base/dist/result.js";
import type { IBackendServerProxy } from "./IBackendServerProxy.js";
import { fork } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

export class SimpleBackendServerProxy implements IBackendServerProxy {
  uid: string;
  name: string;
  port: number;
  proxyRules: IServerProxy["proxyRules"];
  closed: boolean;
  private childProcess: import("child_process").ChildProcess | undefined;

  constructor(proxy: IServerProxy) {
    this.uid = proxy.uid;
    this.name = proxy.name;
    this.port = proxy.port;
    this.proxyRules = proxy.proxyRules;
    this.closed = proxy.closed;
    this.startChildProcess();
  }

  private lastError: string | undefined;

  private startChildProcess() {
    const childScriptPath = fileURLToPath(import.meta.resolve('@app/services/worker.mjs'))
    this.childProcess = fork(childScriptPath, [this.port.toString()], {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
    });

    // Handle child process messages
    this.childProcess.on(
      "message",
      (message: { type?: string; error?: string }) => {
        if (message.type === "error" && message.error) {
          this.lastError = message.error;
        }
      }
    );

    // Send proxy rules to child process
    this.childProcess.send({
      type: "init",
      proxyRules: this.proxyRules,
    });

    this.closed = false;
  }

  async open(): Promise<Result<void, string>> {
    this.lastError = undefined;
    if (!this.childProcess) {
      this.startChildProcess();
    }

    return new Promise<Result<void, string>>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(ModuleResult.err<void, string>('Server start timeout'));
      }, 5000);

      const handler = (message: any) => {
        if (message?.type === 'server_started') {
          clearTimeout(timeout);
          this.childProcess?.off('message', handler);
          resolve(this.lastError
            ? ModuleResult.err<void, string>(this.lastError)
            : ModuleResult.ok<void, string>(undefined));
        } else if (message?.type === 'error') {
          clearTimeout(timeout);
          this.childProcess?.off('message', handler);
          resolve(ModuleResult.err<void, string>(message.error));
        }
      };

      this.childProcess?.on('message', handler);
    });
  }

  async close(): Promise<Result<void, string>> {
    this.lastError = undefined;
    if (!this.childProcess) {
      return ModuleResult.ok<void, string>(undefined);
    }

    return new Promise<Result<void, string>>((resolve) => {
      this.childProcess?.on('exit', () => {
        this.closed = true
        this.childProcess = undefined
        this.lastError = undefined
        resolve(ModuleResult.ok<void, string>(undefined));
      })
      this.childProcess?.kill();
    });
  }

  addRule(rule: IServerProxy["proxyRules"][0]): void {
    this.proxyRules.push(rule);
    if (this.childProcess) {
      this.childProcess.send({
        type: "addRule",
        rule,
      });
    }
  }

  closeRule(ruleId: string): void {
    for (const rule of this.proxyRules) {
      if (rule.uid === ruleId) {
        rule.closed = true;
        if (this.childProcess) {
          this.childProcess.send({
            type: "closeRule",
            ruleId,
          });
        }
      }
    }
  }

  deleteRule(ruleId: string): void {
    this.closeRule(ruleId);
    for (let i = 0; i < this.proxyRules.length; i++) {
      if (ruleId === this.proxyRules[i].uid) {
        this.proxyRules.splice(i, 1);
        if (this.childProcess) {
          this.childProcess.send({
            type: "deleteRule",
            ruleId,
          });
        }
        break;
      }
    }
  }

  async updateRule(rule: Omit<IServerProxy["proxyRules"][0], "disabled">): Promise<Result<void, string>> {
    this.lastError = undefined;
    let index: number | undefined;
    for (let i = 0; i < this.proxyRules.length; i++) {
      if (this.proxyRules[i].uid === rule.uid) {
        index = i;
        break;
      }
    }
    if (index === undefined) {
      return ModuleResult.err<void, string>("Rule not found");
    }

    // Update local rule
    const oldRule = this.proxyRules[index];
    oldRule.name = rule.name;
    oldRule.path = rule.path;
    oldRule.remoteServer = rule.remoteServer;
    this.proxyRules[index] = oldRule;

    // Close current server and wait for confirmation
    const closeResult = await this.close();
    if (closeResult.type === "err") {
      return closeResult;
    }

    // Restart server and wait for confirmation
    const openResult = await this.open();
    if (openResult.type === "err") {
      return openResult;
    }

    return ModuleResult.ok<void, string>(undefined);
  }

  openRule(ruleId: string): void {
    for (const rule of this.proxyRules) {
      if (rule.uid === ruleId) {
        rule.closed = false;
        if (this.childProcess) {
          this.childProcess.send({
            type: "openRule",
            ruleId,
          });
        }
      }
    }
  }

  toJson(): IServerProxy {
    return {
      uid: this.uid,
      name: this.name,
      port: this.port,
      closed: this.closed,
      proxyRules: this.proxyRules,
    };
  }
}
