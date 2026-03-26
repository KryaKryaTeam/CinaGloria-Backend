import { forwardRef, Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens, ServiceTokens } from 'src/common/Tokens';
import { FileMapper } from './application/mappers/FileMapper';
import { LoadFileService } from './infrastructure/services/LoadFileService';
import { APP_INTERCEPTOR, DiscoveryModule } from '@nestjs/core';
import { S3LoadController } from './infrastructure/loadControllers/S3LoadController';
import { LocalLoadController } from './infrastructure/loadControllers/LocalLoadController';
import { FileRelationMapper } from './application/mappers/FileRelationMapper';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { UploadFileCommand } from './application/useCases/UploadFileCommand';
import { FileController } from './infrastructure/controller/FileController';
import { GetLinkQuery } from './application/useCases/GetLinkQuery';
import { InternalFileInterceptor } from './infrastructure/interceptors/InternalFileInterceptor';
import { LinkerApplicationService } from './application/services/Linker.appService';
import { UserCreatedHandlerFile } from './infrastructure/handlers/UserCreateHandler';
import { CompetitionsModule } from 'src/competitions/competitions.module';

const providers: Provider[] = [
  { provide: MapperTokens.FileMapper, useClass: FileMapper },
  { provide: ServiceTokens.LoadFileService, useClass: LoadFileService },
  { provide: MapperTokens.FileRelationMapper, useClass: FileRelationMapper },
  { provide: CommandTokens.UploadFileCommand, useClass: UploadFileCommand },
  { provide: CommandTokens.GetLinkQuery, useClass: GetLinkQuery },
  {
    provide: ServiceTokens.FileLinkerService,
    useClass: LinkerApplicationService,
  },

  UserCreatedHandlerFile,
  S3LoadController,
  LocalLoadController,
];

@Module({
  providers: [
    ...providers,
    { provide: APP_INTERCEPTOR, useClass: InternalFileInterceptor },
  ],
  exports: [...providers],
  imports: [
    DiscoveryModule,
    forwardRef(() => AuthorizationModule),
    CompetitionsModule,
  ],
  controllers: [FileController],
})
export class FilesModule {}
