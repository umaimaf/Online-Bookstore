// server/db/dbHelper.js
const { getPool } = require('./db');

async function saveMessageToDB(userId, messageContent) {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    const query = `INSERT INTO messages (user_id, message_content) VALUES (:user_id, :message)`;
    const result = await connection.execute(query, { user_id: userId, message: messageContent }, { autoCommit: true });
    return result;
  } catch (err) {
    console.error('❌ Database insertion error:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

module.exports = { saveMessageToDB };





