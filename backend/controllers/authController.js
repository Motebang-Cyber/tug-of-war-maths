const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// -----------------------------
// REGISTER USER
// -----------------------------
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role, grade_id } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Student must have valid grade
    if (role === "student") {
      if (!grade_id || grade_id < 1 || grade_id > 7) {
        return res.status(400).json({
          message: "Student grade must be between 1 and 7",
        });
      }
    }

    // Check if email exists
    db.get("SELECT id FROM users WHERE email = ?", [email], async (err, existingUser) => {
      if (err) return res.status(500).json({ message: err.message });

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users (full_name, email, password_hash, role, grade_id, points)
        VALUES (?, ?, ?, ?, ?, 0)
      `;

      db.run(
        insertQuery,
        [full_name, email, password_hash, role, role === "student" ? grade_id : null],
        function (err2) {
          if (err2) return res.status(500).json({ message: err2.message });

          res.status(201).json({
            message: "User registered successfully",
            user_id: this.lastID,
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// LOGIN USER
// -----------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) return res.status(500).json({ message: err.message });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          grade_id: user.grade_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          grade_id: user.grade_id,
          points: user.points,
        },
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};