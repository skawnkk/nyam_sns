import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @ApiProperty({ example: "정말 유익한 글이네요!", description: "댓글 본문" })
  comments: string;
}
