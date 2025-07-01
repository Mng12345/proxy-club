export interface IServerProxyRule {
  uid: string
  // 代理服务名称
  name: string
  // 本地路径
  path: string
  // 被代理的远程服务器
  remoteServer: string
  closed: boolean
}

export interface IServerProxy {
  uid: string
  name: string
  port: number
  closed: boolean
  proxyRules: IServerProxyRule[]
}
