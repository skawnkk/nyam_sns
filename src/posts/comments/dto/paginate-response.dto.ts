import { PaginatedDto } from "src/common/dto/paginated-dto.factory";
import { CommentDto } from "./comment.dto";

export class CommentsPaginateResponseDto extends PaginatedDto(CommentDto) {}
