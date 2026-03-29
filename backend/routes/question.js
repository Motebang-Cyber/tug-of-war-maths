const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authMiddleware");
const questionController = require("../controllers/questionController");

/**
 * ==========================
 * Teacher-protected routes
 * ==========================
 */

// Get all questions (teacher only)
router.get("/", authenticateJWT, (req, res, next) => {
  if (req.user.role !== "teacher") return res.status(403).json({ message: "Access denied" });
  next();
}, questionController.getQuestions);

// Add a new question (teacher only)
router.post("/", authenticateJWT, (req, res, next) => {
  if (req.user.role !== "teacher") return res.status(403).json({ message: "Access denied" });
  next();
}, questionController.addQuestion);

// Update a question (teacher only)
router.put("/:id", authenticateJWT, (req, res, next) => {
  if (req.user.role !== "teacher") return res.status(403).json({ message: "Access denied" });
  next();
}, questionController.updateQuestion);

// Delete a question (teacher only)
router.delete("/:id", authenticateJWT, (req, res, next) => {
  if (req.user.role !== "teacher") return res.status(403).json({ message: "Access denied" });
  next();
}, questionController.deleteQuestion);

/**
 * ==========================
 * Student / public routes
 * ==========================
 */

// Get a random question by grade
router.get("/random", authenticateJWT, async (req, res) => {
  const grade = req.query.grade;

  if (!grade) return res.status(400).json({ message: "Grade is required" });

  try {
    const question = await questionController.getRandomQuestionByGrade(grade);
    if (!question) return res.status(404).json({ message: "No questions found for this grade" });

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;