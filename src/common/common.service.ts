/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from "@nestjs/common";
import { BasePaginationDto } from "./dto/base-pagination.dto";
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from "typeorm";
import { BaseModel } from "./entities/base.entity";
import { FILTER_MAPPER } from "./const/filter-mapper.const";
import { ENV_HOST_KEY, ENV_PRPTOCOL_KEY } from "./const/env-keys.const";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(dto);
    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });
    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;
    const protocol = this.configService.get(ENV_PRPTOCOL_KEY);
    const host = this.configService.get(ENV_HOST_KEY);
    const nextUrl = lastItem && new URL(`${protocol}://${host}/${path}`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== "where__id__more_than" &&
            key !== "where__id__less_than"
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
      let key = null;

      if (dto.order__createdAt === "ASC") {
        key = "where__id__more_than";
      } else {
        key = "where__id__less_than";
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith("where__")) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith("order__")) {
        order = {
          ...order,
          ...this.parseWhereFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> | FindOptionsOrder<T> = {};
    const split = key.split("__");
    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `order 필터는 '__'으로 split했을때 길이가 2또는 3이어야 합니다. 문제되는 key: ${key}`,
      );
    }

    if (split.length === 2) {
      //where__id
      const [_, field] = split;
      options[field] = value;
    } else {
      //where__id__more_than
      const [_, field, operator] = split;
      const values = value.toString().split(",");
      if (operator === "between") {
        //<-필요한 경우 처리 추가
        options[field] = FILTER_MAPPER[operator](values[0], values[1]);
      } else if (operator === "i_like") {
        options[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
    }
    return options;
  }
  // private parseOrderFilter<T extends BaseModel>(key: string, value: any): FindOptionsOrder<T> {
  //   const order: FindOptionsOrder<T> = {};
  //   //order__id
  //   const split = key.split("__");
  //   if (split.length !== 2) {
  //     throw new BadRequestException(`order 필터는 '__'으로 split했을때 길이가 2여야 합니다. 문제되는 key: ${key}`);
  //   }
  //   const [_, field] = split;
  //   order[field] = value;
  //   return order;
  // }
}
