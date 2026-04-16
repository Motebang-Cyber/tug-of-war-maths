import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/login-bg.png";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [gradeId, setGradeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validate grade for students
    if (role === "student") {
      const g = parseInt(gradeId);
      if (!gradeId || g < 1 || g > 7) {
        setError("Please select your grade (1–7)");
        return;
      }
    }

    setLoading(true);

    try {
      await API.post("/auth/register", {
        full_name: fullName,
        email,
        password,
        role,
        grade_id: role === "student" ? parseInt(gradeId) : null,
      });

      setSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "'Fredoka One', 'Nunito', cursive",
      }}
    >
      {/* Google Font import via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

        .register-card {
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8) translateY(30px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .funky-input {
          border: 3px solid #e0e0e0;
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 16px;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          background: #fffdf5;
        }
        .funky-input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 4px rgba(245,158,11,0.2);
          background: #fff;
        }

        .funky-select {
          border: 3px solid #e0e0e0;
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 16px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          width: 100%;
          cursor: pointer;
          outline: none;
          appearance: none;
          background: #fffdf5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f59e0b' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 16px center;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .funky-select:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 4px rgba(245,158,11,0.2);
        }

        .grade-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          margin-top: 4px;
        }

        .grade-btn {
          aspect-ratio: 1;
          border: 3px solid #e0e0e0;
          border-radius: 12px;
          background: #fffdf5;
          font-family: 'Fredoka One', cursive;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
        }
        .grade-btn:hover {
          border-color: #f59e0b;
          background: #fef3c7;
          transform: scale(1.08);
        }
        .grade-btn.selected {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
          transform: scale(1.12);
          box-shadow: 0 4px 12px rgba(245,158,11,0.4);
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-family: 'Fredoka One', cursive;
          font-size: 22px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 6px 0 #047857;
          position: relative;
          top: 0;
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #34d399, #10b981);
          top: 2px;
          box-shadow: 0 4px 0 #047857;
        }
        .submit-btn:active:not(:disabled) {
          top: 5px;
          box-shadow: 0 1px 0 #047857;
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .role-toggle {
          display: flex;
          background: #f3f4f6;
          border-radius: 14px;
          padding: 4px;
          gap: 4px;
        }
        .role-option {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 11px;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #888;
        }
        .role-option.active {
          background: white;
          color: #f59e0b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }

        .success-pop {
          animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes successPop {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }

        .field-label {
          font-family: 'Fredoka One', cursive;
          font-size: 15px;
          color: #6b7280;
          margin-bottom: 6px;
          display: block;
        }
      `}</style>

      <div
        className="register-card"
        style={{
          maxWidth: "440px",
          width: "94%",
          backgroundColor: "rgba(255,255,255,0.97)",
          borderRadius: "28px",
          padding: "36px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 4px rgba(245,158,11,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "52px", lineHeight: 1 }}>🪢</div>
          <h2
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: "30px",
              color: "#1f2937",
              margin: "8px 0 4px",
            }}
          >
            Join the Fun!
          </h2>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "#9ca3af", fontSize: "15px", margin: 0 }}>
            Create your account to start playing 🎮
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div
            className="success-pop"
            style={{
              textAlign: "center",
              padding: "30px",
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              borderRadius: "20px",
            }}
          >
            <div style={{ fontSize: "60px" }}>🎉</div>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", color: "#065f46", marginTop: "10px" }}>
              You're In!
            </h3>
            <p style={{ fontFamily: "'Nunito', sans-serif", color: "#047857" }}>
              Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "2px solid #fca5a5",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  color: "#dc2626",
                  fontSize: "14px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Role Toggle */}
            <div>
              <label className="field-label">I am a...</label>
              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-option ${role === "student" ? "active" : ""}`}
                  onClick={() => setRole("student")}
                >
                  🎒 Student
                </button>
                <button
                  type="button"
                  className={`role-option ${role === "teacher" ? "active" : ""}`}
                  onClick={() => setRole("teacher")}
                >
                  👩‍🏫 Teacher
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="field-label">✏️ Full Name</label>
              <input
                type="text"
                className="funky-input"
                placeholder="e.g. Thabang Thabong"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="field-label">📧 Email</label>
              <input
                type="email"
                className="funky-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="field-label">🔒 Password</label>
              <input
                type="password"
                className="funky-input"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Grade — only for students */}
            {role === "student" && (
              <div>
                <label className="field-label">🎓 My Grade</label>
                <div className="grade-grid">
                  {[1, 2, 3, 4, 5, 6, 7].map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`grade-btn ${gradeId === String(g) ? "selected" : ""}`}
                      onClick={() => setGradeId(String(g))}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {!gradeId && (
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", color: "#9ca3af", marginTop: "6px" }}>
                    Tap your grade above 👆
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "⏳ Registering..." : "🚀 Let's Go!"}
            </button>

            {/* Login link */}
            <p
              style={{
                textAlign: "center",
                fontFamily: "'Nunito', sans-serif",
                fontSize: "14px",
                color: "#6b7280",
                margin: 0,
              }}
            >
              Already have an account?{" "}
              <Link
                to="/"
                style={{
                  color: "#f59e0b",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Login here 🔑
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
