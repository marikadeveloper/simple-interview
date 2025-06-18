import Redis from 'ioredis';
import { createClient } from 'redis';
import { promisify } from 'util';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

// Create Redis client for session store
export const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log('Redis max retries reached');
        return new Error('Redis max retries reached');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// Create Redis client for caching
export const redis = new Redis({
  host: redisHost,
  port: redisPort,
});

// Promisify Redis client methods
export const getAsync = promisify(redisClient.get).bind(redisClient);
export const setAsync = promisify(redisClient.set).bind(redisClient);
export const delAsync = promisify(redisClient.del).bind(redisClient);

// Handle Redis connection events
// redisClient.on('error', (err) => console.error('Redis Client Error:', err));
// redisClient.on('connect', () => console.log('Redis Client Connected'));
// redisClient.on('end', () => console.log('Redis Client Disconnected'));

// redis.on('error', (err) => console.error('Redis Error:', err));
// redis.on('connect', () => console.log('Redis Connected'));
// redis.on('end', () => console.log('Redis Disconnected'));

let isInitialized = false;

// Initialize Redis connection
export const initRedis = async () => {
  if (isInitialized) {
    console.log('Redis client already initialized');
    return;
  }

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    isInitialized = true;
    console.log('Redis client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    process.exit(1);
  }
};

// Close Redis connections
export const closeRedis = async () => {
  try {
    // Close redisClient (session store)
    if (redisClient.isOpen) {
      await redisClient.disconnect();
    }

    // Close ioredis client (caching)
    if (redis.status === 'ready') {
      redis.disconnect();
    }

    isInitialized = false;
    console.log('Redis connections closed successfully');
  } catch (error) {
    // Log but don't throw the error
    console.log('Redis cleanup completed');
  }
};
