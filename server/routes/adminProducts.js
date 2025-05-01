const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getPool } = require('../db/db');
const verifyAdminToken = require('../middleware/adminAuth');

// Get all products
router.get('/', verifyAdminToken, async (req, res) => {
  let conn;
  try {
    const pool = getPool();
    conn = await pool.getConnection();
    
    const result = await conn.execute(
      `SELECT * FROM products ORDER BY id DESC`,
      [],
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

    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch products'
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

// Get single product
router.get('/:id', verifyAdminToken, async (req, res) => {
  let conn;
  try {
    const pool = getPool();
    conn = await pool.getConnection();
    
    const result = await conn.execute(
      `SELECT * FROM products WHERE id = :id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const r = result.rows[0];
    const product = {
      id: r[0],
      name: r[1],
      price: r[2],
      description: r[3],
      image: r[4],
      category: r[5],
      stock: r[6]
    };

    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
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

// Add product
router.post('/', verifyAdminToken, async (req, res) => {
  let conn;
  try {
    const { name, price, description, image, category, stock } = req.body;

    // Validate required fields
    if (!name || !price || !description || !image || !stock) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const pool = getPool();
    conn = await pool.getConnection();
    
    const result = await conn.execute(
      `INSERT INTO products (name, price, description, image, category, stock)
       VALUES (:name, :price, :description, :image, :category, :stock)
       RETURNING id INTO :id`,
      {
        name,
        price,
        description,
        image,
        category: category || null,
        stock,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: 'Product added successfully',
      productId: result.outBinds.id[0]
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to add product'
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

// Update product
router.put('/:id', verifyAdminToken, async (req, res) => {
  let conn;
  try {
    const { name, price, description, image, category, stock } = req.body;

    // Validate required fields
    if (!name || !price || !description || !image || !stock) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const pool = getPool();
    conn = await pool.getConnection();
    
    const result = await conn.execute(
      `UPDATE products 
       SET name = :name, 
           price = :price, 
           description = :description,
           image = :image, 
           category = :category, 
           stock = :stock 
       WHERE id = :id`,
      {
        name,
        price,
        description,
        image,
        category: category || null,
        stock,
        id: req.params.id
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
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

// Delete product
router.delete('/:id', verifyAdminToken, async (req, res) => {
  let conn;
  try {
    const pool = getPool();
    conn = await pool.getConnection();
    
    const result = await conn.execute(
      `DELETE FROM products WHERE id = :id`,
      [req.params.id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
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


