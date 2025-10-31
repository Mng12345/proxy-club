import type * as api from '@app/services'
import { ipcRenderer } from 'electron'

type Api = typeof api

export const rePkgDifyPlugin: Api['rePkgDifyPlugin'] = (filePath, platform) => {
  return ipcRenderer.invoke('rePkgDifyPlugin', filePath, platform)
}

export type Platform = api.Platform
