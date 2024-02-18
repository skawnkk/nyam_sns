import { Column, Entity, OneToMany } from "typeorm";
import { RolesEnum } from "../const/roles.const";
import { PostModel } from "src/posts/posts.service";
import { PostsModel } from "src/posts/entities/posts.entity";
import { BaseModel } from "src/common/entities/common.entity";
import { IsEmail, IsString, Length } from "class-validator";
import { lengthValidationMessage } from "src/common/validation-message/length-validation.message";
import { typeValidationMessage } from "src/common/validation-message/type-validation.message";
import { emailValidationMessage } from "src/common/validation-message/email-validation.message";
import { Exclude, Expose } from "class-transformer";

@Entity()
export class UsersModel extends BaseModel {
  @Length(2, 20, {
    message: lengthValidationMessage,
  })
  @IsString({
    message: typeValidationMessage,
  })
  @Column({ length: 20, unique: true })
  nickname: string;

  @IsEmail({}, { message: emailValidationMessage })
  @IsString({
    message: typeValidationMessage,
  })
  @Column({ unique: true })
  email: string;

  @Expose({ toPlainOnly: true })
  get nicknameAndEmail() {
    return `${this.nickname} ${this.email}`;
  }

  @Length(8, 20, {
    message: lengthValidationMessage,
  })
  @IsString({
    message: typeValidationMessage,
  })
  @Column()
  password: string;

  @Column({ type: "enum", enum: Object.values(RolesEnum), default: RolesEnum.USER })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostModel[];
}
