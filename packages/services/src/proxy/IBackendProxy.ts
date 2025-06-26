import type { IProxy } from "@app/shared";
import type { Result } from "mng-base/dist/result.js";

export interface IBackendProxy extends IProxy {
  open(): Promise<Result<void, string>>
  close(): Promise<Result<void, string>>
  update(proxy: IProxy): void
}
