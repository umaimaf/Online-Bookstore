const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../db/db');
const verifyAdminToken = require('../middleware/adminAuth');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.resolve(__dirname, '../../client/public/images');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        console.log('Upload path:', uploadPath); // Debug log
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Clean the filename and add timestamp to make it unique
        const cleanName = file.originalname.toLowerCase().replace(/[^a-z0-9.]/g, '-');
        const timestamp = Date.now();
        const uniqueName = `${timestamp}-${cleanName}`;
        console.log('Generated filename:', uniqueName); // Debug log
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Image upload route
router.post('/upload', verifyAdminToken, upload.single('image'), (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image' });
        }

        res.json({
            success: true,
            filename: req.file.filename,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        res.json({ 
          success: true,
            message: 'Admin login successful'
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid admin credentials'
        });
    }
});

// 🔵 Admin Change Password
router.post('/change-password', async (req, res) => {
  const { adminId, oldPassword, newPassword } = req.body;

  try {
    const conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT password FROM admins WHERE id = :id`,
      { id: adminId }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const currentPassword = result.rows[0][0];

    const match = await bcrypt.compare(oldPassword, currentPassword);

    if (!match) {
      return res.status(400).json({ error: 'Old password incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await conn.execute(
      `UPDATE admins SET password = :newPassword WHERE id = :id`,
      {
        newPassword: hashedNewPassword,
        id: adminId
      },
      { autoCommit: true }
    );

    res.json({ message: '✅ Password updated successfully' });
  } catch (err) {
    console.error('Admin password change error:', err);
    res.status(500).json({ error: 'Server error changing password' });
  }
});

// 📊 Get Dashboard Stats
router.get('/dashboard/stats', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();

        // Get total orders
        const orderResult = await conn.execute(
            'SELECT COUNT(*) as total FROM orders'
        );
        const totalOrders = orderResult.rows[0][0];

        // Get total products
        const productResult = await conn.execute(
            'SELECT COUNT(*) as total FROM products'
        );
        const totalProducts = productResult.rows[0][0];

        // Get total users
        const userResult = await conn.execute(
            'SELECT COUNT(*) as total FROM users'
        );
        const totalUsers = userResult.rows[0][0];

        res.json({
            success: true,
            totalOrders,
            totalProducts,
            totalUsers
        });

    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch dashboard statistics' 
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

// Get all messages with replies
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
                    u.username as user_name
             FROM messages m
             JOIN users u ON m.user_id = u.id
             ORDER BY m.created_at DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const messages = result.rows.map(row => ({
            id: row.ID,
            user_id: row.USER_ID,
            user_name: row.USER_NAME,
            message_content: row.MESSAGE_CONTENT,
            created_at: row.CREATED_AT
        }));

        res.json({
            success: true,
            messages: messages
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
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

// Reply to a message
router.post('/messages/:id/reply', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const { reply_content } = req.body;
        const messageId = req.params.id;

        if (!reply_content) {
            return res.status(400).json({
                success: false,
                error: 'Reply content is required'
            });
        }

        const pool = getPool();
        conn = await pool.getConnection();
        
        // Check if message exists
        const messageCheck = await conn.execute(
            'SELECT id FROM messages WHERE id = :id',
            [messageId]
        );

        if (messageCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });
        }

        // Add reply
        await conn.execute(
            `INSERT INTO message_replies (message_id, reply_content) 
             VALUES (:message_id, :content)`,
            {
                message_id: messageId,
                content: reply_content
            },
            { autoCommit: true }
        );

        res.json({
            success: true,
            message: 'Reply sent successfully'
        });
    } catch (err) {
        console.error('Error sending reply:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to send reply',
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

// Get all users
router.get('/users', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        console.log('Fetching users - starting...');
        const pool = getPool();
        conn = await pool.getConnection();
        console.log('Database connection established');
        
        const result = await conn.execute(
            `SELECT ID, USERNAME 
             FROM USERS 
             ORDER BY ID DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('Query executed, raw result:', result);
        console.log('Number of rows:', result.rows ? result.rows.length : 0);

        const users = result.rows.map(user => ({
            id: user.ID,
            username: user.USERNAME,
            total_orders: 0
        }));
        console.log('Processed users:', users);

        res.json({
            success: true,
            users: users
        });
    } catch (err) {
        console.error('Detailed error fetching users:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch users',
            details: err.message 
        });
    } finally {
        if (conn) {
            try {
                await conn.close();
                console.log('Database connection closed');
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
                    r.user_comment, 
                    r.created_at,
                    u.username as user_name,
                    o.order_status
             FROM user_reviews r
             JOIN users u ON r.user_id = u.id
             JOIN orders o ON o.user_id = r.user_id
             JOIN order_items oi ON o.id = oi.order_id AND oi.product_name = r.product_name
             WHERE o.order_status = 'delivered'
             ORDER BY r.created_at DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const reviews = result.rows.map(review => ({
            id: review.ID,
            user_id: review.USER_ID,
            user_name: review.USER_NAME,
            product_name: review.PRODUCT_NAME,
            rating: review.RATING,
            comment: review.USER_COMMENT,
            created_at: review.CREATED_AT
        }));

        res.json({
            success: true,
            reviews: reviews
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

// Delete user
router.delete('/users/:id', verifyAdminToken, async (req, res) => {
    let conn;
    try {
        const userId = req.params.id;
        console.log('Attempting to delete user:', userId);
        
        const pool = getPool();
        conn = await pool.getConnection();

        // Delete user's cart items first
        await conn.execute(
            'DELETE FROM CART WHERE USER_ID = :id',
            [userId],
            { autoCommit: true }
        );

        // Delete user's orders
        await conn.execute(
            'DELETE FROM ORDERS WHERE USER_ID = :id',
            [userId],
            { autoCommit: true }
        );

        // Delete user's messages
        await conn.execute(
            'DELETE FROM MESSAGES WHERE USER_ID = :id',
            [userId],
            { autoCommit: true }
        );

        // Finally delete the user
        const result = await conn.execute(
            'DELETE FROM USERS WHERE ID = :id',
            [userId],
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete user',
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

