import { ApiProperty } from "@nestjs/swagger";
import { CommentAuthorDto } from "./comment-author.dto";

export class CommentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "이 글 정말 도움이 됐어요!" })
  comments: string;

  @ApiProperty({ example: 0 })
  likeCount: number;

  @ApiProperty({ type: CommentAuthorDto })
  author: CommentAuthorDto;

  @ApiProperty({ example: "2024-01-01T12:00:00.000Z" })
  createdAt: string;

  @ApiProperty({ example: "2024-01-01T12:00:00.000Z" })
  updatedAt: string;
}
