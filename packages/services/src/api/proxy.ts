import type { IProxy } from "@app/shared"
import { FileProxyStore } from "../proxy/FileProxyStore.js"
import { type IBackendProxy } from "../proxy/IBackendProxy.js"
import { ModuleResult, type Result } from "mng-base/dist/result.js"


export const getProxies = async (): Promise<IBackendProxy[]> => {
  return await FileProxyStore.getInstance().listProxies()
}

export const updateProxy = async (proxy: IProxy): Promise<void> => {
  return await FileProxyStore.getInstance().updateProxy(proxy)
}

export const openProxy = async (name: string): Promise<Result<void, string>> => {
  const proxies = await FileProxyStore.getInstance().listProxies()
  const proxy = proxies.find(p => p.name === name)
  if (!proxy) {
    return ModuleResult.err<void, string>(`Proxy[${name}] not found`)
  }
  return await proxy.open()
}

export const closeProxy = async (name: string): Promise<Result<void, string>> => {
  const proxies = await FileProxyStore.getInstance().listProxies()
  const proxy = proxies.find(p => p.name === name)
  if (!proxy) {
    return ModuleResult.err<void, string>(`Proxy[${name}] not found`)
  }
  return await proxy.close()
}
