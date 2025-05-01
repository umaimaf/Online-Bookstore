// db/db.js
const oracledb = require('oracledb');
require('dotenv').config();

let pool;

async function connectDB() {
  try {
    console.log('Initializing connection with:', {
      user: process.env.DB_USER,
      connectString: process.env.DB_CONNECT,
      poolMin: 2,
      poolMax: 5,
      poolIncrement: 1
    });

    if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_CONNECT) {
      throw new Error('Missing required environment variables. Please check your .env file');
    }

    // Enable auto-commit
    oracledb.autoCommit = true;
    
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT,
      poolMin: 2,
      poolMax: 5,
      poolIncrement: 1,
      _enableStats: true,
      poolTimeout: 0,  // Don't timeout connections
      queueTimeout: 0, // Don't timeout queue requests
      poolPingInterval: 60  // Check connection validity every 60 seconds
    });
    
    // Test the connection
    console.log('Testing connection from pool...');
    const testConn = await pool.getConnection();
    console.log('Got test connection, executing query...');
    const result = await testConn.execute('SELECT USER, SYS_CONTEXT(\'USERENV\', \'SESSION_USER\') FROM DUAL');
    console.log('Connection test result:', result.rows[0]);
    await testConn.close();
    
    console.log('✅ Oracle DB Pool created and tested successfully');
    return pool;
  } catch (err) {
    console.error('❌ Error creating DB pool:', {
      errorCode: err.errorNum,
      message: err.message,
      offset: err.offset,
      details: err.toString()
    });
    throw err;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB() first.');
  }
  
  // Log pool statistics if available
  if (pool._enableStats) {
    console.log('Current pool statistics:', {
      totalConnectionRequests: pool.totalConnectionRequests,
      totalRequestsEnqueued: pool.totalRequestsEnqueued,
      totalRequestsDequeued: pool.totalRequestsDequeued,
      totalFailedRequests: pool.totalFailedRequests,
      totalRequestsRejected: pool.totalRequestsRejected,
      poolMax: pool.poolMax,
      poolMin: pool.poolMin,
      poolIncrement: pool.poolIncrement,
      poolTimeout: pool.poolTimeout,
      poolPingInterval: pool.poolPingInterval,
      connectionsInUse: pool.connectionsInUse,
      connectionsOpen: pool.connectionsOpen
    });
  }
  
  return pool;
}

module.exports = { connectDB, getPool };





