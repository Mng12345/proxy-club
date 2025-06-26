import { exec } from 'child_process';
import { ModuleResult, type Result } from 'mng-base/dist/result.js';
import type { IBackendProxy } from './IBackendProxy.js';
import type { IProxy } from '@app/shared';

export class GitProxy implements IBackendProxy {
  name: string = "git";
  url: string | undefined;

  constructor(url: string | undefined) {
    this.url = url;
  }

  async open(): Promise<Result<void, string>> {
    if (this.url === undefined || this.url.trim() === '') {
      return ModuleResult.err<void, string>(`git proxy地址为空`)
    }
    return new Promise((resolve, reject) => {
      exec(`git config --global http.proxy ${this.url} && git config --global https.proxy ${this.url}`, (err, stdout, stderr) => {
        if (err) {
          console.log(`error: `, err)
          const result = ModuleResult.err<void, string>(`设置代理失败: ${err.message}`)
          resolve(result)
        }
        const result = ModuleResult.ok<void, string>(undefined)
        resolve(result)
      })
    })
  }

  close(): Promise<Result<void, string>> {
    return new Promise((resolve, reject) => {
      exec(`git config --global --unset http.proxy && git config --global --unset https.proxy`, (err, stdout, stderr) => {
        if (err) {
          console.log(`error: `, err)
          const result = ModuleResult.err<void, string>(`设置代理失败: ${err.message}`)
          resolve(result)
        }
        const result = ModuleResult.ok<void, string>(undefined)
        resolve(result)
      })
    })
  }

  update(proxy: IProxy): void {
    this.url = (proxy.url ?? '').trim();
    this.name = (proxy.name ?? '').trim();
  }

}
