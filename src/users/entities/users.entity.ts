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
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class UsersModel extends BaseModel {
  @ApiProperty({
    description: "닉네임 (2~20자)",
    example: "namjoo",
  })
  @Length(2, 20, {
    message: lengthValidationMessage,
  })
  @IsString({
    message: typeValidationMessage,
  })
  @Column({ length: 20, unique: true })
  nickname: string;

  @ApiProperty({
    description: "이메일 주소",
    example: "namjoo@example.com",
  })
  @IsEmail({}, { message: emailValidationMessage })
  @IsString({
    message: typeValidationMessage,
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: "닉네임과 이메일을 합친 가상 필드 (출력용)",
    example: "namjoo namjoo@example.com",
  })
  @Expose({ toPlainOnly: true })
  get nicknameAndEmail() {
    return `${this.nickname} ${this.email}`;
  }

  @ApiProperty({
    description: "비밀번호 (8~20자)",
    example: "securePassword123",
    writeOnly: true, // swagger 상에서도 입력만 가능하게 (응답에 안나오게) 표시 가능
  })
  @Length(8, 20, {
    message: lengthValidationMessage,
  })
  @IsString({
    message: typeValidationMessage,
  })
  @Column()
  @Exclude({
    toPlainOnly: true, // 응답 시 숨김
  })
  password: string;

  @ApiProperty({
    description: "사용자 권한",
    enum: RolesEnum,
    example: RolesEnum.USER,
  })
  @Column({
    type: "enum",
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @ApiProperty({
    description: "작성한 게시글 목록",
    type: () => [PostsModel],
  })
  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @ApiProperty({
    description: "참여 중인 채팅방 목록",
    type: () => [ChatsModel],
  })
  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @ApiProperty({
    description: "작성한 메시지 목록",
    type: () => [MessagesModel],
  })
  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel[];
}
