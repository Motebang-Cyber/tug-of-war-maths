const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("./config/db");

const app = express();

// ✅ 🔥 ALLOWED ORIGINS (LOCAL + VERCEL)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://tug-of-war-maths.vercel.app/" 
];

// ================= MIDDLEWARE =================
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("❌ Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// ================= AUTH =================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { full_name, email, password, role, grade_id } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    db.get("SELECT id FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) return res.status(500).json({ message: err.message });
      if (user) return res.status(400).json({ message: "Email already exists" });

      const password_hash = await bcrypt.hash(password, 10);

      db.run(
        `INSERT INTO users (full_name, email, password_hash, role, grade_id, points, created_at)
         VALUES (?, ?, ?, ?, ?, 0, datetime('now'))`,
        [full_name, email, password_hash, role, role === "student" ? grade_id : null],
        function(err) {
          if (err) return res.status(500).json({ message: err.message });

          res.status(201).json({
            message: "User registered successfully",
            user_id: this.lastID,
          });
        }
      );
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.id, role: user.role, grade_id: user.grade_id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          role: user.role,
          grade_id: user.grade_id,
          points: user.points,
        },
      });
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LEADERBOARD =================
app.get("/api/dashboard/leaderboard", (req, res) => {
  const { grade } = req.query;

  let query = `
    SELECT id, full_name, grade_id, points
    FROM users
    WHERE role = 'student'
  `;

  const params = [];

  if (grade) {
    query += " AND grade_id = ?";
    params.push(grade);
  }

  query += " ORDER BY points DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("❌ Leaderboard error:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    res.json({ leaderboard: rows });
  });
});

// ================= GAME =================
app.get("/api/game/question", (req, res) => {
  const { grade } = req.query;

  const query = grade
    ? "SELECT * FROM questions WHERE grade_id = ? ORDER BY RANDOM() LIMIT 1"
    : "SELECT * FROM questions ORDER BY RANDOM() LIMIT 1";

  db.all(query, grade ? [grade] : [], (err, rows) => {
    if (err || !rows[0]) {
      return res.status(404).json({ message: "No questions available" });
    }
    res.json(rows[0]);
  });
});

// ================= SOCKET =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

let onlineStudents = [];
let matches = {};

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  socket.on("student-online", (student) => {
    onlineStudents = onlineStudents.filter(s => s.studentId !== student.studentId);

    onlineStudents.push({
      socketId: socket.id,
      studentId: student.studentId,
      name: student.name,
      grade: student.grade
    });

    io.emit("update-online-students", onlineStudents);
  });

  socket.on("send-match-request", ({ to }) => {
    const from = onlineStudents.find(s => s.socketId === socket.id);
    const target = onlineStudents.find(s => s.studentId === to);

    if (from && target) {
      io.to(target.socketId).emit("match-request", {
        from: from.studentId,
        fromName: from.name
      });
    }
  });

  socket.on("respond-match-request", ({ from, accept }) => {
    const responder = onlineStudents.find(s => s.socketId === socket.id);
    const requester = onlineStudents.find(s => s.studentId === from);

    if (accept && responder && requester) {
      const matchId = `${requester.studentId}_${responder.studentId}`;

      matches[matchId] = {
        playerA: requester.studentId,
        playerB: responder.studentId,
        streakA: 0,
        streakB: 0,
        ropePosition: 0
      };

      socket.join(matchId);
      io.sockets.sockets.get(requester.socketId)?.join(matchId);

      io.to(matchId).emit("start-game", { matchId });
    }
  });

  socket.on("game-answer", ({ matchId, isCorrect }) => {
    const match = matches[matchId];
    if (!match) return;

    const player = onlineStudents.find(s => s.socketId === socket.id);
    if (!player) return;

    const isPlayerA = player.studentId === match.playerA;

    if (isCorrect) {
      if (isPlayerA) {
        match.streakA++;
        match.streakB = 0;
        match.ropePosition -= 1;
      } else {
        match.streakB++;
        match.streakA = 0;
        match.ropePosition += 1;
      }

      if (match.streakA >= 5 || match.streakB >= 5) {
        const winnerId = match.streakA >= 5 ? match.playerA : match.playerB;

        io.to(matchId).emit("game-over", { winnerId });

        db.run(
          "UPDATE users SET points = points + 3 WHERE id = ?",
          [winnerId],
          function (err) {
            if (!err) {
              io.emit("leaderboard-updated");
            }
          }
        );

        delete matches[matchId];
        return;
      }
    } else {
      if (isPlayerA) match.streakA = 0;
      else match.streakB = 0;
    }

    io.to(matchId).emit("rope-update", {
      ropePosition: match.ropePosition
    });
  });

  socket.on("disconnect", () => {
    onlineStudents = onlineStudents.filter(s => s.socketId !== socket.id);
    io.emit("update-online-students", onlineStudents);
  });
});

// ================= START =================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
