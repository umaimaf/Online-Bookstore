const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getPool } = require('../db/db');
const verifyAdminToken = require('../middleware/adminAuth');

// Get all orders with user details
router.get('/', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        console.log('Connected to database');
        
        // First get total orders count
        const countResult = await conn.execute(
            `SELECT COUNT(*) as total FROM orders`
        );
        const totalOrders = countResult.rows[0][0];
        console.log('Total orders:', totalOrders);

        // Then get orders with user details
        const result = await conn.execute(
            `SELECT o.id, o.user_id, o.total_price, o.order_status, o.created_at,
                    u.username as user_name
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        console.log('Orders query result:', JSON.stringify(result.rows, null, 2));

        // Get products for each order
        const orders = await Promise.all(result.rows.map(async (order) => {
            console.log('Processing order:', order.ID);
            
            const productsResult = await conn.execute(
                `SELECT p.name, oi.quantity
                 FROM order_items oi
                 JOIN products p ON oi.product_name = p.name
                 WHERE oi.order_id = :orderId`,
                { orderId: order.ID },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            console.log('Products for order', order.ID, ':', JSON.stringify(productsResult.rows, null, 2));

            return {
                id: order.ID,
                user_id: order.USER_ID,
                user_name: order.USER_NAME,
                total_amount: order.TOTAL_PRICE,
                status: order.ORDER_STATUS || 'placed',
                created_at: order.CREATED_AT,
                products: productsResult.rows.map(p => ({
                    name: p.NAME,
                    quantity: p.QUANTITY
                }))
            };
        }));

        console.log('Final orders response:', JSON.stringify(orders, null, 2));

        res.json({
            success: true,
            totalOrders,
            orders
        });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch orders'
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

// Update order status
router.put('/:id', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        // Validate status
        const validStatuses = ['received', 'dispatched', 'delivered'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }

        const pool = getPool();
        conn = await pool.getConnection();
        
        const result = await conn.execute(
            `UPDATE orders 
             SET order_status = :status 
             WHERE id = :id`,
            {
                status: status.toLowerCase(),
                id: orderId
            },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update order status'
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

// Test endpoint to check database connectivity and tables
router.get('/test', verifyAdminToken, async (req, res) => {
    try {
        // Check if tables exist
        const tableChecks = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('orders', 'order_items', 'users', 'books')
        `);

        // Check if we can count records in each table
        const counts = {};
        for (const table of ['orders', 'order_items', 'users', 'books']) {
            const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            counts[table] = parseInt(result.rows[0].count);
        }

        res.json({
            success: true,
            tables: tableChecks.rows.map(row => row.table_name),
            recordCounts: counts
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            success: false,
            error: 'Database test failed',
            details: error.message
        });
    }
});

// Get all users
router.get('/users', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        const result = await conn.execute(
            `SELECT ID, USERNAME, CREATED_AT 
             FROM USERS 
             ORDER BY ID DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log('Users query result:', result.rows);

        // Transform the response to match frontend expectations
        const users = result.rows.map(user => ({
            id: user.ID,
            username: user.USERNAME,
            created_at: user.CREATED_AT
        }));

        res.json({
            success: true,
            users: users
        });
    } catch (err) {
        console.error('Detailed error fetching users:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch users',
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

// Delete a user
router.delete('/users/:id', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        await conn.execute(
            'DELETE FROM users WHERE id = :id',
            [req.params.id]
        );
        
        await conn.commit();
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
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

// Get all reviews
router.get('/reviews', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        const result = await conn.execute(
            `SELECT r.id, 
                    r.user_id, 
                    r.product_name, 
                    r.rating, 
                    r.comment, 
                    r.created_at,
                    u.USERNAME as user_name
             FROM user_reviews r
             JOIN USERS u ON r.user_id = u.ID
             ORDER BY r.id DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log('Reviews query result:', result.rows);

        // Transform the response to match frontend expectations
        const reviews = result.rows.map(review => ({
            id: review.ID,
            user_id: review.USER_ID,
            product_name: review.PRODUCT_NAME,
            rating: review.RATING,
            comment: review.COMMENT,
            created_at: review.CREATED_AT,
            user_name: review.USER_NAME
        }));

        res.json({
            success: true,
            reviews: reviews
        });
    } catch (err) {
        console.error('Detailed error fetching reviews:', err);
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

// Delete a review
router.delete('/reviews/:id', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        await conn.execute(
            'DELETE FROM user_reviews WHERE id = :id',
            [req.params.id]
        );
        
        await conn.commit();
        
        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ error: 'Failed to delete review' });
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

// Get all messages
router.get('/messages', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        const result = await conn.execute(
            `SELECT m.id, 
                    m.user_id, 
                    m.message_content, 
                    m.created_at,
                    u.USERNAME as user_name
             FROM messages m
             JOIN USERS u ON m.user_id = u.ID
             ORDER BY m.id DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log('Messages query result:', result.rows);

        // Transform the response to match frontend expectations
        const messages = result.rows.map(msg => ({
            id: msg.ID,
            user_id: msg.USER_ID,
            message_content: msg.MESSAGE_CONTENT,
            created_at: msg.CREATED_AT,
            user_name: msg.USER_NAME
        }));

        res.json({
            success: true,
            messages: messages
        });
    } catch (err) {
        console.error('Detailed error fetching messages:', err);
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

// Delete a message
router.delete('/messages/:id', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        await conn.execute(
            'DELETE FROM messages WHERE id = :id',
            [req.params.id]
        );
        
        await conn.commit();
        
        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting message:', err);
        res.status(500).json({ error: 'Failed to delete message' });
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

