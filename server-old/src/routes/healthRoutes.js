import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Check if database is reachable
    await db.query('SELECT 1');
    
    res.status(200).json({
      success: true,
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check DB error:', error.message);
    res.status(503).json({
      success: false,
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
