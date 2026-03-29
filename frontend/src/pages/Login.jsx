import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/login-bg.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      console.log("Login success:", user);

      /* -----------------------------
         STORE USER DATA
      ----------------------------- */

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("name", user.full_name);

      /* -----------------------------
         FIXED: STORE GRADE
      ----------------------------- */

      if (user.grade_id) {
        localStorage.setItem("grade", user.grade_id);
      }

      /* -----------------------------
         NAVIGATION
      ----------------------------- */

      if (user.role === "student") {
        navigate("/student");
      } else {
        navigate("/teacher");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data);

      setError(
        err.response?.data?.message ||
          "Invalid email or password"
      );
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
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          maxWidth: "420px",
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.92)",
          borderRadius: "16px",
        }}
      >
        <h3 className="text-center mb-2">🪢 Maths Tug Of War</h3>

        <h5 className="text-center mb-4 text-primary">
          Student / Teacher Login
        </h5>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* EMAIL */}

          <div className="mb-3">
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          {/* PASSWORD */}

          <div className="mb-3">
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          {/* LOGIN BUTTON */}

          <button
            className="btn btn-primary w-100 btn-lg"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* REGISTER */}

        <div className="text-center mt-3">
          <small>
            Don't have an account?{" "}
            <Link to="/register">
              Register here
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;