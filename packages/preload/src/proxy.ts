import { ipcRenderer } from 'electron'
import {type IProxy} from '@app/shared'
import type * as api from '@app/services'
type Api = typeof api

export const closeProxy: Api['closeProxy'] = async (name: string) => {
  return ipcRenderer.invoke('closeProxy', name)
}

export const getProxies: Api['getProxies'] = async () => {
  return ipcRenderer.invoke('getProxies')
}

export const openProxy: Api['openProxy'] = async (name: string) => {
  return ipcRenderer.invoke('openProxy', name)
}

export const updateProxy: Api['updateProxy'] = async (proxy: IProxy) => {
  return ipcRenderer.invoke('updateProxy', proxy)
}
