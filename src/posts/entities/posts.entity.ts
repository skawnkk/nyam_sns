import { IsString } from "class-validator";
import { BaseModel } from "src/common/entities/base.entity";
import { typeValidationMessage } from "src/common/validation-message/type-validation.message";
import { UsersModel } from "src/users/entities/users.entity";
import { Column, Entity, ManyToOne } from "typeorm";

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

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
