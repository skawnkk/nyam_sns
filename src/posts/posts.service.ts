import { Injectable, NotFoundException } from "@nestjs/common";
import { QueryRunner, Repository } from "typeorm";
import { PostsModel } from "./entities/posts.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { CommonService } from "src/common/common.service";
import { DEFAULT_POST_FIND_OPTIONS } from "./const/default-post-find-options.const";
import { PaginatePostDto } from "./dto/paginate-post.dto";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async getPosts() {
    return this.postsRepository.find({ ...DEFAULT_POST_FIND_OPTIONS });
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      this.createPost(userId, {
        title: `title${i}`,
        content: `content${i}`,
        images: [],
      });
    }
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      { ...DEFAULT_POST_FIND_OPTIONS },
      "posts",
    );
  }

  async getPostById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const post = await repository.findOne({
      where: {
        id,
      },
      ...DEFAULT_POST_FIND_OPTIONS,
    });

    if (!post) {
      throw new NotFoundException(`id:${id}의 post는 존재하지 않습니다.`);
    }

    return post;
  }

  // query runner 로 부터 repository를 가져온다.
  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<PostsModel>(PostsModel)
      : this.postsRepository;
  }

  //data를 생성하고 저장한다.
  async createPost(authorId: number, postDto: CreatePostDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const post = repository.create({
      author: { id: authorId },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
      images: [], //post를 만들고 image를 생성하므로 초기값을 []로설정
    });

    const newPost = await repository.save(post);

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

  async checkPostExists(id: number) {
    const exists = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    return exists;
  }
}
