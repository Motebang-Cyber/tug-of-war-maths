// databaseInit.js
const db = require("./config/db");

// Create users table (if not exists)
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student','teacher')),
  grade_id INTEGER DEFAULT NULL,
  points INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

db.run(createUsersTable, (err) => {
  if (err) console.error(err.message);
  else console.log("Users table created or already exists.");
});

// Create questions table (if not exists)
const createQuestionsTable = `
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade_id INTEGER NOT NULL CHECK(grade_id BETWEEN 1 AND 7),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

db.run(createQuestionsTable, (err) => {
  if (err) console.error(err.message);
  else console.log("Questions table created or already exists.");
});

db.close();