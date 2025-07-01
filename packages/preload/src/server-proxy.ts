import { IServerProxy } from '@app/shared';
import type * as api from '@app/services'
import { ipcRenderer } from 'electron'

type Api = typeof api

export const getServerProxies: Api['getServerProxies'] = async () => {
  return ipcRenderer.invoke('getServerProxies')
}

export const closeServerProxy: Api['closeServerProxy'] = async (id: string) => {
  return ipcRenderer.invoke('closeServerProxy', id)
}

export const openServerProxy: Api['openServerProxy'] = async (uid: string) => {
  return ipcRenderer.invoke('openServerProxy', uid)
}

export const delServerProxy: Api['delServerProxy'] = async (uid: string) => {
  return ipcRenderer.invoke('delServerProxy', uid)
}

export const addServerProxy: Api['addServerProxy'] = async (options: IServerProxy) => {
  return ipcRenderer.invoke('addServerProxy', options)
}

export const updateServerProxy: Api['updateServerProxy'] = async (options: IServerProxy) => {
  return ipcRenderer.invoke('updateServerProxy', options)
}
