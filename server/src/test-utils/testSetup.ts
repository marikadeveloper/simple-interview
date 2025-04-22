import { BaseEntity } from 'typeorm';
import { initializeDatabase } from '../index';

/**
 * This function ensures the database connection is established
 * Should be called at the beginning of each test file
 */
export const setupTestDB = async () => {
  try {
    // Initialize the database if needed
    const ds = await initializeDatabase();

    // Ensure BaseEntity has access to the dataSource
    if (BaseEntity && typeof BaseEntity.useDataSource === 'function') {
      BaseEntity.useDataSource(ds);
    }

    return ds;
  } catch (error) {
    console.error('Failed to initialize test database:', error);
    throw error;
  }
};
