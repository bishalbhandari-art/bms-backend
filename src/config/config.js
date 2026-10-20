'use strict';

// Config consumed by sequelize-cli (migrations / seeders).
// It is plain CommonJS (not JSON) so it can read process.env — the CLI
// never sees hardcoded credentials. The app runtime uses src/config/database.ts,
// which reads the SAME env vars, so both paths agree on one source of truth: the env.
require('dotenv').config();

const shared = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
};

module.exports = {
  development: { ...shared },
  test: { ...shared },
  production: { ...shared },
};
