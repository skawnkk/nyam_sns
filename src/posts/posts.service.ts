import { Injectable, NotFoundException } from "@nestjs/common";
import { postDto } from "./posts.dto";
import { Repository } from "typeorm";
import { PostsModel } from "./entities/posts.entity";
import { InjectRepository } from "@nestjs/typeorm";

export interface PostModel {
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getPosts() {
    return this.postsRepository.find({ relations: ["author"] });
  }

  async getPost(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      relations: ["author"],
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  //data를 생성하고 저장한다.
  async postPosts({ authorId, title, content }: postDto) {
    const post = this.postsRepository.create({ author: { id: authorId }, title, content, likeCount: 0, commentCount: 0 });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  //*save -> id가 있을 때엔 수정/ id가 없으면 생성
  async putPost(id: number, title: string, content: string) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(id);

    return id;
  }
}
