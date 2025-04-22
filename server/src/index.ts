import { ApolloServer } from 'apollo-server-express';
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { BaseEntity, DataSource } from 'typeorm'; // Import BaseEntity
import { __prod__, COOKIE_NAME } from './constants';
import { testConn } from './test-utils/testConn';
import { createSchema } from './utils/createSchema';
import { prodConn } from './utils/prodConn';

dotenv.config(); // Load environment variables from .env file

export let dataSource: DataSource;
export let app: express.Application;
export let server: any; // Express server
export let redis: Redis;

// Initialize database connection (without starting HTTP server)
export const initializeDatabase = async () => {
  // Initialize data source based on environment
  if (process.env.NODE_ENV === 'test') {
    dataSource = testConn();
  } else {
    dataSource = prodConn();
  }

  // Initialize the database connection if not already initialized
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  // Set the global TypeORM connection for all entities
  if (BaseEntity && typeof BaseEntity.useDataSource === 'function') {
    BaseEntity.useDataSource(dataSource);
  }

  return dataSource;
};

// Setup function to create and configure the application
export const setupServer = async () => {
  // Initialize database first
  await initializeDatabase();

  // Create apollo server with schema
  const apolloServer = new ApolloServer({
    schema: await createSchema(),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
  });
  await apolloServer.start();

  // create app
  app = express();
  app.set('trust proxy', 1);

  // create redis client
  redis = new Redis();
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

  return { app, apolloServer, dataSource };
};

// Start the server function - only called when running directly
export const startServer = async () => {
  const { app } = await setupServer();
  server = app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });
  return server;
};

// Close the server function
export const closeServer = async () => {
  if (server) {
    return new Promise<void>((resolve) => {
      server.close(() => {
        console.log('Server closed');
        resolve();
      });
    });
  }
};

// Only start the server if this file is run directly
if (require.main === module) {
  main();
}

// Main function for direct execution
async function main() {
  await startServer();
}
