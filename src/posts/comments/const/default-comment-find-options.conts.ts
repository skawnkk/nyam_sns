import { FindManyOptions } from "typeorm";
import { CommentModel } from "../entity/comment.entitiy";

export const DEFAULT_COMMENT_FIND_OPTIONS: FindManyOptions<CommentModel> = {
  relations: {
    author: {
      image: true,
    },
  },
  select: {
    author: {
      id: true,
      nickname: true,
      image: { path: true },
    },
  },
};
