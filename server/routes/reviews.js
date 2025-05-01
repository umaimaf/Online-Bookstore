const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getPool } = require('../db/db');

// Add Review
router.post('/add', async (req, res) => {
    const { user_id, product_name, rating, comment } = req.body;
    let conn;

    try {
        // Validate required fields
        if (!user_id || !product_name || !rating) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const pool = getPool();
        conn = await pool.getConnection();

        // Check if user has already reviewed this product
        const reviewCheck = await conn.execute(
            `SELECT id 
             FROM user_reviews 
             WHERE user_id = :user_id 
             AND product_name = :product_name`,
            { user_id, product_name }
        );

        if (reviewCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this product'
            });
        }

        // Add the review
        await conn.execute(
            `INSERT INTO user_reviews (user_id, product_name, rating, user_comment)
             VALUES (:user_id, :product_name, :rating, :user_comment)`,
            {
                user_id,
                product_name,
                rating,
                user_comment: comment || null
            },
            { autoCommit: true }
        );

        res.json({
            success: true,
            message: 'Review added successfully!'
        });
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to add review',
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

// Get reviews for a product
router.get('/product/:productName', async (req, res) => {
    const { productName } = req.params;
    let conn;

    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        const result = await conn.execute(
            `SELECT r.id, 
                    r.user_id, 
                    r.rating, 
                    r.user_comment, 
                    r.created_at,
                    u.username as user_name
             FROM user_reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_name = :product_name
             ORDER BY r.created_at DESC`,
            { product_name: productName },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const reviews = result.rows.map(r => ({
            id: r.ID,
            user_id: r.USER_ID,
            user_name: r.USER_NAME,
            rating: r.RATING,
            comment: r.USER_COMMENT,
            created_at: r.CREATED_AT
        }));

        res.json({
            success: true,
            reviews
        });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviews',
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

// Get reviews by user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    let conn;

    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        const result = await conn.execute(
            `SELECT r.id, 
                    r.product_name,
                    r.rating, 
                    r.user_comment, 
                    r.created_at
             FROM user_reviews r
             WHERE r.user_id = :user_id
             ORDER BY r.created_at DESC`,
            { user_id: userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const reviews = result.rows.map(r => ({
            id: r.ID,
            product_name: r.PRODUCT_NAME,
            rating: r.RATING,
            comment: r.USER_COMMENT,
            created_at: r.CREATED_AT
        }));

        res.json({
            success: true,
            reviews
        });
    } catch (err) {
        console.error('Error fetching user reviews:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user reviews',
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
