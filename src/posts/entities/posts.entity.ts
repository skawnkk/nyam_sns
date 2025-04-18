import { Transform } from "class-transformer";
import { IsString } from "class-validator";
import { join } from "path";
import { POST_PUBLIC_IMAGE_PATH } from "src/common/const/path.const";
import { BaseModel } from "src/common/entities/base.entity";
import { ImageModel } from "src/common/entities/image.entity";
import { typeValidationMessage } from "src/common/validation-message/type-validation.message";
import { UsersModel } from "src/users/entities/users.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (users) => users.posts, { nullable: false })
  author: UsersModel;

  @Column()
  @IsString({
    message: typeValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: typeValidationMessage,
  })
  content: string;

  @Column({
    nullable: true, // 이미지가 없을 경우 null로 전달
  })
  @Transform(({ value }) => value && join(POST_PUBLIC_IMAGE_PATH, value))
  image?: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @OneToMany((type) => ImageModel, (image) => image.post)
  images?: ImageModel[];
}
