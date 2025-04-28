import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CursorDto {
  @ApiPropertyOptional({ example: 123, nullable: true })
  after: number | null;
}

export class PaginateResponseDto<T = unknown> {
  @ApiPropertyOptional({ type: "array", items: { type: "object" } })
  data: T[];

  @IsNumber()
  @ApiPropertyOptional()
  total?: number;

  @ApiPropertyOptional({ type: CursorDto })
  cursor?: CursorDto;

  @IsNumber()
  @ApiPropertyOptional()
  count?: number;

  @ApiPropertyOptional()
  next?: string | null;
}
