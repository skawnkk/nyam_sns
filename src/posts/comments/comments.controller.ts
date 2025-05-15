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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { User } from "src/users/decorator/user.decorator";
import { UsersModel } from "src/users/entities/users.entity";
import { DEFAULT_COMMENT_FIND_OPTIONS } from "./const/default-comment-find-options.conts";
import { CommentsPaginateResponseDto } from "./dto/paginate-response.dto";
import { BasePaginationDto } from "src/common/dto/base-pagination.dto";

@ApiTags("Comments") // Swagger 그룹명
@Controller("/posts/:postId/comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: "댓글 목록 조회" })
  @ApiOkResponse({ type: CommentsPaginateResponseDto })
  paginateComments(
    @Param("postId", ParseIntPipe) postId: number,
    @Query() query: BasePaginationDto,
  ) {
    return this.commentsService.paginateComments(query, postId, {
      ...DEFAULT_COMMENT_FIND_OPTIONS,
    });
  }

  @Get(":commentId")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "단일 댓글 조회" })
  getComment(
    @Param("postId", ParseIntPipe) postId: number, // ✅ 명시 필요
    @Param("commentId", ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "댓글 생성" })
  postComment(
    @Param("postId", ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @User() user: UsersModel,
  ) {
    return this.commentsService.createComment({ dto, postId, user });
  }

  @Delete(":commentId")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "댓글 삭제" })
  deleteComment(
    @Param("postId", ParseIntPipe) postId: number, // ✅ 명시 필요
    @Param("commentId", ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.deleteComment(commentId);
  }
}
