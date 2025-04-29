import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { BaseModel } from "./base.entity";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { join } from "path";
import { Transform } from "class-transformer";
import {
  POST_PUBLIC_IMAGE_PATH,
  PROFILE_PUBLIC_IMAGE_PATH,
} from "../const/path.const";
import { PostsModel } from "src/posts/entities/posts.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UsersModel } from "src/users/entities/users.entity";

export enum ImageModelType {
  POST_IMAGE,
  PROFILE_IMAGE,
}

const imagePathMap = {
  [ImageModelType.POST_IMAGE]: POST_PUBLIC_IMAGE_PATH,
  [ImageModelType.PROFILE_IMAGE]: PROFILE_PUBLIC_IMAGE_PATH,
  // 추가 타입...
};

@Entity()
export class ImageModel extends BaseModel {
  @ApiPropertyOptional({
    description: "이미지 순서 (default: 0)",
    example: 1,
  })
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number;

  @ApiProperty({
    enum: ImageModelType,
    description: "이미지 타입",
    example: ImageModelType.POST_IMAGE,
  })
  @Column({
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType;

  @ApiProperty({
    description: "이미지 경로 (POST_IMAGE 타입이면 자동으로 경로 Prefix 추가)",
    example: "/public/posts/filename.jpg",
  })
  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    const basePath = imagePathMap[obj.type];
    if (basePath) {
      return `/${join(basePath, value)}`;
    } else {
      return value;
    }
  })
  path: string;

  @ApiPropertyOptional({
    description: "이미지가 소속된 게시물",
    type: () => PostsModel,
  })
  @ManyToOne(() => PostsModel, (post) => post.images, {
    onDelete: "CASCADE",
  })
  post?: PostsModel;

  @ApiPropertyOptional({
    description: "이미지가 소속된 프로필",
    type: () => UsersModel,
  })
  @OneToOne(() => UsersModel, {
    onDelete: "CASCADE",
  })
  user?: UsersModel;
}
