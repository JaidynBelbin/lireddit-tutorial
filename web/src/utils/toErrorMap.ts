import { FieldError } from "../generated/graphql";

// The errors coming from our GraphQL mutation are an array of type FieldError,
// so this utility converts from that to an object.
export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};

  errors.forEach(({ field, message }) => {
    errorMap[field] = message;
  });

  return errorMap;
};
