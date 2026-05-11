import { IHashService } from 'src/authorization/application/bounds/IHashService';
import * as bcrypt from 'bcrypt';

export class HashService implements IHashService {
  hash(data: string): string {
    return bcrypt.hashSync(data, 10);
  }

  compare(data: string, hashedData: string): boolean {
    return bcrypt.compareSync(data, hashedData);
  }
}
