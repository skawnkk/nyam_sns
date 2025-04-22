import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Patch,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { UsersModel } from "src/users/entities/users.entity";
import { User } from "src/users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { ImageModelType } from "src/common/entities/image.entity";
import { QueryRunner as QR } from "typeorm";
import { PostImagesService } from "./image/images.service";
import { TransactionInterceptor } from "src/common/interceptor/transaction.interceptors";
import { QueryRunner } from "src/common/decorator/query-runner.decorator";

@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postImagesService: PostImagesService,
  ) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Get(":id")
  async getPost(@Param("id", ParseIntPipe) id: number, @QueryRunner() qr: QR) {
    return this.postsService.getPostById(id, qr);
  }

  @Post("random")
  @UseGuards(AccessTokenGuard)
  async createPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async createPost(
    @User("id", ParseIntPipe) authorId: UsersModel["id"],
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
  ) {
    // 여기서 post생성 후 에러가 생겼다면 post생성이 일어나면 안된다. > transaction
    const post = await this.postsService.createPost(authorId, body, qr);

    for (let i = 0; i < body.images.length, i++; ) {
      await this.postImagesService.createPostImage(
        {
          order: i,
          type: ImageModelType.POST_IMAGE,
          path: body.images[i],
          post,
        },
        qr,
      ); // post 생성 전 이미지 생성 (temp > public/post path로 이동)
    }

    return this.postsService.getPostById(post.id, qr); // 최신값을 가져오는 경우에도 에러가 날수 있어 qr 전달
  }

  @Patch(":id")
  @UseGuards(AccessTokenGuard)
  patchPost(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.patchPost(id, body);
  }

  @Delete(":id")
  @UseGuards(AccessTokenGuard)
  deletePost(@Param("id", ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
