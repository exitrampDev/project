import { Request } from 'express';

export interface JwtUser {
  userId: string;
  email: string;
  // add more fields if your JWT contains them
}

export interface RequestWithUser extends Request {
  user: JwtUser;
}