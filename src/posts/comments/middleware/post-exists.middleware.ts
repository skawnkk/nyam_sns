import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { PostsService } from "src/posts/posts.service";

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postServcie: PostsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException("postId 전달이 필수입니다.");
    }

    const postExists = await this.postServcie.checkPostExists(parseInt(postId));

    if (!postExists) {
      return new NotFoundException(`id:${postId} 포스트가 존재하지 않습니다.`);
    }

    next();
  }
}
