import { PartialType } from "@nestjs/mapped-types";
import { CreatePostDto } from "./create-post.dto";
import { IsOptional, IsString } from "class-validator";
import { typeValidationMessage } from "src/common/validation-message/type-validation.message";

//dto와 api가 1:1이 아닐 수 있어 일반적인 naming을 사용한다.

//Pick, Omit, Partial-> type반환
//PickType, OmitType, PartialType => 값을 반환
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsString({
    message: typeValidationMessage,
  })
  title?: string;

  @IsOptional()
  @IsString({
    message: typeValidationMessage,
  })
  content: string;
}
