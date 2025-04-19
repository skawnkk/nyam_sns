import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards, Patch, Query, InternalServerErrorException } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { UsersModel } from "src/users/entities/users.entity";
import { User } from "src/users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { ImageModelType } from "src/common/entities/image.entity";
import { DataSource } from "typeorm";
import { PostImagesService } from "./image/images.service";

@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postImagesService: PostImagesService,
  ) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Get(":id")
  async getPost(@Param("id", ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post("random")
  @UseGuards(AccessTokenGuard)
  async createPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async createPost(@User("id", ParseIntPipe) authorId: UsersModel["id"], @Body() body: CreatePostDto) {
    // 트랜잭션과 관련된 모든 쿼리를 담당할 쿼리 러너 생성
    const qr = this.dataSource.createQueryRunner();
    // 쿼리러너 연결
    await qr.connect();
    // 쿼리러너에서 트랜잭션 시작 - 트랜직션 내에서 데이터베이스 액션을 실행할 수 있음
    await qr.startTransaction();

    // 여기서 post생성 후 에러가 생겼다면 post생성이 일어나면 안된다. > transaction
    try {
      const post = await this.postsService.createPost(authorId, body, qr);

      // 예시)
      // throw new InternalServerErrorException('post등록 중 에러 발생')

      for (let i = 0; i < body.images.length, i++; ) {
        await this.postImagesService.createPostImage({ order: i, type: ImageModelType.POST_IMAGE, path: body.images[i], post }, qr); // post 생성 전 이미지 생성 (temp > public/post path로 이동)
      }
      // 변경 수용
      await qr.commitTransaction();

      return this.postsService.getPostById(post.id);
    } catch (e) {
      // 에러가 나면 트랜잭션을 종료하고 원상태로 롤백 (db에 post가 생성되지 않는다.)
      await qr.rollbackTransaction();

      throw new InternalServerErrorException("이미지 등록 중 에러 발생");
    } finally {
      // 쿼리러너 연결 종료
      await qr.release();
    }
  }

  @Patch(":id")
  @UseGuards(AccessTokenGuard)
  patchPost(@Param("id", ParseIntPipe) id: number, @Body() body: UpdatePostDto) {
    return this.postsService.patchPost(id, body);
  }

  @Delete(":id")
  @UseGuards(AccessTokenGuard)
  deletePost(@Param("id", ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
