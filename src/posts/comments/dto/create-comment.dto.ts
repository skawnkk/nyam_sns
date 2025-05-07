import { PickType } from "@nestjs/mapped-types";
import { CommentModel } from "../entity/comment.entitiy";

export class CreateCommentDto extends PickType(CommentModel, ["comments"]) {}
