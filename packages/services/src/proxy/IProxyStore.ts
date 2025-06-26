import type { IProxy } from "@app/shared";

export interface IProxyStore {
  listProxies(): Promise<IProxy[]>
  addProxy(proxy: IProxy): Promise<void>
  updateProxy(proxy: IProxy): Promise<void>
}
