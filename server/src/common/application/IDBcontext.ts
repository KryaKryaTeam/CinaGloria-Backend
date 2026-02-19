export interface IDBContext {
  startTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
}
