import { ApolloServer } from 'apollo-server-express';
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import path from 'path';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { DataSource } from 'typeorm';
import { __prod__, COOKIE_NAME } from './constants';
import { User } from './entities/User';
import { UserResolver } from './resolvers/user';

dotenv.config(); // Load environment variables from .env file

export let dataSource: DataSource;

const main = async () => {
  dataSource = new DataSource({
    type: 'postgres',
    database: 'simpleinterview',
    username: process.env.POSTGRES_USER, // Use environment variable
    password: process.env.POSTGRES_PASSWORD, // Use environment variable
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [User],
  });
  await dataSource.initialize();
  await dataSource.runMigrations();

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

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
  }); // start apollo server
  await apolloServer.start();

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
