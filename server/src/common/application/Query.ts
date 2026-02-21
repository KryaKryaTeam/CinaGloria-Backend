import { Inject, Injectable } from '@nestjs/common';
import { BaseTokens } from '../Tokens';
import type { IDBContext } from './IDBcontext';

@Injectable()
export abstract class Query<Data, Result> {
  @Inject(BaseTokens.DBContext)
  protected DBContext: IDBContext;

  async execute(data: Data): Promise<Result> {
    return await this.implementation(data);
  }

  abstract implementation(data: Data): Promise<Result>;
}
