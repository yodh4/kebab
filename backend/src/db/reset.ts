import { db } from './client';
import { boards } from './schema';

async function reset() {
  console.log('🗑️ Clearing database...');
  try {
    // Delete all boards (cascades to columns and tasks)
    await db.delete(boards);
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  }
  process.exit(0);
}

reset();
