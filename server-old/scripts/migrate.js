import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrationsDir = path.join(__dirname, '../migrations');

async function migrate() {
  console.log('Connecting to database...');
  // Connect without database selected first to create it if it doesn't exist
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'smarter_db';
  console.log(`Ensuring database ${dbName} exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.changeUser({ database: dbName });

  console.log('Ensuring migrations table exists...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [executedMigrationsRows] = await connection.query('SELECT migration_name FROM schema_migrations');
  const executedMigrations = executedMigrationsRows.map(row => row.migration_name);

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  
  for (const file of files) {
    if (!executedMigrations.includes(file)) {
      console.log(`Executing migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      
      // Split by semicolon and execute statements sequentially (naive approach)
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      
      await connection.beginTransaction();
      try {
        for (const stmt of statements) {
          await connection.query(stmt);
        }
        await connection.query('INSERT INTO schema_migrations (migration_name) VALUES (?)', [file]);
        await connection.commit();
        console.log(`Migration ${file} executed successfully.`);
      } catch (error) {
        await connection.rollback();
        console.error(`Error executing migration ${file}:`, error);
        process.exit(1);
      }
    } else {
      console.log(`Skipping migration ${file} (already executed).`);
    }
  }

  console.log('All migrations executed successfully.');
  await connection.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
