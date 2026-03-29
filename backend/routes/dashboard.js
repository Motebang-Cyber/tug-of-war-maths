const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

// Leaderboard routes
router.get("/leaderboard", authenticateJWT, dashboardController.getLeaderboard);

// Current student position
router.get("/student-position", authenticateJWT, dashboardController.getStudentPosition);

// Add points after winning a game
router.post("/add-points", authenticateJWT, dashboardController.addPoints);

module.exports = router;