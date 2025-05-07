import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { CommentModel } from "./entity/comment.entitiy";
import { CommonService } from "src/common/common.service";
import { PaginateCommentDto } from "./dto/paginate-comment.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UsersModel } from "src/users/entities/users.entity";
import { DEFAULT_COMMENT_FIND_OPTIONS } from "./const/default-comment-find-options.conts";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentModel)
    private readonly commentsRepository: Repository<CommentModel>,
    private readonly commonService: CommonService,
  ) {}
  paginateComments(
    paginateCommentDto: PaginateCommentDto,
    postId: number,
    overrideFindOptions: FindManyOptions<CommentModel>,
  ) {
    return this.commonService.paginate(
      paginateCommentDto,
      this.commentsRepository,
      overrideFindOptions,
      `/posts/${postId}/comments`,
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`id:${id}의 comment는 존재하지 않습니다.`);
    }

    return comment;
  }

  createComment({
    dto,
    postId,
    user,
  }: {
    dto: CreateCommentDto;
    postId: number;
    user: UsersModel;
  }) {
    return this.commentsRepository.save({
      ...dto,
      post: { id: postId },
      author: user,
    });
  }

  async deleteComment(id: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`id:${id}의 comment는 존재하지 않습니다.`);
    }

    await this.commentsRepository.delete(id);

    return id;
  }
}
