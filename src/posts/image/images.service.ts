import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageModel } from "src/common/entities/image.entity";
import { QueryRunner, Repository } from "typeorm";
import { CreatePostImageDto } from "./dto/create-image.dto";
import { basename, join } from "path";
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from "src/common/const/path.const";
import { promises } from "fs";

@Injectable()
export class PostImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      await promises.access(tempFilePath); // 파일에 접근 가능한지 체크
    } catch (e) {
      throw new BadRequestException("존재하지 않는 파일 입니다.");
    }

    const fileName = basename(tempFilePath);
    const postPath = join(POST_IMAGE_PATH, fileName);

    // save (파일 옮기기전 에러가 있다면 처리)
    const result = await repository.save({ ...dto });

    // 파일 옮기기 1 > 2 (temp -> public/posts)
    await promises.rename(tempFilePath, postPath);

    return result;
  }
}
