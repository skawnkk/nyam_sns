import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional } from "class-validator";

export class PaginatePostDto {
  //   @Type(() => Number) // query를 사용하기 때문에 string으로 들어온 값을 number로 변환
  @IsOptional()
  @IsNumber()
  where__id_more_than?: number;

  @IsIn(["ASC", "DESC"])
  @IsOptional()
  order__createdAt: "ASC" | "DESC" = "DESC";

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  take: number = 20;
}
