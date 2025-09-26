const express = require('express');
const { pool, redisClient } = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {}
  };

  try {
    // Check PostgreSQL
    await pool.query('SELECT 1');
    health.services.postgresql = 'connected';
  } catch (error) {
    health.services.postgresql = 'disconnected';
    health.status = 'PARTIAL';
  }

  try {
    // Check Redis
    await redisClient.ping();
    health.services.redis = 'connected';
  } catch (error) {
    health.services.redis = 'disconnected';
    health.status = 'PARTIAL';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
