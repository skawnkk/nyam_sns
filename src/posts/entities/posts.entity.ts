import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { BaseModel } from "src/common/entities/base.entity";
import { ImageModel } from "src/common/entities/image.entity";
import { typeValidationMessage } from "src/common/validation-message/type-validation.message";
import { UsersModel } from "src/users/entities/users.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (users) => users.posts, { nullable: false })
  @ApiProperty()
  author: UsersModel;

  @Column()
  @IsString({
    message: typeValidationMessage,
  })
  @ApiProperty()
  title: string;

  @Column({ nullable: true })
  @IsString({
    message: typeValidationMessage,
  })
  @ApiPropertyOptional()
  @IsOptional()
  subTitle?: string;

  @Column()
  @IsString({
    message: typeValidationMessage,
  })
  @ApiProperty()
  content: string;

  @Column()
  @ApiProperty()
  likeCount: number;

  @Column()
  @ApiProperty()
  commentCount: number;

  @OneToMany(() => ImageModel, (image) => image.post)
  @ApiProperty()
  images?: ImageModel[];
}
