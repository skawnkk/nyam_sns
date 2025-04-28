import { Type } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CursorDto {
  @ApiPropertyOptional({ example: 123, nullable: true })
  after: number | null;
}

export function PaginatedDto<T>(model: Type<T>) {
  class PaginatedResponseDto {
    @ApiProperty({ type: [model] })
    data: T[];

    @ApiPropertyOptional({ example: 100 })
    total: number;

    @ApiPropertyOptional({ nullable: true })
    next?: string | null;

    @ApiPropertyOptional({ nullable: true })
    count?: number;

    @ApiPropertyOptional({ nullable: true, type: CursorDto })
    cursor?: {
      after: number | null;
    };
  }

  return PaginatedResponseDto;
}
