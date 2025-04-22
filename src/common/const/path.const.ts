import { join } from "path";

// 프로젝트 루트
export const PROJECT_ROOT_PATH = process.cwd();

// 외부에서 접근 가능한 파일들을 모아둔 폴더명
export const PUBLIC_FOLDER_NAME = "public";

// 포스트 이미지 저장 폴더명
export const POSTS_FOLDER_NAME = "posts";

// 임시 폴더 이름
export const TEMP_FOLDER_NAME = "temp";

// 실제 공개폴더의 절대경로 /{프로젝트 위치}/public
export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);

// 포스트 이미지를 저장할 폴더 /{프로젝트의 위치}/public/posts
export const POST_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, POSTS_FOLDER_NAME);

// 임시 파일들을 저장할 폴더 (모듈에 Multer가 등록되지 않은 상태 > 1차적으로 임시폴더에 저장)
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_NAME, TEMP_FOLDER_NAME);

// 절대경로 x
// 포스트 이미지 경로 ex: {프론트서버주소}/public/posts/xxx.jpg
export const POST_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  POSTS_FOLDER_NAME,
);

// 임시 이미지 경로
export const TEMP_IMAGE_PATH = join(PUBLIC_FOLDER_NAME, TEMP_FOLDER_NAME);
