import { Module, Provider } from '@nestjs/common';
import { MapperTokens, ServiceTokens } from 'src/common/Tokens';
import { FileMapper } from './application/mappers/FileMapper';
import { LoadFileService } from './infrastructure/services/LoadFileService';
import { DiscoveryModule } from '@nestjs/core';
import { S3LoadController } from './infrastructure/loadControllers/S3LoadController';
import { LocalLoadController } from './infrastructure/loadControllers/LocalLoadController';

const providers: Provider[] = [
  { provide: MapperTokens.FileMapper, useClass: FileMapper },
  { provide: ServiceTokens.LoadFileService, useClass: LoadFileService },
  S3LoadController,
  LocalLoadController,
];

@Module({
  providers,
  imports: [DiscoveryModule],
})
export class FilesModule {}
