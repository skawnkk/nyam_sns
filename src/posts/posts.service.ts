import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { PostsModel } from "./entities/posts.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { CommonService } from "src/common/common.service";
import { basename, join } from "path";
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from "src/common/const/path.const";
import { promises } from "fs";
import { ImageModel } from "src/common/entities/image.entity";
import { DEFAULT_POST_FIND_OPTIONS } from "./const/default-post-find-options.const";
import { CreatePostImageDto } from "./image/dto/create-image.dto";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,

    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  async getPosts() {
    return this.postsRepository.find({ ...DEFAULT_POST_FIND_OPTIONS });
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      this.createPost(userId, { title: `title${i}`, content: `content${i}`, images: [] });
    }
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(dto, this.postsRepository, { ...DEFAULT_POST_FIND_OPTIONS }, "posts");
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      ...DEFAULT_POST_FIND_OPTIONS,
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPostImage(dto: CreatePostImageDto) {
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      await promises.access(tempFilePath); // 파일에 접근 가능한지 체크
    } catch (e) {
      throw new BadRequestException("존재하지 않는 파일 입니다.");
    }

    const fileName = basename(tempFilePath);
    const postPath = join(POST_IMAGE_PATH, fileName); //public/posts/image.jpg

    // save (파일 옮기기전 에러가 있다면 처리)
    const result = await this.imageRepository.save({ ...dto });

    // 파일 옮기기 1 > 2
    await promises.rename(tempFilePath, postPath);

    return result;
  }

  //data를 생성하고 저장한다.
  async createPost(authorId: number, postDto: CreatePostDto) {
    const post = this.postsRepository.create({
      author: { id: authorId },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
      images: [], //post를 만들고 image를 생성하므로 초기값을 []로설정
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
