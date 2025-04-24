import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PostsModule } from "./posts/posts.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsModel } from "./posts/entities/posts.entity";
import { UsersModule } from "./users/users.module";
import { UsersModel } from "./users/entities/users.entity";
import { AuthModule } from "./auth/auth.module";
import { CommonModule } from "./common/common.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from "./common/const/env-keys.const";
import { ServeStaticModule } from "@nestjs/serve-static";
import { PUBLIC_FOLDER_PATH } from "./common/const/path.const";
import { ImageModel } from "./common/entities/image.entity";
import { LogMiddleware } from "./common/middleware/log.middleware";
import { ChatsModule } from "./chats/chats.module";
import { ChatsModel } from "./chats/entities/chats.entity";
import { MessagesModel } from "./chats/messages/entities/messasges.entity";

@Module({
  imports: [
    PostsModule,
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH, // RootPath만 지정시 localhost:3000/posts/image.jpg 으로 접근 가능 > 단점: api endpoint와 충돌 가능
      serveRoot: "/public", //localhost:3000/public/posts/image.jpg 으로 접근 가능 > serveRoot를 지정하여서 api 주소와 차이를 줄 수 있도록 설정
    }),
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true, //app module에서만 등록해도되도록
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_DB_PORT_KEY]),
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      entities: [PostsModel, UsersModel, ImageModel, ChatsModel, MessagesModel],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})

// 로그모니터링 서비스 및 파일을 생성한다거나, 보안 요소 개발을 미들웨어에서 처리
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
