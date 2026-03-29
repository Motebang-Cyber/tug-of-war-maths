const db = require("../config/db");

/*
==================================================
GET Leaderboard
GET /api/dashboard/leaderboard?grade=1
==================================================
*/
exports.getLeaderboard = (req, res) => {
  const { grade } = req.query;

  let query = `
    SELECT id, full_name, grade_id, points 
    FROM users 
    WHERE role = 'student'
  `;
  const params = [];

  // Optional grade filter
  if (grade) {
    query += " AND grade_id = ?";
    params.push(grade);
  }

  query += " ORDER BY points DESC, full_name ASC LIMIT 10";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Leaderboard error:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    res.status(200).json({
      success: true,
      count: rows.length,
      leaderboard: rows,
    });
  });
};


/*
==================================================
GET Current Logged-in Student Position
GET /api/dashboard/student-position
Uses JWT user ID instead of query param
==================================================
*/
exports.getStudentPosition = (req, res) => {
  const studentId = req.user.id; // from JWT middleware

  const query = `
    SELECT id, full_name, points,
      (
        SELECT COUNT(*) + 1 
        FROM users u2 
        WHERE u2.points > u1.points 
        AND u2.role = 'student'
      ) AS rank
    FROM users u1
    WHERE id = ? AND role = 'student'
  `;

  db.get(query, [studentId], (err, row) => {
    if (err) {
      console.error("Student position error:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    if (!row) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      student: row,
    });
  });
};


/*
==================================================
Add Points to Winner
POST /api/dashboard/add-points
Body: { winnerId }
Only teacher can add points
==================================================
*/
exports.addPoints = (req, res) => {
  const { winnerId } = req.body;

  if (!winnerId) {
    return res.status(400).json({ message: "Winner ID is required" });
  }

  // Only teacher allowed
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Access denied. Teachers only." });
  }

  const query = `
    UPDATE users 
    SET points = points + 3 
    WHERE id = ? AND role = 'student'
  `;

  db.run(query, [winnerId], function (err) {
    if (err) {
      console.error("Add points error:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Points updated successfully",
    });
  });
};