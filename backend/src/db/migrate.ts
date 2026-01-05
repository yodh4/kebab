import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kebab';

// Create a migration client
const migrationClient = postgres(connectionString, { max: 1 });

async function runMigration() {
  console.log('⏳ Running migrations...');

  const db = drizzle(migrationClient);

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('✅ Migrations completed');

  await migrationClient.end();
}

runMigration().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
