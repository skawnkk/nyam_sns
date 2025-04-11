import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BaseModel } from "./base.entity";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { join } from "path";
import { Transform } from "class-transformer";
import { POST_IMAGE_PATH, POST_PUBLIC_IMAGE_PATH } from "../const/path.const";
import { PostModel } from "src/posts/posts.service";
import { PostsModel } from "src/posts/entities/posts.entity";

export enum ImageModelType {
  POST_IMAGE,
}

@Entity()
export abstract class ImageModel extends BaseModel {
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number;

  @Column({
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImageModelType.POST_IMAGE) {
      return value && join(POST_IMAGE_PATH, value);
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne((type) => PostsModel, (post) => post.images)
  post?: PostModel;
}
