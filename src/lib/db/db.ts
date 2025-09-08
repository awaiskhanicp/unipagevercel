import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

if (process.env.NODE_ENV !== "production") {
  (async () => {
    try {
      const conn = await pool.getConnection();
      console.log("✅ Database connected successfully:", process.env.DB_NAME);
      conn.release();
    } catch (err) {
      console.error("❌ Database connection failed:", err);
    }
  })();
}

export default pool;
