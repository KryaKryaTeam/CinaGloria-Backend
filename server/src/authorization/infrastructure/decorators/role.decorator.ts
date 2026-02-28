import { SetMetadata } from '@nestjs/common';
import { MetadataTokens } from 'src/common/Tokens';

export const Role = (...roles: string[]) => {
  SetMetadata(MetadataTokens.USER_KEY, roles);
};
