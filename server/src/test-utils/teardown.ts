// src/test-utils/teardown.ts
import { closeServer, dataSource } from '../index';

export default async () => {
  console.log('Global Teardown: Running after all tests.');

  try {
    // Close the server if it's running
    console.log('Global Teardown: Closing server...');
    await closeServer();
    console.log('Global Teardown: Server closed successfully.');

    // Close the data source if it's initialized
    if (dataSource && dataSource.isInitialized) {
      console.log('Global Teardown: Closing data source...');
      await dataSource.destroy();
      console.log('Global Teardown: Data source closed successfully.');
    }
  } catch (error) {
    console.error('Global Teardown: Error during teardown:', error);
    process.exit(1); // Force exit if cleanup fails
  }
};
