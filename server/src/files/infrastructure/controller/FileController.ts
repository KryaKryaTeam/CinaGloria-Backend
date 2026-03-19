import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import busboy from 'busboy';
import type { Request as RequestExpress } from 'express';
import { CommandTokens } from 'src/common/Tokens';
import { UploadFileCommand } from 'src/files/application/useCases/UploadFileCommand';
import { GetLinkQuery } from 'src/files/application/useCases/GetLinkQuery';

@Controller('file')
@Secure(true)
@ApiBearerAuth('main')
export class FileController {
  @Inject(CommandTokens.UploadFileCommand)
  private readonly uploadFileCommand: UploadFileCommand;

  @Inject(CommandTokens.GetLinkQuery)
  private readonly getLinkQuery: GetLinkQuery;

  @Post('/upload')
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
  async uploadFile(@Req() req: RequestExpress) {
    const bb = busboy({
      headers: req.headers,
      limits: { files: 1 },
    });

    const pr = new Promise((resolve, reject) => {
      let fileProcessed = false;

      bb.on('file', (name, stream, info) => {
        fileProcessed = true;

        this.uploadFileCommand
          .execute({
            stream,
            mimeType: info.mimeType,
          })
          .then(resolve)
          .catch(reject);
      });

      bb.on('error', (err: Error) => reject(err));

      bb.on('finish', () => {
        if (!fileProcessed) {
          reject(new BadRequestException('No file uploaded'));
        }
      });

      req.pipe(bb);
    });

    pr.catch((err) => {
      console.log(err);
      throw err;
    });

    return await pr;
  }

  @Get('/link/:fileURL')
  async getLink(@Query('fileURL') fileUrl: string) {
    return await this.getLinkQuery.execute({ fileUrl });
  }
}
