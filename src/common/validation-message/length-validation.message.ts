import { ValidationArguments } from "class-validator";

export const lengthValidationMessage = ({ value, constraints, property }: ValidationArguments) => {
  if (value.length < 2) {
    return `${property}은(는) ${constraints[0]}글자 이상이어야 합니다.`;
  } else {
    return `${property}은(는) ${constraints[0]}~${constraints[1]}글자 사이어야 합니다.`;
  }
};
