import { Body, Controller, Delete, Get, Request, Param, ParseIntPipe, Post, Put, UseGuards, Patch } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { UsersModel } from "src/users/entities/users.entity";
import { User } from "src/users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.getPosts();
  }

  @Get(":id")
  async getPost(@Param("id", ParseIntPipe) id: number) {
    return this.postsService.getPost(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postPosts(@User("id", ParseIntPipe) authorId: UsersModel["id"], @Body() body: CreatePostDto) {
    return this.postsService.postPosts({ authorId, body });
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
