import { IsString } from "class-validator";
import { BaseModel } from "src/common/entities/common.entity";
import { UsersModel } from "src/users/entities/users.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (users) => users.posts, { nullable: false })
  author: UsersModel;

  @Column()
  @IsString({ message: "제목은 문자열이어야 합니다." })
  title: string;

  @Column()
  @IsString({ message: "내용은 문자열이어야 합니다." })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
