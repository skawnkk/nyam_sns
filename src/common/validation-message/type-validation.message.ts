import { ValidationArguments } from "class-validator";

export const typeValidationMessage = ({ property }: ValidationArguments) => {
  return `${property}은(는) 문자열 이어야 합니다.`;
};
