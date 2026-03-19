import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Query } from '../../../common/application/Query';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import type { ILoadFileService } from '../bounds/ILoadFileService';
import type { IFileRepository } from '../bounds/IFileRepository';

interface CommandInput {
  fileUrl: string;
}

@Injectable()
export class GetLinkQuery extends Query<CommandInput, string> {
  @Inject(ServiceTokens.LoadFileService)
  private readonly loadFileService: ILoadFileService;

  @Inject(ReposTokens.FileRepository)
  private readonly fileRepository: IFileRepository;
  async implementation(data: CommandInput): Promise<string> {
    const file = await this.fileRepository.findByUrl(data.fileUrl);

    if (!file) throw new NotFoundException('File with this url is undefined!');

    return await this.loadFileService.getLink(file);
  }
}
