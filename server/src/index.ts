import { ApolloServer } from 'apollo-server-express';
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { __prod__, COOKIE_NAME } from './constants';
import { testConn } from './test-utils/testConn';
import { createSchema } from './utils/createSchema';
import { prodConn } from './utils/prodConn';

dotenv.config(); // Load environment variables from .env file

export let dataSource: DataSource;

const main = async () => {
  if (process.env.NODE_ENV === 'test') {
    dataSource = testConn();
  } else {
    dataSource = prodConn();
  }
  await dataSource.initialize();
  await dataSource.runMigrations();

  const apolloServer = new ApolloServer({
    schema: await createSchema(),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
  }); // start apollo server
  await apolloServer.start();

  // create app
  const app = express();
  app.set('trust proxy', 1);

  // create redis client
  let redis = new Redis();
  let redisStore = new RedisStore({
    client: redis,
    disableTouch: true,
  });

  // enable cors on all routes
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  // Initialize session storage.
  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        httpOnly: true, // recommended: prevent client-side JS from accessing cookie
        secure: __prod__, // set to true if using https
        sameSite: 'lax', // CSRF protection
      },
      secret: process.env.REDIS_SECRET as string, // Use environment variable
    }),
  );

  // apply middleware
  apolloServer.applyMiddleware({
    app: app as unknown as any,
    cors: false,
  });

  app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });
};
main();
