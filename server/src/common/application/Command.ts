import { Inject, Injectable } from '@nestjs/common';
import type { IDBContext } from './IDBcontext';
import { BaseTokens } from '../Tokens';

@Injectable()
export abstract class Command<Data, Result> {
  @Inject(BaseTokens.DBContext)
  protected DBContext: IDBContext;

  async execute(data: Data): Promise<Result> {
    await this.DBContext.startTransaction();

    try {
      const result = await this.implementation(data);
      await this.DBContext.commitTransaction();

      return result;
    } catch (err) {
      await this.DBContext.rollbackTransaction();
      throw err;
    }
  }
  abstract implementation(data: Data): Promise<Result>;
}
