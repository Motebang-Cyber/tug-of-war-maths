import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import bgImage from "../assets/login-bg.png";

function TeacherDashboard() {
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentError, setStudentError] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [gradeQuestion, setGradeQuestion] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");

  const [searchStudents, setSearchStudents] = useState("");
  const [filterGrade, setFilterGrade] = useState("");

  // ================= FIXED API CALLS - NO /api/ PREFIX ✅ =================
  const fetchStudents = async () => {
    try {
      const res = await API.get("/dashboard/leaderboard");  // ← API.js adds /api
      setStudents(res.data.leaderboard || []);
    } catch (err) {
      console.log("Students fetch failed:", err);
      setStudents([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await API.get("/questions");  // ← API.js adds /api
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.log("Questions fetch failed:", err);
      setQuestions([]);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchQuestions();
    setLoading(false);
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const gradeInt = parseInt(grade);
    
    if (!fullName || !email || !password || !gradeInt || gradeInt < 1 || gradeInt > 7) {
      setStudentError("All fields required. Grade 1-7 only.");
      return;
    }

    try {
      setAddingStudent(true);
      await API.post("/auth/register", {  // ← API.js adds /api
        full_name: fullName,
        email: email.toLowerCase(),
        password,
        role: "student",
        grade_id: gradeInt
      });
      
      setStudentError("");
      setFullName(""); setEmail(""); setPassword(""); setGrade("");
      fetchStudents();
      alert("✅ Student added successfully!");
    } catch (err) {
      setStudentError(err.response?.data?.message || "Failed to add student");
    } finally {
      setAddingStudent(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const gradeInt = parseInt(gradeQuestion);
    
    if (!questionText || !answerText || !gradeInt || gradeInt < 1 || gradeInt > 7) {
      setQuestionError("All fields required. Grade 1-7 only.");
      return;
    }

    try {
      setAddingQuestion(true);
      await API.post("/questions", {  // ← API.js adds /api
        grade_id: gradeInt,
        question: questionText,
        answer: answerText
      });
      
      setQuestionError("");
      setQuestionText(""); setAnswerText(""); setGradeQuestion("");
      fetchQuestions();
      alert("✅ Question added successfully!");
    } catch (err) {
      setQuestionError(err.response?.data?.message || "Failed to add question");
    } finally {
      setAddingQuestion(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchStudents.toLowerCase());
    const matchesGrade = filterGrade ? student.grade_id == filterGrade : true;
    return matchesSearch && matchesGrade;
  });

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      padding: "50px 20px"
    }}>
      <div className="card shadow p-4" style={{ 
        width: "95%", maxWidth: "1400px", 
        backgroundColor: "rgba(255,255,255,0.97)",
        borderRadius: "20px"
      }}>
        <div className="text-center mb-5">
          <h1 className="display-4 text-primary mb-3">👩‍🏫 Teacher Dashboard</h1>
          <div className="mt-4">
            <button className="btn btn-warning btn-lg me-3" onClick={() => navigate("/GlobalLeaderboard")}>
              🏆 Leaderboard
            </button>
            <button className="btn btn-danger btn-lg" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* STUDENTS */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header bg-primary text-white">
                <h4>📚 Students ({filteredStudents.length})</h4>
              </div>
              <div className="card-body">
                {studentError && <div className="alert alert-danger">{studentError}</div>}

                <form onSubmit={handleAddStudent} className="mb-4 p-3 border rounded bg-light">
                  <h5 className="mb-3 text-primary">➕ Add Student</h5>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input type="text" className="form-control" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <input type="email" className="form-control" placeholder="student@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="col-md-4">
                      <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="col-md-4">
                      <input type="number" className="form-control" placeholder="Grade 1-7" value={grade} onChange={e => setGrade(e.target.value)} min="1" max="7" required />
                    </div>
                    <div className="col-md-4">
                      <button className="btn btn-success w-100" disabled={addingStudent}>
                        {addingStudent ? "Adding..." : "Add Student"}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="row g-2 mb-3">
                  <div className="col">
                    <input className="form-control" placeholder="Search students..." value={searchStudents} onChange={e => setSearchStudents(e.target.value)} />
                  </div>
                  <div className="col-auto">
                    <select className="form-select" value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
                      <option value="">All Grades</option>
                      {[1,2,3,4,5,6,7].map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="table-responsive" style={{maxHeight: "300px", overflowY: "auto"}}>
                  <table className="table table-hover">
                    <thead className="table-light sticky-top">
                      <tr><th>ID</th><th>Name</th><th>Grade</th><th>Points</th></tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s.id}>
                          <td><strong>#{s.id}</strong></td>
                          <td>{s.full_name}</td>
                          <td><span className="badge bg-info">Grade {s.grade_id}</span></td>
                          <td><strong>{s.points || 0} pts</strong></td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr><td colSpan="4" className="text-center text-muted py-4">No students. Add first one!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header bg-success text-white">
                <h4>❓ Questions</h4>
              </div>
              <div className="card-body">
                {questionError && <div className="alert alert-danger">{questionError}</div>}

                <form onSubmit={handleAddQuestion} className="mb-4 p-3 border rounded bg-light">
                  <h5 className="mb-3 text-success">➕ Add Question</h5>
                  <div className="row g-2">
                    <div className="col-md-5">
                      <input type="text" className="form-control" placeholder="5+3=?" value={questionText} onChange={e => setQuestionText(e.target.value)} required />
                    </div>
                    <div className="col-md-3">
                      <input type="text" className="form-control" placeholder="8" value={answerText} onChange={e => setAnswerText(e.target.value)} required />
                    </div>
                    <div className="col-md-2">
                      <input type="number" className="form-control" placeholder="Grade" value={gradeQuestion} onChange={e => setGradeQuestion(e.target.value)} min="1" max="7" required />
                    </div>
                    <div className="col-md-2">
                      <button className="btn btn-success w-100" disabled={addingQuestion}>
                        {addingQuestion ? "Adding..." : "Add Question"}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="table-responsive" style={{maxHeight: "400px", overflowY: "auto"}}>
                  <table className="table table-hover">
                    <thead className="table-light sticky-top">
                      <tr><th>ID</th><th>Question</th><th>Answer</th><th>Grade</th></tr>
                    </thead>
                    <tbody>
                      {questions.map(q => (
                        <tr key={q.id}>
                          <td><strong>#{q.id}</strong></td>
                          <td>{q.question}</td>
                          <td><strong>{q.answer}</strong></td>
                          <td><span className="badge bg-warning">Grade {q.grade_id}</span></td>
                        </tr>
                      ))}
                      {questions.length === 0 && (
                        <tr><td colSpan="4" className="text-center text-muted py-4">No questions. Add first one!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
