import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards, Patch, Query } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { UsersModel } from "src/users/entities/users.entity";
import { User } from "src/users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { ImageModelType } from "src/common/entities/image.entity";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
    const post = await this.postsService.createPost(authorId, body);

    for (let i = 0; i < body.images.length, i++; ) {
      await this.postsService.createPostImage({ order: i, type: ImageModelType.POST_IMAGE, path: body.images[i], post }); // post 생성 전 이미지 생성 (temp > public/post path로 이동)
    }

    return this.postsService.getPostById(post.id);
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
