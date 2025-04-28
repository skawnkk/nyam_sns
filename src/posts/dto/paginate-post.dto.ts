import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { BasePaginationDto } from "src/common/dto/base-pagination.dto";

export class PaginatePostDto extends BasePaginationDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  where__likeCount__more_than: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  where__title__i_like: string;
}
