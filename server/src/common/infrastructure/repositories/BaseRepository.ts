import { Inject, Injectable } from '@nestjs/common';
import type { IDBContext } from 'src/common/application/IDBcontext';
import { BaseTokens } from 'src/common/Tokens';
import { ObjectLiteral, Repository } from 'typeorm';

@Injectable()
export abstract class BaseRepository<Schema extends ObjectLiteral> {
  constructor(protected readonly _entitySchema: new () => Schema) {}

  @Inject(BaseTokens.DBContext)
  protected readonly DBContext: IDBContext;

  protected get repository(): Repository<Schema> {
    return this.DBContext.manager.getRepository(this._entitySchema);
  }
}
