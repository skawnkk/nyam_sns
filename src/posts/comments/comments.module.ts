import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { CommonModule } from "src/common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentModel } from "./entity/comment.entitiy";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { PostExistsMiddleware } from "./middleware/post-exists.middleware";
import { PostsModule } from "../posts.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentModel]),
    AuthModule,
    CommonModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddleware).forRoutes(CommentsController);
  }
}
