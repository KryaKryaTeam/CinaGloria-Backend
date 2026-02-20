import { EntityManager } from 'typeorm';

export interface IDBContext {
  manager: EntityManager;
  startTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
}
