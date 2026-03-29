import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import bgImage from "../assets/login-bg.png";

function TeacherDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentError, setStudentError] = useState("");

  const [searchStudents, setSearchStudents] = useState("");
  const [filterGrade, setFilterGrade] = useState("");

  // ================= FETCH STUDENTS =================
  const fetchStudents = async () => {
    try {
      const res = await API.get("/dashboard/leaderboard");
      setStudents(res.data.leaderboard || []);
    } catch (err) {
      console.log("Students fetch failed:", err.message);
      setStudents([]);
    } finally {
      setLoading(false); // ✅ FIXED: only stop loading AFTER fetch
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ================= ADD STUDENT =================
  const handleAddStudent = async (e) => {
    e.preventDefault();

    const gradeInt = parseInt(grade);

    if (!fullName || !email || !password || !gradeInt) {
      setStudentError("All fields required");
      return;
    }

    if (gradeInt < 1 || gradeInt > 7) {
      setStudentError("Grade must be between 1 and 7");
      return;
    }

    try {
      setAddingStudent(true);

      await API.post("/auth/register", {
        full_name: fullName,
        email: email.toLowerCase(),
        password,
        role: "student",
        grade_id: gradeInt,
      });

      // RESET FORM
      setStudentError("");
      setFullName("");
      setEmail("");
      setPassword("");
      setGrade("");

      // 🔥 REFRESH LIST (important)
      await fetchStudents();

      alert("✅ Student added successfully!");
    } catch (err) {
      setStudentError(
        err.response?.data?.message || "Failed to add student"
      );
    } finally {
      setAddingStudent(false);
    }
  };

  // ================= FILTER =================
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.full_name
      ?.toLowerCase()
      .includes(searchStudents.toLowerCase());

    const matchesGrade = filterGrade
      ? student.grade_id == filterGrade
      : true;

    return matchesSearch && matchesGrade;
  });

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        padding: "40px 20px",
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          borderRadius: "20px",
          backgroundColor: "rgba(255,255,255,0.97)",
        }}
      >
        {/* HEADER */}
        <div className="text-center mb-4">
          <h1 className="text-primary">👩‍🏫 Teacher Dashboard</h1>

          <div className="mt-3">
            {/* ✅ ONLY ONE BUTTON (CLEAN NAVIGATION) */}
            <button
              className="btn btn-warning btn-lg me-3"
              onClick={() => navigate("/global-leaderboard")}
            >
              🌍 Global Leaderboard
            </button>

            <button
              className="btn btn-danger btn-lg"
              onClick={logout}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* ADD STUDENT */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5>➕ Add Student</h5>
          </div>

          <div className="card-body">
            {studentError && (
              <div className="alert alert-danger">
                {studentError}
              </div>
            )}

            <form onSubmit={handleAddStudent}>
              <div className="row g-2">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="col-md-1">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    min="1"
                    max="7"
                  />
                </div>

                <div className="col-md-2">
                  <button
                    className="btn btn-success w-100"
                    disabled={addingStudent}
                  >
                    {addingStudent ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* STUDENT TABLE */}
        <div className="card">
          <div className="card-header bg-dark text-white">
            <h5>📚 Students ({filteredStudents.length})</h5>
          </div>

          <div className="card-body">
            {/* FILTER */}
            <div className="row mb-3">
              <div className="col">
                <input
                  className="form-control"
                  placeholder="Search by name..."
                  value={searchStudents}
                  onChange={(e) =>
                    setSearchStudents(e.target.value)
                  }
                />
              </div>

              <div className="col-auto">
                <select
                  className="form-select"
                  value={filterGrade}
                  onChange={(e) =>
                    setFilterGrade(e.target.value)
                  }
                >
                  <option value="">All Grades</option>
                  {[1,2,3,4,5,6,7].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div
              className="table-responsive"
              style={{ maxHeight: "350px" }}
            >
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Points</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((s, index) => (
                    <tr key={s.id}>
                      <td>{index + 1}</td>
                      <td>{s.full_name}</td>
                      <td>
                        <span className="badge bg-info">
                          Grade {s.grade_id}
                        </span>
                      </td>
                      <td>
                        <strong>{s.points || 0} pts</strong>
                      </td>
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center text-muted"
                      >
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;