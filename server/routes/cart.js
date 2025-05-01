// server/routes/cart.js
const express = require('express');
const router = express.Router();
const { getPool } = require('../db/db');

// 📦 Get cart items
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    console.log('Fetching cart for user:', userId);
    const result = await conn.execute(
      `SELECT ID, PRODUCT_NAME, PRICE, QUANTITY, IMAGE 
       FROM CART 
       WHERE USER_ID = :userId`,
      [userId]
    );
    await conn.close();

    const items = result.rows.map(row => ({
      id: row[0],
      product_name: row[1],
      price: row[2],
      quantity: row[3],
      image: row[4]
    }));

    console.log('Cart items found:', items);
    res.json(items);
  } catch (err) {
    console.error('❌ Error fetching cart:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Failed to fetch cart items', details: err.message });
  }
});

// ❌ Remove item from cart
router.delete('/delete/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    
    const result = await conn.execute(
      'DELETE FROM CART WHERE ID = :id',
      [itemId],
      { autoCommit: true }
    );

    await conn.close();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('❌ Error removing item:', err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// 🔁 Update quantity
router.post('/update-quantity', async (req, res) => {
  const { user_id, item_id, quantity } = req.body;
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    await conn.execute(
      'UPDATE CART SET QUANTITY = :qty WHERE ID = :id AND USER_ID = :userId',
      [quantity, item_id, user_id],
      { autoCommit: true }
    );
    await conn.close();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error updating quantity:', err);
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

// ➕ Add item to cart
router.post('/add', async (req, res) => {
  const { user_id, product_name, price, quantity, image } = req.body;
  
  try {
    console.log('Adding to cart:', { user_id, product_name, price, quantity, image });
    const pool = getPool();
    const conn = await pool.getConnection();
    
    // Add the item to cart
    await conn.execute(
      'INSERT INTO CART (user_id, product_name, price, quantity, image) VALUES (:userId, :productName, :price, :quantity, :image)',
      [user_id, product_name, price, quantity, image],
      { autoCommit: true }
    );
    
    await conn.close();
    console.log('Successfully added item to cart');
    res.json({ success: true, message: 'Item added to cart successfully' });
  } catch (err) {
    console.error('❌ Error adding item to cart:', err.message);
    console.error('Full error object:', err);
    res.status(500).json({ error: 'Failed to add item to cart', details: err.message });
  }
});

module.exports = router;
