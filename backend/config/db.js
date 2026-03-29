// config/db.js - ✅ PERFECT (points to ../database/game.db)
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db_name = path.join(__dirname, "../database/game.db");  // ✅ Correct path
const db = new sqlite3.Database(db_name, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

module.exports = db;
