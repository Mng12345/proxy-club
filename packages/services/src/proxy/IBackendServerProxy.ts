import { IServerProxy } from '@app/shared';
import type { Result } from 'mng-base/dist/result.js';

export interface IBackendServerProxy extends IServerProxy {
  uid: string
  open(): Promise<Result<void, string>>
  close(): Promise<Result<void, string>>
  addRule(rule: IServerProxy['proxyRules'][0]): void
  closeRule(ruleId: string): void
  deleteRule(ruleId: string): void
  updateRule(rule: Omit<IServerProxy['proxyRules'][0], 'disabled'>): void
  openRule(ruleId: string): void
  toJson(): IServerProxy
}
