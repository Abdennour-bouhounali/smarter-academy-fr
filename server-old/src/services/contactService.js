import db from '../config/db.js';

export const createContact = async (contactData) => {
  const { name, email, message, classe, ville, objectif, phone } = contactData;
  const status = 'new'; // Explicitly set status to new server-side
  
  const [result] = await db.execute(
    'INSERT INTO contacts (name, email, message, classe, ville, objectif, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, email, message, classe || null, ville || null, objectif || null, phone || null, status]
  );
  
  return result.insertId;
};

export const getContacts = async () => {
  const [rows] = await db.execute('SELECT * FROM contacts ORDER BY created_at DESC');
  return rows;
};
