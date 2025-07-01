import type { IServerProxy } from "@app/shared";
import type { IBackendServerProxy } from "./IBackendServerProxy.js";
import { SimpleBackendServerProxy } from "./SimpleBackendServerProxy.js";
import { app } from "electron";
import path from "path";
import * as fsp from "fs/promises";
import { FileUtils } from "../utils/index.js";

export class ServerProxyStore {
  static instance: ServerProxyStore | undefined;
  static getInstance(): ServerProxyStore {
    if (!ServerProxyStore.instance) {
      ServerProxyStore.instance = new ServerProxyStore();
    }
    return ServerProxyStore.instance;
  }

  private static fileName = "server-proxies.txt";

  private constructor() {}

  private proxies: IBackendServerProxy[] = [];
  private isLoaded = false

  async getProxies(): Promise<IBackendServerProxy[]> {
    if (!this.isLoaded) {
      await this.load()
      this.isLoaded = true
    }
    return this.proxies;
  }

  private async load() {
    const filePath = this.getFilePath();
    if (!(await FileUtils.isFileExists(filePath))) {
      const dir = FileUtils.getDir(filePath);
      await fsp.mkdir(dir, { recursive: true });
      await fsp.writeFile(filePath, "", { flag: "w", encoding: "utf-8" });
    }
    const content = await fsp.readFile(filePath, "utf-8");
    const proxies: IServerProxy[] = content
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line));
    for (const proxy of this.proxies) {
      await proxy.close();
    }
    this.proxies = [];
    for (const proxy of proxies) {
      const serverProxy = new SimpleBackendServerProxy(proxy);
      if (serverProxy.closed) {
        await serverProxy.close()
      }
      this.proxies.push(serverProxy);
    }
  }

  private async store(): Promise<void> {
    const filePath = this.getFilePath();
    const content = this.proxies.map((proxy) => JSON.stringify(proxy.toJson())).join("\n");
    await fsp.writeFile(filePath, content, { flag: "w", encoding: "utf-8" });
  }

  private getFilePath(): string {
    const userDir = app.getPath("home");
    // const userDir = './'
    return path.resolve(userDir, "proxy-club", ServerProxyStore.fileName);
  }

  async addProxy(proxy: IServerProxy) {
    const serverProxy = new SimpleBackendServerProxy(proxy);
    if (serverProxy.closed) {
      await serverProxy.close()
    }
    this.proxies.push(serverProxy);
    await this.store();
  }

  async delProxy(proxyId: string) {
    const index = this.proxies.findIndex((p) => p.uid === proxyId);
    if (index >= 0) {
      const proxy = this.proxies[index];
      await proxy.close();
      this.proxies.splice(index, 1);
    }
    await this.store();
  }

  async getProxy(proxyId: string): Promise<IBackendServerProxy | undefined> {
    return this.proxies.find((p) => p.uid === proxyId);
  }

  async openProxy(proxyId: string) {
    const proxy = await this.getProxy(proxyId);
    if (proxy) {
      await proxy.open();
    }
    await this.store();
  }

  async closeProxy(proxyId: string) {
    const proxy = await this.getProxy(proxyId);
    if (proxy) {
      await proxy.close();
    }
    await this.store();
  }

  async updateProxy(proxy: IServerProxy) {
    const oldProxy = await this.getProxy(proxy.uid);
    if (!oldProxy) {return}
    await oldProxy.close()
    const oldProxies = [...this.proxies]
    this.proxies = []
    for (const item of oldProxies) {
      if (item.uid === proxy.uid) {
        const result = new SimpleBackendServerProxy(proxy)
        if (proxy.closed) {
          const closeResult = await result.close()
          if (closeResult.type === 'err') {
            console.log(`error: `, closeResult.value)
          }
        }
        this.proxies.push(result)
      } else {
        this.proxies.push(item)
      }
    }
    await this.store()
  }
}
