import type { IProxy } from "@app/shared";
import type { IProxyStore } from "./IProxyStore.js";
import {app} from 'electron'
import * as path from 'path'
import { FileUtils } from "../utils/FileUtils.js";
import * as fsp from 'fs/promises'
import { GitProxy } from "./GitProxy.js";
import type { IBackendProxy } from "./IBackendProxy.js";
import { FontendProxy } from "./FontendProxy.js";

export class FileProxyStore implements IProxyStore {

  private static instance: FileProxyStore | undefined;
  public static getInstance(): FileProxyStore {
    if (!FileProxyStore.instance) {
      FileProxyStore.instance = new FileProxyStore();
    }
    return FileProxyStore.instance;
  }

  private static fileName = 'proxies.txt'

  private proxies: IBackendProxy[] = []
  private constructor() {}

  private async load(): Promise<void> {
    const filePath = this.getFilePath()
    if (!(await FileUtils.isFileExists(filePath))) {
      const dir = FileUtils.getDir(filePath)
      await fsp.mkdir(dir, { recursive: true })
      await fsp.writeFile(filePath, '', {flag: 'w', encoding: 'utf-8'})
    }
    console.log(`Loading proxies from ${filePath}`)
    const content = await fsp.readFile(filePath, 'utf-8')
    const proxies = content.split('\n').map(line => {
      const [name, url] = line.split(',')
      return { name: (name ?? '').trim(), url: (url ?? '').trim() }
    }).filter(proxy => proxy.name)
    this.proxies = []
    for (const proxy of proxies) {
      let item: IBackendProxy | undefined
      switch (proxy.name) {
        case 'git': {
          item = new GitProxy(proxy.url)
          break
        }
        default: {
          console.log(`Unsupported proxy type: ${proxy.name}`)
          break
        }
      }
      if (item) {
        this.proxies.push(item)
      }
    }
  }

  private getFilePath(): string {
    const userDir = app.getPath('home')
    // const userDir = './'
    return path.resolve(userDir, 'proxy-club', FileProxyStore.fileName)
  }

  async listProxies(): Promise<IBackendProxy[]> {
    await this.load()
    const nameSet = new Set(this.proxies.map(proxy => proxy.name))
    if (!nameSet.has('git')) {
      const gitProxy = new GitProxy(undefined)
      this.proxies.push(gitProxy)
    }
    if (!nameSet.has('npm')) {
      const npmProxy = new FontendProxy('npm', 'https://registry.npmmirror.com')
      this.proxies.push(npmProxy)
    }
    if (!nameSet.has('yarn')) {
      const yarnProxy = new FontendProxy('yarn', 'https://registry.npmmirror.com')
      this.proxies.push(yarnProxy)
    }
    if (!nameSet.has('pnpm')) {
      const pnpmProxy = new FontendProxy('pnpm', 'https://registry.npmmirror.com')
      this.proxies.push(pnpmProxy)
    }
    await this.store()
    return this.proxies
  }

  async addProxy(proxy: IBackendProxy): Promise<void> {
    this.proxies.push(proxy)
    await this.store()
  }

  async updateProxy(proxy: IProxy): Promise<void> {
    await this.load()
    for (const item of this.proxies) {
      if (item.name === proxy.name) {
        item.update(proxy)
        console.log(`Updated proxy ${item.name} with url ${item.url}`)
        break
      }
    }
    await this.store()
  }

  private async store(): Promise<void> {
    const filePath = this.getFilePath()
    const content = this.proxies.map(proxy => `${proxy.name},${proxy.url ?? ''}`).join('\n')
    await fsp.writeFile(filePath, content, {flag: 'w', encoding: 'utf-8'})
  }

}
