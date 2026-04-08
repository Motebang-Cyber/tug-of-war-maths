// backend/routes/students.js
// ─────────────────────────────────────────────────────────────
// Routes needed by TeacherDashboard for student CRUD
// Mount in server.js: app.use("/api/students", require("./routes/students"));
// ─────────────────────────────────────────────────────────────
const express  = require("express");
const router   = express.Router();
const bcrypt   = require("bcryptjs");
const db       = require("../config/db");
const authenticateJWT = require("../middleware/authMiddleware");

// Guard — all routes teacher-only
const teacherOnly = (req, res, next) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({ message: "Teachers only" });
  next();
};

// ── PUT /api/students/:id  — update name, email, grade, optional password
router.put("/:id", authenticateJWT, teacherOnly, async (req, res) => {
  const { id } = req.params;
  const { full_name, email, grade_id, password } = req.body;

  if (!full_name || !email || !grade_id) {
    return res.status(400).json({ message: "Name, email and grade are required" });
  }
  const g = parseInt(grade_id);
  if (g < 1 || g > 7) return res.status(400).json({ message: "Grade must be 1–7" });

  try {
    if (password && password.length > 0) {
      // Update with new password
      const hash = await bcrypt.hash(password, 10);
      db.run(
        "UPDATE users SET full_name=?, email=?, grade_id=?, password_hash=? WHERE id=? AND role='student'",
        [full_name, email.toLowerCase(), g, hash, id],
        function(err) {
          if (err) return res.status(500).json({ message: err.message });
          if (this.changes === 0) return res.status(404).json({ message: "Student not found" });
          res.json({ message: "Student updated" });
        }
      );
    } else {
      // Update without touching password
      db.run(
        "UPDATE users SET full_name=?, email=?, grade_id=? WHERE id=? AND role='student'",
        [full_name, email.toLowerCase(), g, id],
        function(err) {
          if (err) return res.status(500).json({ message: err.message });
          if (this.changes === 0) return res.status(404).json({ message: "Student not found" });
          res.json({ message: "Student updated" });
        }
      );
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE /api/students/:id
router.delete("/:id", authenticateJWT, teacherOnly, (req, res) => {
  const { id } = req.params;
  db.run(
    "DELETE FROM users WHERE id=? AND role='student'",
    [id],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      if (this.changes === 0) return res.status(404).json({ message: "Student not found" });
      res.json({ message: "Student deleted" });
    }
  );
});

module.exports = router;
