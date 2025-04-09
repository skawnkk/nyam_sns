import { IsOptional, IsString } from "class-validator";
import { PostsModel } from "../entities/posts.entity";
import { PickType } from "@nestjs/mapped-types";

//dto와 api가 1:1이 아닐 수 있어 일반적인 naming을 사용한다.

//Pick, Omit, Partial-> type반환
//PickType, OmitType, PartialType => class 반환 (dto 재사용 및 유효성 검증 유지)
export class CreatePostDto extends PickType(PostsModel, ["title", "content"]) {
  @IsString()
  @IsOptional()
  image?: string;
}
