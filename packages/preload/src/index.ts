import {ipcRenderer} from 'electron';

export {sha256sum} from './nodeCrypto.js';
export {versions} from './versions.js';
export * from './proxy.ts'
export * from './server-proxy.ts'


export function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

