import { PostsModel } from "../entities/posts.entity";
import { PaginatedDto } from "src/common/dto/paginated-dto.factory";

export class PostsPaginateResponseDto extends PaginatedDto(PostsModel) {}
