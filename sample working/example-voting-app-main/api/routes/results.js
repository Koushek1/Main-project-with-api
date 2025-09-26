const express = require('express');
const { pool, redisClient } = require('../config/database');
const router = express.Router();

// Get voting results
router.get('/', async (req, res) => {
  try {
    // Try Redis cache first
    const cachedResults = await redisClient.get('voting:results');
    
    if (cachedResults) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResults),
        source: 'cache'
      });
    }

    // If not in cache, query database
    const result = await pool.query(`
      SELECT 
        vote, 
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM votes)) as percentage
      FROM votes 
      GROUP BY vote 
      ORDER BY count DESC
    `);

    const results = result.rows;

    // Cache results for 30 seconds
    await redisClient.setex('voting:results', 30, JSON.stringify(results));

    res.json({
      success: true,
      data: results,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Get total vote count
router.get('/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM votes');
    res.json({
      success: true,
      total: parseInt(result.rows[0].total)
    });
  } catch (error) {
    console.error('Error fetching vote count:', error);
    res.status(500).json({ error: 'Failed to fetch vote count' });
  }
});

module.exports = router;
