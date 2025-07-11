const sql = require('mssql');
require('dotenv').config();

const dbConfig = require('./dbConfig');

async function testDB() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT GETDATE() AS now');
    console.log("✅ Connected! Server time:", result.recordset[0].now);
  } catch (err) {
    console.error("❌ DB Connection Failed:", err);
  }
}

testDB();
