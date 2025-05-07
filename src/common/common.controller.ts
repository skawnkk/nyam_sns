import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CommonService } from "./common.service";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";

@Controller("common")
export class CommonController {
  constructor(private readonly commonService: CommonService) {}
  @Post("image")
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor("image"))
  @ApiOperation({
    summary: "이미지 업로드",
    description: "Blob 이미지를 업로드합니다.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "업로드된 파일 이름 반환",
    schema: {
      type: "object",
      properties: {
        fileName: { type: "string" },
      },
    },
  })
  postImage(@UploadedFile() file: Express.Multer.File) {
    return { fileName: file.filename };
  }
}
