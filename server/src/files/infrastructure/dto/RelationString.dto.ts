import { BadRequestException, PipeTransform } from '@nestjs/common';
import { RelationString } from 'src/files/domain/objects/RelationSlots';

export class RelationStringTransfromPipe implements PipeTransform {
  transform(value: any) {
    try {
      if (typeof value !== 'string') throw new Error('Meow!');
      console.log(value);
      return RelationString.define(value);
    } catch {
      throw new BadRequestException('Relation string is incorrect!');
    }
  }
}
