import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Leaderboard from "./pages/Leaderboard";
import TugOfWarGame from "./pages/TugOfWarGame";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ Game Routes */}
      <Route
        path="/game/:matchId"
        element={
          <ProtectedRoute role="student">
            <TugOfWarGame />
          </ProtectedRoute>
        }
      />

      {/* ✅ Backward compatible game route */}
      <Route
        path="/tugOfWarGame"
        element={
          <ProtectedRoute role="student">
            <TugOfWarGame />
          </ProtectedRoute>
        }
      />

      {/* ✅ Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ Shared Routes */}
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* ✅ 404 Page */}
      <Route
        path="*"
        element={
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
          >
            <div className="text-center p-5">
              <h1 className="display-4">404 - Page Not Found</h1>
              <p className="lead">Go back to login</p>
              <a href="/" className="btn btn-primary btn-lg">
                Login
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;