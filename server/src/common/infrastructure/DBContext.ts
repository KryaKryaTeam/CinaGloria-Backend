import { Injectable } from '@nestjs/common';
import { IDBContext } from '../application/IDBcontext';
import { DataSource, EntityManager } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';

export const dbStorage = new AsyncLocalStorage<EntityManager>();

@Injectable()
export class DBContext implements IDBContext {
  private _manager: EntityManager;

  constructor(private readonly datasource: DataSource) {}
  async commitTransaction() {
    if (this.manager) {
      await this.manager.queryRunner!.commitTransaction();

      await this.manager.release();
    }
  }
  async rollbackTransaction() {
    if (this.manager) {
      await this.manager.queryRunner!.rollbackTransaction();

      await this.manager.release();
    }
  }
  async startTransaction() {
    this._manager = this.datasource.createQueryRunner().manager;

    await this._manager.queryRunner!.startTransaction();
  }

  get manager() {
    const storeManager = dbStorage.getStore();
    if (storeManager) return storeManager;

    if (this._manager && this._manager.queryRunner?.isReleased)
      return this.datasource.manager;
    return this._manager ?? this.datasource.manager;
  }

  async isolate(fun: () => Promise<void> | void): Promise<void> {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await dbStorage.run(queryRunner.manager, async () => {
        await fun();
      });

      if (queryRunner.isTransactionActive) {
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
}
