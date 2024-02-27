import { Injectable, NotFoundException } from "@nestjs/common";
import { LessThan, MoreThan, Repository } from "typeorm";
import { PostsModel } from "./entities/posts.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/patinate-post.dto";
import { ConfigService } from "@nestjs/config";
import { ENV_HOST_KEY, ENV_PRPTOCOL_KEY } from "src/common/const/env-keys.const";

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
    private readonly configService: ConfigService,
  ) {}

  async getPosts() {
    return this.postsRepository.find({ relations: ["author"] });
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      this.postPosts(userId, { title: `title${i}`, content: `content${i}` });
    }
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    const { page, take, order__createdAt } = dto;

    const [posts, count] = await this.postsRepository.findAndCount({
      order: { createdAt: order__createdAt },
      take,
      skip: (page - 1) * take,
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDto) {
    const { where__id_more_than, order__createdAt, take } = dto;
    const whereIdMoreThan = where__id_more_than ?? 0; //naming - underscore 2개 - 다음객채의 속성을 참조한다.
    const posts = await this.postsRepository.find({
      where: {
        id: order__createdAt === "ASC" ? MoreThan(whereIdMoreThan) : LessThan(whereIdMoreThan),
      },
      order: {
        createdAt: order__createdAt,
      },
      take,
      relations: ["author"],
    });

    const lastItem = posts.length > 0 && posts.length === take ? posts[posts.length - 1] : null;
    const protocol = this.configService.get(ENV_PRPTOCOL_KEY);
    const host = this.configService.get(ENV_HOST_KEY);
    const nextUrl = lastItem && new URL(`${protocol}://${host}/posts`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== "where__id_more_than") {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
      nextUrl.searchParams.append("where__id_more_than", lastItem.id.toString());
    }
    return {
      data: posts,
      count: posts.length,
      cursor: {
        after: lastItem?.id ?? null,
      },
      next: nextUrl?.toString() ?? null,
    };
  }

  async paginatePosts(dto: PaginatePostDto) {
    if (dto.page) {
      return this.pagePaginatePosts(dto);
    } else {
      return this.cursorPaginatePosts(dto);
    }
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
  async postPosts(authorId: number, body: CreatePostDto) {
    const post = this.postsRepository.create({
      author: { id: authorId },
      ...body,
      likeCount: 0,
      commentCount: 0,
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
