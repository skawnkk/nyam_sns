import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModel } from "./entities/users.entity";
import { AuthService } from "src/auth/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { ImagesModule } from "src/common/image/images.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersModel]),
    JwtModule.register({}),
    ImagesModule,
  ],
  exports: [UsersService], //-> 다른 모듈에서 사용할 수 있도록 export
  controllers: [UsersController],
  providers: [UsersService, AuthService],
})
export class UsersModule {}
