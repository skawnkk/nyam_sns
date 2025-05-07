import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// posts-base.dto.ts
export class PostsDtoBase {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  subTitle?: string;
}
