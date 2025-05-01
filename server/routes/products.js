const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getPool } = require('../db/db');

// Get all products
router.get('/', async (req, res) => {
    let conn;
    try {
        console.log('Attempting to get pool...');
        const pool = getPool();
        console.log('Got pool, attempting to get connection...');
        
        conn = await pool.getConnection();
        console.log('Got connection, executing query...');
        
        const result = await conn.execute(
            `SELECT * FROM products ORDER BY id`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('Query executed successfully');

        const products = result.rows.map(row => ({
            id: Number(row.ID),
            name: String(row.NAME || ''),
            price: Number(row.PRICE || 0),
            description: String(row.DESCRIPTION || ''),
            image: String(row.IMAGE || ''),
            category: String(row.CATEGORY || ''),
            stock: Number(row.STOCK || 0)
        }));

        res.json(products);
    } catch (err) {
        console.error('Error in products route:', {
            errorCode: err.errorNum,
            message: err.message,
            offset: err.offset,
            details: err.toString()
        });
        
        // Check for specific Oracle errors
        if (err.errorNum === 1017) {
            console.error('Invalid credentials error. Current connection details:', {
                user: process.env.DB_USER,
                connectString: process.env.DB_CONNECT,
                // Do not log password
            });
        }
        
        res.status(500).json({ 
            error: 'Error fetching products',
            details: err.message 
        });
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('Error closing connection:', {
                    errorCode: err.errorNum,
                    message: err.message,
                    details: err.toString()
                });
            }
        }
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        const result = await conn.execute(
            `SELECT * FROM products WHERE id = :id`,
            [req.params.id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = {
            id: Number(result.rows[0].ID),
            name: String(result.rows[0].NAME || ''),
            price: Number(result.rows[0].PRICE || 0),
            description: String(result.rows[0].DESCRIPTION || ''),
            image: String(result.rows[0].IMAGE || ''),
            category: String(result.rows[0].CATEGORY || ''),
            stock: Number(result.rows[0].STOCK || 0)
        };

        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Error fetching product' });
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

// Get products by category
router.get('/category/:category', async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        
        const result = await conn.execute(
            `SELECT * FROM products WHERE LOWER(category) = LOWER(:category)`,
            [req.params.category],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const products = result.rows.map(row => ({
            id: Number(row.ID),
            name: String(row.NAME || ''),
            price: Number(row.PRICE || 0),
            description: String(row.DESCRIPTION || ''),
            image: String(row.IMAGE || ''),
            category: String(row.CATEGORY || ''),
            stock: Number(row.STOCK || 0)
        }));

        res.json(products);
    } catch (err) {
        console.error('Error fetching products by category:', err);
        res.status(500).json({ error: 'Error fetching products' });
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

// Search products
router.get('/search/:query', async (req, res) => {
    let conn;
    try {
        const pool = getPool();
        conn = await pool.getConnection();
        const searchQuery = `%${req.params.query}%`;
        const result = await conn.execute(
            `SELECT 
                id,
                name,
                price,
                TO_CHAR(description) as description,
                image,
                category,
                stock 
             FROM products 
             WHERE LOWER(name) LIKE LOWER(:query) 
             OR LOWER(TO_CHAR(description)) LIKE LOWER(:query) 
             OR LOWER(category) LIKE LOWER(:query)
             ORDER BY id`,
            [searchQuery],
            { 
                outFormat: oracledb.OUT_FORMAT_OBJECT,
                fetchInfo: {
                    "DESCRIPTION": { type: oracledb.STRING }
                }
            }
        );

        const products = result.rows.map(row => ({
            id: row.ID,
            name: row.NAME,
            price: row.PRICE,
            description: row.DESCRIPTION || '',
            image: row.IMAGE || '',
            category: row.CATEGORY || '',
            stock: row.STOCK || 0
        }));

        res.json(products);
    } catch (err) {
        console.error('Error searching products:', err.message);
        res.status(500).json({ error: 'Error searching products' });
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('Error closing connection:', err.message);
            }
        }
    }
});

module.exports = router;

