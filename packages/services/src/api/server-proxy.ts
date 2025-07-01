import type { IServerProxy } from "@app/shared";
import { ServerProxyStore } from "../proxy/ServerProxyStore.js";
import { ModuleResult, type Result } from "mng-base/dist/result.js";


export const getServerProxies = async (): Promise<Result<IServerProxy[], string>> => {
  try {
    const result = (await ServerProxyStore.getInstance().getProxies()).map(p => p.toJson())
    return ModuleResult.ok<IServerProxy[], string>(result)
  } catch (e: any) {
    console.log(e)
    return ModuleResult.err<IServerProxy[], string>(e.message ?? e.msg ?? '未知异常')
  }
}

export const closeServerProxy = async (uid: string): Promise<Result<void, string>> => {
  try {
    const store = ServerProxyStore.getInstance()
    await store.closeProxy(uid)
    return ModuleResult.ok<void, string>(undefined)
  } catch (e: any) {
    console.log(e)
    return ModuleResult.err<void, string>(e.message ?? e.msg ?? '未知异常')
  }
}

export const openServerProxy = async (uid: string): Promise<Result<void, string>> => {
  try {
    const store = ServerProxyStore.getInstance()
    await store.openProxy(uid)
    return ModuleResult.ok<void, string>(undefined)
  } catch (e: any) {
    console.log(e)
    return ModuleResult.err<void, string>(e.message ?? e.msg ?? '未知异常')
  }
}

export const delServerProxy = async (uid: string): Promise<Result<void, string>> => {
  try {
    const store = ServerProxyStore.getInstance()
    await store.delProxy(uid)
    return ModuleResult.ok<void, string>(undefined)
  } catch (e: any) {
    console.log(e)
    return ModuleResult.err<void, string>(e.message ?? e.msg ?? '未知异常')
  }
}

export const addServerProxy = async (proxy: IServerProxy): Promise<Result<void, string>> => {
  try {
    const store = ServerProxyStore.getInstance()
    await store.addProxy(proxy)
    return ModuleResult.ok<void, string>(undefined)
  } catch (e: any) {
    console.log(e)
    return ModuleResult.err<void, string>(e.message ?? e.msg ?? '未知异常')
  }
}

export const updateServerProxy = async (proxy: IServerProxy): Promise<Result<void, string>> => {
  try {
    const store = ServerProxyStore.getInstance()
    await store.updateProxy(proxy)
    return ModuleResult.ok<void, string>(undefined)
  } catch (e: any) {
    console.log(e)
    return ModuleResult.err<void, string>(e.message ?? e.msg ?? '未知异常')
  }
}
