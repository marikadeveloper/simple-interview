// src/test-utils/teardown.ts
export default async () => {
  console.log('Global Teardown: Running after all tests.');
  // No specific connection to close here, as setup/test suites handle their own.
  // This file primarily ensures Jest waits for async operations in tests/teardown to finish.
  // If other global resources were created, they would be cleaned up here.
};
