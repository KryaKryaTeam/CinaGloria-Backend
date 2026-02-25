import { Injectable } from '@nestjs/common';
import { IDBContext } from '../application/IDBcontext';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class DBContext implements IDBContext {
  private _manager: EntityManager;

  constructor(private readonly datasource: DataSource) {}
  async commitTransaction() {
    if (this._manager) {
      await this._manager.queryRunner!.commitTransaction();

      await this._manager.release();
    }
  }
  async rollbackTransaction() {
    await this._manager.queryRunner!.rollbackTransaction();

    await this._manager.release();
  }
  async startTransaction() {
    this._manager = this.datasource.createQueryRunner().manager;
    await this._manager.queryRunner!.startTransaction();
  }

  get manager() {
    return this._manager ?? this.datasource.manager;
  }
}
