// Minimal entry point for the DB layer: load the models (which registers their
// associations) and verify the database connection on startup.
import { sequelize, Author, Category, Book } from './models/index.js';

async function main(): Promise<void> {
  await sequelize.authenticate();
  console.log('Database connected successfully');

  // Quick sanity read so the startup check proves the models map to real tables.
  const [authors, categories, books] = await Promise.all([
    Author.count(),
    Category.count(),
    Book.count(),
  ]);
  console.log(`Loaded models — authors: ${authors}, categories: ${categories}, books: ${books}`);

  await sequelize.close();
}

main().catch((error) => {
  console.error('Startup failed:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
