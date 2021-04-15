import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

// MiddlewareFn will run before the resolver, so can do necessary checks beforehand
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Not authenticated");
  }

  return next();
};
