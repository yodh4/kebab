import { db } from './client';
import { boards, columns, tasks } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create a sample board
    const [board] = await db
      .insert(boards)
      .values({
        title: 'My First Board',
      })
      .returning();

    console.log('✅ Created board:', board.title);

    // Create three columns
    const columnsData = [
      { boardId: board.id, title: 'To Do', order: 0 },
      { boardId: board.id, title: 'In Progress', order: 1 },
      { boardId: board.id, title: 'Done', order: 2 },
    ];

    const createdColumns = await db.insert(columns).values(columnsData).returning();

    console.log('✅ Created columns:', createdColumns.map((c) => c.title).join(', '));

    // Create sample tasks
    const tasksData = [
      {
        columnId: createdColumns[0].id,
        title: 'Setup project repository',
        description: 'Initialize the project with all necessary configuration',
        order: 0,
      },
      {
        columnId: createdColumns[0].id,
        title: 'Design database schema',
        description: 'Create tables for boards, columns, and tasks',
        order: 1,
      },
      {
        columnId: createdColumns[1].id,
        title: 'Implement backend API',
        description: 'Build REST API endpoints with Hono',
        order: 0,
      },
      {
        columnId: createdColumns[1].id,
        title: 'Build frontend UI',
        description: 'Create React components for the kanban board',
        order: 1,
      },
      {
        columnId: createdColumns[2].id,
        title: 'Write documentation',
        description: 'Document the project setup and architecture',
        order: 0,
      },
    ];

    const createdTasks = await db.insert(tasks).values(tasksData).returning();

    console.log('✅ Created tasks:', createdTasks.length);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
