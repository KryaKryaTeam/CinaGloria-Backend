import { Color } from 'src/competitions/domain/objects/Color.object';

export class PlainTaskDto {
  id: string;
  name: string;
  description: string;
  color: Color;
}
