import { Body, Controller, Delete, Get, Request, Param, ParseIntPipe, Post, Put, UseGuards, Patch, Query } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { UsersModel } from "src/users/entities/users.entity";
import { User } from "src/users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Get(":id")
  async getPost(@Param("id", ParseIntPipe) id: number) {
    return this.postsService.getPost(id);
  }

  @Post("random")
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postPosts(@User("id", ParseIntPipe) authorId: UsersModel["id"], @Body() body: CreatePostDto) {
    return this.postsService.postPosts(authorId, body);
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
