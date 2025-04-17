import { testConn } from './testConn';

// Export an async function for Jest's globalSetup
export default async () => {
  console.log('Global Setup: Setting up test database...');
  const conn = testConn(true); // Create connection with drop: true
  try {
    await conn.initialize(); // Initialize to apply dropSchema and synchronize
    console.log('Global Setup: Test database schema dropped and synchronized.');
    await conn.destroy(); // Close the connection
    console.log('Global Setup: Setup connection closed.');
  } catch (error) {
    console.error('Global Setup: Error during test database setup:', error);
    throw error; // Throw error to signal Jest setup failure
  }
};

// Remove the direct execution logic from here
// testConn(true);
// process.exit();
