import 'dotenv/config';
import { Sequelize } from 'sequelize';

const required = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'] as const;
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill in your PostgreSQL credentials.',
  );
}

// Single Sequelize instance for the whole app, built entirely from env vars.
// No credentials are hardcoded here.
export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      // Enable automatic created_at / updated_at on all models.
      // underscored: true maps to snake_case column names (created_at)
      // instead of Sequelize's default camelCase (createdAt).
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  },
);

// Verifies the app can actually reach PostgreSQL. Call this on startup.
export async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:');
    console.error(error instanceof Error ? error.message : error);
    throw error;
  }
}
