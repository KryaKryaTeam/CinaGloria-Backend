import { Injectable } from "@nestjs/common";
import { Mapper } from "src/common/infrastructure/Mapper";

@Injectable()
export class RoundMapper extend Mapper<RoundSchema, RoundEntity>{
    public toEntity(schema: RoundSchema) {

    }

    
}