// backend/routes/questions.js
const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authMiddleware");
const db = require("../config/db");

// -------------------- GET RANDOM QUESTION --------------------
// Public route: students can fetch a random question per grade
router.get("/random", authenticateJWT, (req, res) => {
  const grade = parseInt(req.query.grade);
  if (!grade || grade < 1 || grade > 7) {
    return res.status(400).json({ error: "Valid grade (1-7) is required" });
  }

  const query = `
    SELECT * FROM questions
    WHERE grade_id = ?
    ORDER BY RANDOM()
    LIMIT 1
  `;

  db.get(query, [grade], (err, row) => {
    if (err) {
      console.error("DB error fetching random question:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) return res.status(404).json({ error: "No question found for this grade" });

    res.json({ question: row });
  });
});

// -------------------- GET ALL QUESTIONS --------------------
// Protected: only teachers
router.get("/", authenticateJWT, (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { grade, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = "SELECT * FROM questions";
  const params = [];

  if (grade) {
    query += " WHERE grade_id = ?";
    params.push(grade);
  }

  if (search) {
    query += params.length ? " AND question LIKE ?" : " WHERE question LIKE ?";
    params.push(`%${search}%`);
  }

  query += " ORDER BY id ASC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ questions: rows });
  });
});

// -------------------- ADD QUESTION --------------------
// Only teachers can add questions
router.post("/", authenticateJWT, (req, res) => {
  if (req.user.role !== "teacher") return res.status(403).json({ error: "Access denied" });

  const { grade_id, question, answer } = req.body;
  if (!grade_id || !question || !answer || grade_id < 1 || grade_id > 7) {
    return res.status(400).json({ error: "Grade, question, and answer are required" });
  }

  const query = "INSERT INTO questions (grade_id, question, answer) VALUES (?, ?, ?)";
  db.run(query, [grade_id, question, answer], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Question added", question_id: this.lastID });
  });
});

// -------------------- UPDATE QUESTION --------------------
router.put("/:id", authenticateJWT, (req, res) => {
  if (req.user.role !== "teacher") return res.status(403).json({ error: "Access denied" });

  const questionId = req.params.id;
  const { grade_id, question, answer } = req.body;

  if (!grade_id || !question || !answer || grade_id < 1 || grade_id > 7) {
    return res.status(400).json({ error: "Grade, question, and answer are required" });
  }

  const query = "UPDATE questions SET grade_id = ?, question = ?, answer = ? WHERE id = ?";
  db.run(query, [grade_id, question, answer, questionId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Question updated" });
  });
});

// -------------------- DELETE QUESTION --------------------
router.delete("/:id", authenticateJWT, (req, res) => {
  if (req.user.role !== "teacher") return res.status(403).json({ error: "Access denied" });

  const questionId = req.params.id;
  const query = "DELETE FROM questions WHERE id = ?";
  db.run(query, [questionId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Question deleted" });
  });
});

module.exports = router;