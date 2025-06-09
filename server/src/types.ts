import { Request, Response } from 'express';
import { Session } from 'express-session';
import Redis from 'ioredis';
import { createUserLoader } from './loaders/createUserLoader';

export type MyContext = {
  req: Request & { session: Session & { userId?: number } };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
};
