import readline from 'readline';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  console.log('--- Create Admin Account ---');
  
  const email = await question('Email: ');
  const password = await question('Password: ');
  const firstName = await question('First Name: ');
  const lastName = await question('Last Name: ');
  
  rl.close();

  if (!email || !password || !firstName || !lastName) {
    console.error('All fields are required.');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smarter_db',
  });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    
    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, 'admin')`,
      [email, passwordHash, firstName, lastName]
    );
    
    console.log('Admin account created successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('Error: An account with this email already exists.');
    } else {
      console.error('Failed to create admin:', error);
    }
  } finally {
    await connection.end();
  }
}

createAdmin();
