import { IsNumber, IsString } from "class-validator";
import { BaseModel } from "src/common/entities/base.entity";
import { PostsModel } from "src/posts/entities/posts.entity";
import { UsersModel } from "src/users/entities/users.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class CommentModel extends BaseModel {
  @ManyToOne(() => PostsModel, (post) => post.comments)
  post: PostsModel;

  @ManyToOne(() => UsersModel, (author) => author.postComments)
  author: UsersModel;

  @Column()
  @IsString()
  comments: string;

  @Column({ default: 0 })
  @IsNumber()
  likeCount: number;
}
