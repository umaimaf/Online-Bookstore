const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getPool } = require('../db/db');

// Get messages for a specific user
router.get('/user/:userId', async (req, res) => {
    let conn;
    try {
        const userId = req.params.userId;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const pool = getPool();
        conn = await pool.getConnection();
        
        const result = await conn.execute(
            `SELECT m.id, 
                    m.message_content, 
                    m.created_at,
                    r.reply_content,
                    r.created_at as reply_date
             FROM messages m
             LEFT JOIN message_replies r ON m.id = r.message_id
             WHERE m.user_id = :userId
             ORDER BY m.created_at DESC`,
            [userId],
            { outFormat: oracledb.OBJECT }
        );

        const messages = result.rows.map(row => ({
            id: row.ID,
            message_content: row.MESSAGE_CONTENT,
            created_at: row.CREATED_AT,
            reply_content: row.REPLY_CONTENT,
            reply_date: row.REPLY_DATE
        }));

        res.json({
            success: true,
            messages: messages
        });
    } catch (err) {
        console.error('Error fetching user messages:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch messages',
            details: err.message 
        });
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

module.exports = router; 