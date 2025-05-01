const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔐 REGISTER
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log("📩 Register Request Received:", username);
  try {
    const hashed = await bcrypt.hash(password, 10);
    const conn = await oracledb.getConnection();

    await conn.execute(
      `INSERT INTO users (username, password) VALUES (:u, :p)`,
      { u: username, p: hashed },
      { autoCommit: true }
    );

    res.json({ message: 'Registered successfully' });

  } catch (err) {
    if (err.errorNum === 1) {
      // ORA-00001: unique constraint violated
      return res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("🔐 Login request:", username);

  try {
    const conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT id, password FROM users WHERE username = :u`,
      { u: username }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = result.rows[0][0];
    const hashedPassword = result.rows[0][1];
    const match = await bcrypt.compare(password, hashedPassword);

    if (match) {
      res.json({
        message: 'Login successful',
        id: userId
      });
    } else {
      res.status(401).json({ error: 'Incorrect password' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 👑 ADMIN LOGIN
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("👑 Admin login request:", username);

  try {
    const conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT id, password FROM admins WHERE username = :u`,
      { u: username }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const adminId = result.rows[0][0];
    const hashedPassword = result.rows[0][1];
    const match = await bcrypt.compare(password, hashedPassword);

    if (match) {
      // Generate JWT token for admin
      const token = jwt.sign({ id: adminId }, 'admin_secret_key', { expiresIn: '24h' });
      
      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        adminId
      });
    } else {
      res.status(401).json({ error: 'Incorrect password' });
    }

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

