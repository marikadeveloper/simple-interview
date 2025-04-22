import { writeFileSync } from 'fs';
import { join } from 'path';
import { initializeDatabase, startServer } from '../index';
import { testConn } from './testConn';

// Export an async function for Jest's globalSetup
export default async () => {
  console.log('Global Setup: Setting up test environment...');

  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';

  try {
    // First handle the database setup - drop and recreate
    const dropConn = testConn(true); // Create connection with drop: true
    await dropConn.initialize(); // Initialize to apply dropSchema and synchronize
    console.log('Global Setup: Test database schema dropped and synchronized.');
    await dropConn.destroy(); // Close the drop connection
    console.log('Global Setup: Initial setup connection closed.');

    // Initialize the database that will be used by tests
    console.log('Global Setup: Initializing database for tests...');
    await initializeDatabase();
    console.log('Global Setup: Database initialized successfully.');

    // Start the server for all tests to use
    console.log('Global Setup: Starting server...');
    await startServer();
    console.log('Global Setup: Server started on port 4000.');

    // Write a flag file to indicate that the server and DB are ready
    writeFileSync(join(__dirname, 'test-db-initialized'), 'true', 'utf8');
  } catch (error) {
    console.error('Global Setup: Error during test environment setup:', error);
    throw error; // Throw error to signal Jest setup failure
  }
};
