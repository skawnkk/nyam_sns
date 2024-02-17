import { PostsModel } from "../entities/posts.entity";
import { PickType } from "@nestjs/mapped-types";

//dto와 api가 1:1이 아닐 수 있어 일반적인 naming을 사용한다.

//Pick, Omit, Partial-> type반환
//PickType, OmitType, PartialType => 값을 반환
export class CreatePostDto extends PickType(PostsModel, ["title", "content"]) {}
