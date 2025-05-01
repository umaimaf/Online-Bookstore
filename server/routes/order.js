// server/routes/order.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getPool } = require('../db/db');

// 📦 Place Order
router.post('/place', async (req, res) => {
    let conn;
    try {
        const { user_id, name, phone, email, address, city, country, payment_method, card_number, expiry_date, cvv, total_price, items } = req.body;

        // Validate order items
        if (!Array.isArray(items) || items.length === 0) {
            console.error('Invalid order items:', items);
            return res.status(400).json({ 
                error: 'Invalid order items. Please make sure your cart is not empty.' 
            });
        }

        // Validate required fields
        if (!user_id || !name || !total_price) {
            return res.status(400).json({ 
                error: 'Missing required fields: user_id, name, and total_price are required' 
            });
        }

        const pool = getPool();
        conn = await pool.getConnection();
        
        // 1. Insert into orders table
        const orderResult = await conn.execute(
            `INSERT INTO orders 
            (user_id, name, phone, email, address, city, country, payment_method, card_number, expiry_date, cvv, total_price) 
            VALUES 
            (:user_id, :name, :phone, :email, :address, :city, :country, :payment_method, :card_number, :expiry_date, :cvv, :total_price)
            RETURNING id INTO :id`,
            {
                user_id,
                name,
                phone: phone || '',
                email: email || '',
                address: address || '',
                city: city || '',
                country: country || '',
                payment_method: payment_method || 'cash',
                card_number: payment_method === 'credit card' ? card_number : null,
                expiry_date: payment_method === 'credit card' ? expiry_date : null,
                cvv: payment_method === 'credit card' ? cvv : null,
                total_price,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: false }
        );

        const orderId = orderResult.outBinds.id[0];
        console.log('Order created with ID:', orderId);

        // 2. Insert order items
        for (const item of items) {
            console.log('Processing item:', item);
            await conn.execute(
                `INSERT INTO order_items (order_id, product_name, quantity, price) 
                 VALUES (:order_id, :product_name, :quantity, :price)`,
                {
                    order_id: orderId,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: item.price
                },
                { autoCommit: false }
            );
        }

        // 3. Clear user's cart
        await conn.execute(
            `DELETE FROM cart WHERE user_id = :userId`,
            { userId: user_id },
            { autoCommit: false }
        );

        // 4. Commit all changes
        await conn.commit();
        
        // Send a clear success response
        res.json({ 
            success: true,
            message: "✅ Order #" + orderId + " placed successfully! Thank you for your purchase.",
            orderId,
            total: total_price
        });

    } catch (err) {
        console.error('❌ Order Place Error:', err);
        
        // Rollback on error
        if (conn) {
            try {
                await conn.rollback();
            } catch (rollbackErr) {
                console.error('Rollback Error:', rollbackErr);
            }
        }
        
        // Send a clear error message
        res.status(500).json({ 
            success: false,
            error: "Failed to place order. Please try again.",
            details: err.message,
            errorCode: err.errorNum || 'UNKNOWN'
        });

    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
});

// 📋 Get User Orders
router.get('/user/:userId', async (req, res) => {
    let conn;
    try {
        const userId = req.params.userId;
        
        // Validate user ID
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const pool = getPool();
        conn = await pool.getConnection();

        // Fetch orders with their items
        const result = await conn.execute(
            `SELECT o.id, o.name, o.phone, o.email, o.address, o.city, o.country,
                    o.payment_method, o.total_price, o.created_at, o.order_status,
                    oi.product_name, oi.quantity, oi.price
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = :userId
             ORDER BY o.created_at DESC`,
            [userId]
        );

        // Group items by order
        const orders = {};
        result.rows.forEach(row => {
            const [
                id, name, phone, email, address, city, country,
                payment_method, total_price, created_at, order_status,
                product_name, quantity, price
            ] = row;

            if (!orders[id]) {
                orders[id] = {
                    id,
                    name,
                    phone,
                    email,
                    address,
                    city,
                    country,
                    payment_method,
                    total_price,
                    created_at,
                    order_status,
                    items: []
                };
            }

            if (product_name) {  // Only add if there are items
                orders[id].items.push({
                    product_name,
                    quantity,
                    price
                });
            }
        });

        res.json({
            success: true,
            orders: Object.values(orders)
        });

    } catch (err) {
        console.error('❌ Get Orders Error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders',
            details: err.message
        });

    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
});

module.exports = router;