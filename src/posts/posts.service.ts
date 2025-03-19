import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { PostsModel } from "./entities/posts.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { CommonService } from "src/common/common.service";

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
    private readonly commonService: CommonService,
  ) {}

  async getPosts() {
    return this.postsRepository.find({ relations: ["author"] });
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      this.postPosts(userId, { title: `title${i}`, content: `content${i}` });
    }
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(dto, this.postsRepository, { relations: ["author"] }, "posts");
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
  async postPosts(authorId: number, body: CreatePostDto, image?: string) {
    const post = this.postsRepository.create({
      author: { id: authorId },
      ...body,
      likeCount: 0,
      commentCount: 0,
      image,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  //*put:save -> id가 있을 때엔 수정/ id가 없으면 생성
  //*patch:save -> id가 있을 때엔 수정/ 아니면 에러
  async patchPost(id: number, { content, title }: UpdatePostDto) {
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
