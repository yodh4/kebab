import { execSync } from 'child_process';

export const resetDatabase = () => {
  try {
    console.log('🔄 Resetting database...');
    // Execute the db:reset script from the backend workspace
    execSync('bun --filter @kebab/backend db:reset', { stdio: 'inherit' });
    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    throw error;
  }
};
