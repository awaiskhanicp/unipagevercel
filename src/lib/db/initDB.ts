import fs from "fs";
import path from "path";
import pool from "./db";

const createTables = fs.readFileSync(path.join(process.cwd(), "src/lib/db/tables.sql"), "utf-8");

async function initDB() {
  try {
    await pool.query(createTables);
    console.log("Tables created successfully");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    pool.end();
  }
}

initDB();
