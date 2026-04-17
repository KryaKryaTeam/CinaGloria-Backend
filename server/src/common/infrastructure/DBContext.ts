import { Injectable } from '@nestjs/common';
import { IDBContext } from '../application/IDBcontext';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';

export const dbStorage = new AsyncLocalStorage<EntityManager>();

@Injectable()
export class DBContext implements IDBContext {
  private static readonly qrStorage = new AsyncLocalStorage<QueryRunner>();
  private _manager: EntityManager;

  constructor(private readonly datasource: DataSource) {}
  async commitTransaction() {
    const qr = DBContext.qrStorage.getStore();
    if (qr) {
      try {
        if (qr.isTransactionActive) {
          await qr.commitTransaction();
        }
      } finally {
        if (!qr.isReleased) await qr.release();
      }
    }
  }
  async rollbackTransaction() {
    const qr = DBContext.qrStorage.getStore();
    if (qr) {
      try {
        if (qr.isTransactionActive) {
          await qr.rollbackTransaction();
        }
      } finally {
        if (!qr.isReleased) await qr.release();
      }
    }
  }
  async startTransaction() {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    DBContext.qrStorage.enterWith(queryRunner);
  }

  get manager() {
    const storeManager = DBContext.qrStorage.getStore();
    if (storeManager) return storeManager.manager;

    return this.datasource.manager;
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
