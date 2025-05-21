import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  AuthenticationError,
  AuthorizationError,
} from "../helpers/error_handler";
import { UserAccount } from "../types/auth-types";

export interface CustomJwtPayload extends JwtPayload {
  user: UserAccount;
}
export const userLoggedIn = ({ req }: { req: Request }) => {
  const { token } = req.cookies;

  const secret = process.env.JWT_SECRET!;

  if (!token) return new AuthenticationError("Not Signed In!");

  const { user } = jwt.verify(token, secret) as CustomJwtPayload;

  if (!user) return new AuthorizationError("Token Expired or Invalid!");

  return user;
};
