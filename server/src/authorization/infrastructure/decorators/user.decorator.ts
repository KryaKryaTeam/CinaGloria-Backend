import { applyDecorators, createParamDecorator, SetMetadata } from "@nestjs/common";
import { MetadataTokens } from "src/common/Tokens";

export function Role() {
    return applyDecorators (
        SetMetadata(MetadataTokens.USER_KEY, true),
        createParamDecorator(())
    )
}