import { ValidationArguments } from "class-validator";

export const emailValidationMessage = ({ property }: ValidationArguments) => {
  return `${property}은(는) 이메일 형식이어야 합니다.`;
};
