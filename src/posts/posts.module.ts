import {
  BadRequestException,
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
import { MulterModule } from "@nestjs/platform-express";
import { extname, join } from "path";
import * as multer from "multer";
import { POST_PUBLIC_IMAGE_PATH } from "src/common/const/path.const";
import { v4 as uuid } from "uuid";
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
    MulterModule.register({
      limits: {
        fileSize: 1000000, // 바이트 단위
      },
      fileFilter: (req, file, cb) => {
        const extension = extname(file.originalname); // 확장자 추출
        const acceptExtensions = [".jpg", "jpeg", "png"];
        if (!acceptExtensions.includes(extension)) {
          return cb(new BadRequestException("jpg, jpeg, png 파일만 업로드 가능합니다."), false); //boolean -> 파일받을지 여부
        }

        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(POST_PUBLIC_IMAGE_PATH, `${uuid()}${extname(file.originalname)}`));
        },
      }),
    }),
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
