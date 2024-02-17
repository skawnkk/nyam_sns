import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { PostsModel } from "./entities/posts.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel]), AuthModule, UsersModule], //NOTE: 중요_accessTokenGuard에서 사용하기 위해 AuthModule, userModel을 import
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
