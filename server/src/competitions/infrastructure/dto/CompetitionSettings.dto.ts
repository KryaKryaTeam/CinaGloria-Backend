import { ApiProperty } from '@nestjs/swagger';
import { CompetitionSettings } from 'src/competitions/domain/objects/CompetitionSettings';

export class CompetitionSettingsDto {
  @ApiProperty({
    type: 'object',
    description: 'Settings of competition',
    properties: Object.entries(
      CompetitionSettings.createDefaults().toJSON(),
    ).reduce((acc, [key, config]) => {
      acc[key] = {
        type: typeof config,
        default: config,
      };
      return acc;
    }, {}),
  })
  settings: Record<string, any>;

  constructor(data?: any) {
    const defaults = Object.entries(
      CompetitionSettings.createDefaults().toJSON(),
    ).reduce((acc, [key, config]) => {
      acc[key] = config;
      return acc;
    }, {});

    Object.assign(this, defaults, data);
  }
}
