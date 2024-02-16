import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { postDto } from "./posts.dto";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.getPosts();
  }

  @Get(":id")
  async getPost(@Param("id") id: string) {
    return this.postsService.getPost(+id);
  }

  @Post()
  postPosts(@Body() createPostDto: postDto) {
    return this.postsService.postPosts(createPostDto);
  }

  @Put(":id")
  putPost(@Param("id") id: string, @Body("title") title?: string, @Body("content") content?: string) {
    return this.postsService.putPost(+id, title, content);
  }

  @Delete(":id")
  deletePost(@Param("id") id: string) {
    return this.postsService.deletePost(+id);
  }
}
