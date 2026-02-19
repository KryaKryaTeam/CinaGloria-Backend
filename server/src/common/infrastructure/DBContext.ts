import { Injectable, Scope } from '@nestjs/common';
import { IDBContext } from '../application/IDBcontext';
import { DataSource, EntityManager } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class DBContext implements IDBContext {
  private manager: EntityManager;

  constructor(private readonly datasource: DataSource) {}
  async commitTransaction() {
    if (this.manager) {
      await this.manager.queryRunner!.commitTransaction();

      await this.manager.release();
    }
  }
  async rollbackTransaction() {
    await this.manager.queryRunner!.rollbackTransaction();

    await this.manager.release();
  }
  async startTransaction() {
    this.manager = this.datasource.createQueryRunner().manager;

    await this.manager.queryRunner!.startTransaction();
  }
}
