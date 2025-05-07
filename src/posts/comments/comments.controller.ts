import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { PaginateCommentDto } from "./dto/paginate-comment.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { User } from "src/users/decorator/user.decorator";
import { UsersModel } from "src/users/entities/users.entity";
import { DEFAULT_COMMENT_FIND_OPTIONS } from "./const/default-comment-find-options.conts";

@Controller("/posts/:postId/comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  paginateComments(
    @Param("postId", ParseIntPipe) postId: number,
    @Query() query: PaginateCommentDto,
  ) {
    return this.commentsService.paginateComments(query, postId, {
      ...DEFAULT_COMMENT_FIND_OPTIONS,
    });
  }

  @Get(":commentId")
  @UseGuards(AccessTokenGuard)
  getComment(@Param("commentId", ParseIntPipe) commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postComment(
    @Param("postId", ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @User() user: UsersModel,
  ) {
    this.commentsService.createComment({ dto, postId, user });
  }

  @Delete(":commentId")
  @UseGuards(AccessTokenGuard)
  deleteComment(@Param("commentId", ParseIntPipe) commentId: number) {
    return this.commentsService.deleteComment(commentId);
  }
}
