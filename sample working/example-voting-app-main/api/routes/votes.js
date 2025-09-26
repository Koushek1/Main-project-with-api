const express = require('express');
const { pool, redisClient } = require('../config/database');
const router = express.Router();

// Get all votes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM votes ORDER BY id DESC');
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

// Submit a vote
router.post('/', async (req, res) => {
  try {
    const { vote, voter_id } = req.body;

    if (!vote || !voter_id) {
      return res.status(400).json({ error: 'Vote and voter_id are required' });
    }

    // Insert into database
    const result = await pool.query(
      'INSERT INTO votes (vote, voter_id) VALUES ($1, $2) RETURNING *',
      [vote, voter_id]
    );

    // Update Redis cache
    await redisClient.incr(`vote:${vote}`);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Vote submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// Get vote by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM votes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching vote:', error);
    res.status(500).json({ error: 'Failed to fetch vote' });
  }
});

module.exports = router;
