import { FindManyOptions } from "typeorm";
import { CommentModel } from "../entity/comment.entitiy";

export const DEFAULT_COMMENT_FIND_OPTIONS: FindManyOptions<CommentModel> = {
  relations: {
    author: true,
  },
  select: {
    author: {
      id: true,
      nickname: true,
    },
  },
};
