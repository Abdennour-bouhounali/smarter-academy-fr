import db from '../config/db.js';

export const getUserByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
};

export const getUserById = async (id) => {
  const [rows] = await db.execute('SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const updateLastLogin = async (id) => {
  await db.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};
