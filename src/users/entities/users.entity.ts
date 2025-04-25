import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { RolesEnum } from "../const/roles.const";
import { PostsModel } from "src/posts/entities/posts.entity";
import { BaseModel } from "src/common/entities/base.entity";
import { IsEmail, IsString, Length } from "class-validator";
import { lengthValidationMessage } from "src/common/validation-message/length-validation.message";
import { typeValidationMessage } from "src/common/validation-message/type-validation.message";
import { emailValidationMessage } from "src/common/validation-message/email-validation.message";
import { Exclude, Expose } from "class-transformer";
import { ChatsModel } from "src/chats/entities/chats.entity";
import { MessagesModel } from "src/chats/messages/entities/messasges.entity";

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
  @Exclude({
    toPlainOnly: true, //응답 데이터에 노출되지 않도록 처리 (직렬화) (<-> toClassOnly 요청 인스턴스에서도 숨김)
  })
  password: string;

  @Column({
    type: "enum",
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable() // ManyToMany 관계일때 둘중하나에 JoinTable 적용해서 3개의 관계를 만들어줌
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel;
}
