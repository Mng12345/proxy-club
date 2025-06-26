export {sha256sum} from './nodeCrypto.js';
export {versions} from './versions.js';
import {ipcRenderer} from 'electron';
import * as fsp from 'fs/promises';

export function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}
// export * from './proxy.js'
import {closeProxy, getProxies, openProxy, updateProxy} from './proxy.js'

export {
  closeProxy,
  getProxies,
  openProxy,
  updateProxy,
}

export async function readFile(path: string) {
  return await fsp.readFile(path)
}
