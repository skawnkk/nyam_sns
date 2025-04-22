import { BadRequestException, Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from "./common.controller";
import { MulterModule } from "@nestjs/platform-express";
import { extname, join } from "path";
import * as multer from "multer";
import { TEMP_FOLDER_PATH } from "./const/path.const";
import { v4 as uuid } from "uuid";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";

@Module({
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
  imports: [
    AuthModule,
    UsersModule,
    MulterModule.register({
      limits: {
        fileSize: 1000000, // 바이트 단위
      },
      fileFilter: (req, file, cb) => {
        const extension = extname(file.originalname); // 확장자 추출
        const acceptExtensions = [".jpg", ".jpeg", ".png"];

        if (!acceptExtensions.includes(extension)) {
          return cb(
            new BadRequestException("jpg, jpeg, png 파일만 업로드 가능합니다."),
            false,
          ); //boolean -> 파일받을지 여부
        }

        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          // 모든 이미지는 1차적으로 TEMP 폴더에 저장
          cb(null, join(TEMP_FOLDER_PATH, `${uuid()}${extname(file.originalname)}`));
        },
      }),
    }),
  ],
})
export class CommonModule {}
