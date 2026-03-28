import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  Version,
} from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import busboy from 'busboy';
import type { Request as RequestExpress } from 'express';
import { CommandTokens } from 'src/common/Tokens';
import { UploadFileCommand } from 'src/files/application/useCases/UploadFileCommand';
import { GetLinkQuery } from 'src/files/application/useCases/GetLinkQuery';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { RelationStringTransfromPipe } from '../dto/RelationString.dto';
import { ApiError, FileErrors } from 'src/error/ApiError';

@Controller('file')
@Secure()
export class FileController {
  @Inject(CommandTokens.UploadFileCommand)
  private readonly uploadFileCommand: UploadFileCommand;

  @Inject(CommandTokens.GetLinkQuery)
  private readonly getLinkQuery: GetLinkQuery;

  @Post('/upload/:relationString')
  @Version('1')
  @ApiConsumes('multipart/form-data') // Вказуємо тип контенту
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          // Назва поля, яке очікується
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @Req() req: RequestExpress,
    @Query('relationString', RelationStringTransfromPipe)
    relationString: RelationString,
  ) {
    const bb = busboy({
      headers: req.headers,
      limits: { files: 1 },
    });

    const pr = new Promise((resolve, reject) => {
      let fileProcessed = false;

      bb.on('file', (name, stream) => {
        fileProcessed = true;

        this.uploadFileCommand
          .execute({
            stream,
            relationString,
          })
          .then(({ file }) => resolve(file.toJSON))
          .catch(reject);
      });

      bb.on('error', (err: Error) => reject(err));

      bb.on('finish', () => {
        if (!fileProcessed) {
          reject(ApiError.returnNew(FileErrors.FILE_UNPROCESSED));
        }
      });

      req.pipe(bb);
    });

    return await pr;
  }

  @Get('/link/:fileURL')
  async getLink(@Query('fileURL') fileUrl: string) {
    return await this.getLinkQuery.execute({ fileUrl });
  }
}
