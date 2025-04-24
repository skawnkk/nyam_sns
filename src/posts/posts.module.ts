import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { PostsModel } from "./entities/posts.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { LogMiddleware } from "src/common/middleware/log.middleware";
import { CommonModule } from "src/common/common.module";
import { ImageModel } from "src/common/entities/image.entity";
import { PostImagesService } from "./image/images.service";

//미들웨어는 모듈에서 등록해주고, 적용할 method, route 정보를 전달해야한다.
//가장 먼저 적용된다. (middleware > interceptors > pipe ...)

@Module({
  //NOTE: 중요_accessTokenGuard에서 사용하기 위해 AuthModule, userModel을 import
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImageModel]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostImagesService],
})
export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogMiddleware)
      .forRoutes({ path: "posts*", method: RequestMethod.ALL });
  }
}
