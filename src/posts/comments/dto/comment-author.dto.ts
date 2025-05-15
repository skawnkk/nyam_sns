// comment-author.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class CommentAuthorDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "namjoo" })
  nickname: string;

  @ApiProperty({
    example: {
      path: "/images/profile.jpg",
    },
    nullable: true,
  })
  image?: {
    path: string;
  };
}
