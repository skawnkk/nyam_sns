import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserProfileDto } from "./dto/update-user.dto";
import { QueryRunner } from "src/common/decorator/query-runner.decorator";
import { QueryRunner as QR } from "typeorm";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { TransactionInterceptor } from "src/common/interceptor/transaction.interceptors";
import { ImagesService } from "src/common/image/images.service";
import { ImageModelType } from "src/common/entities/image.entity";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly imageService: ImagesService,
  ) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(":id")
  getUser(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getUser(id);
  }

  @Patch(":id")
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async updateUser(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserProfileDto,
    @QueryRunner() qr: QR,
  ) {
    const user = await this.usersService.updateUser(updateUserDto, id, qr);
    await this.imageService.createPostImage(
      {
        order: 0,
        type: ImageModelType.PROFILE_IMAGE,
        path: updateUserDto.image,
        user,
      },
      qr,
    );

    return this.usersService.getUser(user.id, qr); // 최신값을 가져오는 경우에도 에러가 날수 있어 qr 전달
  }
}
