import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional } from "class-validator";

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  page?: number;

  //   @Type(() => Number) // query를 사용하기 때문에 string으로 들어온 값을 number로 변환
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  where__id__more_than?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  where__id__less_than?: number;

  @IsIn(["ASC", "DESC"])
  @IsOptional()
  @ApiPropertyOptional()
  order__createdAt?: "ASC" | "DESC" = "DESC";

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  take?: number = 200; // TODO: 수정
}
