import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Leaderboard from "./pages/Leaderboard";
import GlobalLeaderboard from "./pages/GlobalLeaderboard";
import TugOfWarGame from "./pages/TugOfWarGame";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"         element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Student ── */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Game (two paths for backward compat) ── */}
      <Route
        path="/game/:matchId"
        element={
          <ProtectedRoute role="student">
            <TugOfWarGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tugOfWarGame"
        element={
          <ProtectedRoute role="student">
            <TugOfWarGame />
          </ProtectedRoute>
        }
      />

      {/* ── Teacher ── */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Leaderboards ── */}
      <Route path="/leaderboard"        element={<Leaderboard />} />
      <Route path="/global-leaderboard" element={<GlobalLeaderboard />} />

      {/* ── 404 ── */}
      <Route
        path="*"
        element={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #1e3a8a, #7c3aed)",
              fontFamily: "'Fredoka One', cursive",
              color: "white",
              gap: "16px",
            }}
          >
            <div style={{ fontSize: "80px" }}>🤔</div>
            <h1 style={{ fontSize: "48px", margin: 0 }}>404</h1>
            <p style={{ fontSize: "22px", opacity: 0.8 }}>Oops! Page not found</p>
            <a
              href="/"
              style={{
                padding: "12px 32px",
                background: "#fbbf24",
                color: "#1e293b",
                borderRadius: "16px",
                textDecoration: "none",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              🏠 Go Home
            </a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
