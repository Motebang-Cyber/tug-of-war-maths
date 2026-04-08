import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import bgImage from "../assets/login-bg.png";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const GRADES = [1, 2, 3, 4, 5, 6, 7];
const GRADE_COLORS = {
  1: "#f87171", 2: "#fb923c", 3: "#fbbf24",
  4: "#4ade80", 5: "#34d399", 6: "#60a5fa", 7: "#a78bfa",
};

/* ═══════════════════════════════════════════════════════════
   SMALL REUSABLE UI PIECES
═══════════════════════════════════════════════════════════ */
function GradeBadge({ grade }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 12px",
      borderRadius: "50px",
      background: GRADE_COLORS[grade] || "#e5e7eb",
      color: "#fff",
      fontFamily: "'Fredoka One', cursive",
      fontSize: "13px",
      fontWeight: 700,
      textShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }}>
      G{grade}
    </span>
  );
}

function SectionHeader({ icon, title, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <span style={{ fontSize: "28px" }}>{icon}</span>
      <h2 style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: "24px",
        color: "#1e293b",
        margin: 0,
      }}>
        {title}
      </h2>
      {count !== undefined && (
        <span style={{
          background: "#f1f5f9",
          color: "#64748b",
          borderRadius: "50px",
          padding: "2px 12px",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: "14px",
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
function TeacherDashboard() {
  const navigate = useNavigate();

  /* ── Active tab ── */
  const [activeTab, setActiveTab] = useState("students"); // "students" | "questions"

  /* ── Students state ── */
  const [students,       setStudents]       = useState([]);
  const [studLoading,    setStudLoading]    = useState(true);
  const [studSearch,     setStudSearch]     = useState("");
  const [studGradeFilter,setStudGradeFilter]= useState("");

  /* Student form */
  const [studForm,    setStudForm]    = useState({ full_name:"", email:"", password:"", grade_id:"" });
  const [editStudId,  setEditStudId]  = useState(null); // null = adding new
  const [studError,   setStudError]   = useState("");
  const [studSaving,  setStudSaving]  = useState(false);
  const [studSuccess, setStudSuccess] = useState("");

  /* ── Questions state ── */
  const [questions,    setQuestions]    = useState([]);
  const [qLoading,     setQLoading]     = useState(true);
  const [qSearch,      setQSearch]      = useState("");
  const [qGradeFilter, setQGradeFilter] = useState("");

  /* Question form */
  const [qForm,    setQForm]    = useState({ question:"", answer:"", grade_id:"" });
  const [editQId,  setEditQId]  = useState(null);
  const [qError,   setQError]   = useState("");
  const [qSaving,  setQSaving]  = useState(false);
  const [qSuccess, setQSuccess] = useState("");

  /* ── Confirm delete modal ── */
  const [confirmModal, setConfirmModal] = useState(null);
  // { type: "student"|"question", id, name }

  /* ═══════════ FETCH ═══════════ */
  const fetchStudents = async () => {
    setStudLoading(true);
    try {
      const res = await API.get("/dashboard/leaderboard");
      setStudents(res.data.leaderboard || []);
    } catch { setStudents([]); }
    finally { setStudLoading(false); }
  };

  const fetchQuestions = async () => {
    setQLoading(true);
    try {
      const res = await API.get("/questions");
      setQuestions(res.data.questions || []);
    } catch { setQuestions([]); }
    finally { setQLoading(false); }
  };

  useEffect(() => { fetchStudents(); fetchQuestions(); }, []);

  /* ═══════════ STUDENT CRUD ═══════════ */
  const resetStudForm = () => {
    setStudForm({ full_name:"", email:"", password:"", grade_id:"" });
    setEditStudId(null);
    setStudError("");
  };

  const startEditStudent = (s) => {
    setStudForm({ full_name: s.full_name, email: s.email || "", password: "", grade_id: String(s.grade_id) });
    setEditStudId(s.id);
    setStudError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setStudError("");
    const g = parseInt(studForm.grade_id);
    if (!studForm.full_name || !studForm.email || (!editStudId && !studForm.password) || !g) {
      setStudError("All fields are required" + (editStudId ? " (leave password blank to keep existing)" : ""));
      return;
    }
    if (g < 1 || g > 7) { setStudError("Grade must be 1–7"); return; }

    setStudSaving(true);
    try {
      if (editStudId) {
        // Edit — use register-like endpoint or a dedicated PUT
        // We patch via a PUT to /dashboard/students/:id if available,
        // otherwise re-register isn't ideal; we'll hit /auth/register logic:
        // Since your backend doesn't have a dedicated PUT /students, we call
        // a workaround: update points endpoint won't work. We'll call the
        // questions-style approach — for now update via the leaderboard trick.
        // BEST PRACTICE: add PUT /api/students/:id in backend.
        // Here we attempt it and show a helpful error if endpoint missing.
        await API.put(`/students/${editStudId}`, {
          full_name: studForm.full_name,
          email: studForm.email,
          grade_id: g,
          ...(studForm.password ? { password: studForm.password } : {}),
        });
        setStudSuccess("✅ Student updated!");
      } else {
        await API.post("/auth/register", {
          full_name: studForm.full_name,
          email: studForm.email.toLowerCase(),
          password: studForm.password,
          role: "student",
          grade_id: g,
        });
        setStudSuccess("✅ Student added!");
      }
      resetStudForm();
      await fetchStudents();
      setTimeout(() => setStudSuccess(""), 3000);
    } catch (err) {
      setStudError(err.response?.data?.message || "Failed to save student");
    } finally {
      setStudSaving(false);
    }
  };

  const confirmDeleteStudent = (s) => {
    setConfirmModal({ type: "student", id: s.id, name: s.full_name });
  };

  const handleDeleteStudent = async (id) => {
    try {
      await API.delete(`/students/${id}`);
      await fetchStudents();
      setStudSuccess("🗑️ Student removed.");
      setTimeout(() => setStudSuccess(""), 3000);
    } catch (err) {
      setStudError(err.response?.data?.message || "Delete failed");
    }
  };

  /* ── Filtered students ── */
  const filteredStudents = students.filter((s) => {
    const matchName  = s.full_name?.toLowerCase().includes(studSearch.toLowerCase());
    const matchGrade = studGradeFilter ? String(s.grade_id) === studGradeFilter : true;
    return matchName && matchGrade;
  });

  /* ═══════════ QUESTION CRUD ═══════════ */
  const resetQForm = () => {
    setQForm({ question:"", answer:"", grade_id:"" });
    setEditQId(null);
    setQError("");
  };

  const startEditQuestion = (q) => {
    setQForm({ question: q.question, answer: q.answer, grade_id: String(q.grade_id) });
    setEditQId(q.id);
    setQError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setQError("");
    const g = parseInt(qForm.grade_id);
    if (!qForm.question.trim() || !qForm.answer.trim() || !g) {
      setQError("Question, answer and grade are all required");
      return;
    }
    if (g < 1 || g > 7) { setQError("Grade must be 1–7"); return; }

    setQSaving(true);
    try {
      if (editQId) {
        await API.put(`/questions/${editQId}`, { grade_id: g, question: qForm.question, answer: qForm.answer });
        setQSuccess("✅ Question updated!");
      } else {
        await API.post("/questions", { grade_id: g, question: qForm.question, answer: qForm.answer });
        setQSuccess("✅ Question added!");
      }
      resetQForm();
      await fetchQuestions();
      setTimeout(() => setQSuccess(""), 3000);
    } catch (err) {
      setQError(err.response?.data?.message || "Failed to save question");
    } finally {
      setQSaving(false);
    }
  };

  const confirmDeleteQuestion = (q) => {
    setConfirmModal({ type: "question", id: q.id, name: q.question.slice(0, 40) });
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await API.delete(`/questions/${id}`);
      await fetchQuestions();
      setQSuccess("🗑️ Question removed.");
      setTimeout(() => setQSuccess(""), 3000);
    } catch (err) {
      setQError(err.response?.data?.message || "Delete failed");
    }
  };

  /* ── Filtered questions ── */
  const filteredQuestions = questions.filter((q) => {
    const matchText  = q.question?.toLowerCase().includes(qSearch.toLowerCase());
    const matchGrade = qGradeFilter ? String(q.grade_id) === qGradeFilter : true;
    return matchText && matchGrade;
  });

  /* ═══════════ LOGOUT ═══════════ */
  const logout = () => { localStorage.clear(); navigate("/"); };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Nunito', sans-serif",
    }}>

      {/* ── Google Fonts + global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(0.85); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes successSlide {
          0%   { opacity:0; transform:translateX(40px); }
          15%  { opacity:1; transform:translateX(0); }
          85%  { opacity:1; transform:translateX(0); }
          100% { opacity:0; transform:translateX(40px); }
        }

        .td-page {
          max-width: 1160px;
          margin: 0 auto;
          padding: 28px 16px 60px;
          animation: fadeSlideIn 0.5s ease both;
        }

        /* ── Top bar ── */
        .top-bar {
          background: rgba(255,255,255,0.97);
          border-radius: 20px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          margin-bottom: 24px;
        }
        .top-bar-title {
          font-family: 'Fredoka One', cursive;
          font-size: 26px;
          color: #1e293b;
          margin: 0;
        }
        .top-bar-actions { display:flex; gap:10px; flex-wrap:wrap; }

        .btn-nav {
          padding: 10px 22px;
          border: none;
          border-radius: 14px;
          font-family: 'Fredoka One', cursive;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .btn-leaderboard {
          background: linear-gradient(135deg,#f59e0b,#d97706);
          color: white;
          box-shadow: 0 4px 0 #92400e;
        }
        .btn-leaderboard:hover { filter:brightness(1.08); transform:translateY(-1px); }
        .btn-logout {
          background: linear-gradient(135deg,#ef4444,#dc2626);
          color: white;
          box-shadow: 0 4px 0 #991b1b;
        }
        .btn-logout:hover { filter:brightness(1.08); transform:translateY(-1px); }

        /* ── Tab bar ── */
        .tab-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          background: rgba(255,255,255,0.85);
          border-radius: 18px;
          padding: 6px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .tab-btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 13px;
          font-family: 'Fredoka One', cursive;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #94a3b8;
        }
        .tab-btn.active {
          background: white;
          color: #1e293b;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        /* ── Panel cards ── */
        .panel {
          background: rgba(255,255,255,0.97);
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          animation: fadeSlideIn 0.35s ease both;
        }

        /* ── Form inputs ── */
        .field-label {
          display: block;
          font-family: 'Fredoka One', cursive;
          font-size: 14px;
          color: #64748b;
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          border: 3px solid #e2e8f0;
          border-radius: 13px;
          padding: 10px 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 15px;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          color: #1e293b;
        }
        .field-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.15);
          background: white;
        }
        .field-select {
          width: 100%;
          border: 3px solid #e2e8f0;
          border-radius: 13px;
          padding: 10px 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 15px;
          background: #fafafa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236366f1' d='M6 8L0 0h12z'/%3E%3C/svg%3E") no-repeat right 14px center;
          appearance: none;
          cursor: pointer;
          outline: none;
          color: #1e293b;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-select:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }

        /* ── Grade pill filter buttons ── */
        .grade-pill {
          padding: 6px 14px;
          border: 2.5px solid #e2e8f0;
          border-radius: 50px;
          font-family: 'Fredoka One', cursive;
          font-size: 14px;
          cursor: pointer;
          background: #f8fafc;
          color: #64748b;
          transition: all 0.15s;
        }
        .grade-pill:hover  { border-color: #6366f1; color: #6366f1; }
        .grade-pill.active { background: #6366f1; border-color: #6366f1; color: white; box-shadow: 0 3px 10px rgba(99,102,241,0.35); }

        /* ── Action buttons ── */
        .btn-save {
          padding: 11px 28px;
          background: linear-gradient(135deg,#6366f1,#4f46e5);
          color: white;
          border: none;
          border-radius: 13px;
          font-family: 'Fredoka One', cursive;
          font-size: 17px;
          cursor: pointer;
          box-shadow: 0 5px 0 #3730a3;
          position: relative; top: 0;
          transition: top 0.1s, box-shadow 0.1s, filter 0.15s;
        }
        .btn-save:hover:not(:disabled)  { top: 2px; box-shadow: 0 3px 0 #3730a3; filter:brightness(1.05); }
        .btn-save:active:not(:disabled) { top: 4px; box-shadow: 0 1px 0 #3730a3; }
        .btn-save:disabled { opacity:0.5; cursor:not-allowed; }

        .btn-cancel {
          padding: 11px 20px;
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 13px;
          font-family: 'Fredoka One', cursive;
          font-size: 17px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-cancel:hover { background: #e2e8f0; }

        /* ── Row action buttons ── */
        .btn-edit {
          padding: 6px 14px;
          background: #eff6ff;
          color: #3b82f6;
          border: 2px solid #bfdbfe;
          border-radius: 10px;
          font-family: 'Fredoka One', cursive;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-edit:hover { background: #3b82f6; color: white; border-color: #3b82f6; }

        .btn-delete {
          padding: 6px 14px;
          background: #fef2f2;
          color: #ef4444;
          border: 2px solid #fecaca;
          border-radius: 10px;
          font-family: 'Fredoka One', cursive;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-delete:hover { background: #ef4444; color: white; border-color: #ef4444; }

        /* ── Table ── */
        .data-table { width:100%; border-collapse:separate; border-spacing:0 6px; }
        .data-table thead th {
          font-family: 'Fredoka One', cursive;
          font-size: 13px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 4px 14px 8px;
          text-align: left;
        }
        .data-table thead th:last-child { text-align:right; }
        .data-row {
          background: #f8fafc;
          border-radius: 13px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .data-row:hover { transform:translateX(3px); box-shadow:0 4px 14px rgba(0,0,0,0.07); }
        .data-row td {
          padding: 13px 14px;
          font-weight: 700;
          font-size: 14px;
          vertical-align: middle;
          color: #1e293b;
        }
        .data-row td:first-child { border-radius:13px 0 0 13px; }
        .data-row td:last-child  { border-radius:0 13px 13px 0; text-align:right; }

        /* ── Alert / success ── */
        .alert-error {
          background: #fef2f2;
          border: 2px solid #fca5a5;
          color: #dc2626;
          border-radius: 12px;
          padding: 10px 16px;
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 14px;
        }
        .alert-success {
          position: fixed;
          bottom: 28px; right: 28px;
          background: #d1fae5;
          border: 2px solid #6ee7b7;
          color: #065f46;
          border-radius: 14px;
          padding: 12px 22px;
          font-family: 'Fredoka One', cursive;
          font-size: 17px;
          z-index: 9999;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          animation: successSlide 3s ease forwards;
        }

        /* ── Points chip ── */
        .pts-chip {
          display: inline-block;
          background: linear-gradient(135deg,#fef3c7,#fde68a);
          border: 2px solid #fbbf24;
          color: #78350f;
          border-radius: 50px;
          padding: 3px 12px;
          font-family: 'Fredoka One', cursive;
          font-size: 14px;
        }

        /* ── Confirm modal ── */
        .modal-backdrop {
          position: fixed; inset:0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-box {
          background: white;
          border-radius: 22px;
          padding: 32px 28px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
          box-shadow: 0 24px 64px rgba(0,0,0,0.25);
        }

        /* ── Empty state ── */
        .empty-state {
          text-align: center;
          padding: 40px 0;
          color: #94a3b8;
        }
        .empty-state div { font-size: 48px; margin-bottom: 10px; }
        .empty-state p { font-family:'Fredoka One',cursive; font-size:18px; }

        /* ── Search row ── */
        .search-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 16px;
        }
        .search-input-wrap { position:relative; flex:1; min-width:180px; }
        .search-icon {
          position:absolute; left:12px; top:50%; transform:translateY(-50%);
          font-size:16px; pointer-events:none;
        }
        .search-input {
          width:100%;
          border: 3px solid #e2e8f0;
          border-radius: 13px;
          padding: 10px 14px 10px 36px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 14px;
          outline: none;
          background: white;
          color: #1e293b;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input:focus { border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,0.15); }

        /* ── Responsive form grid ── */
        .form-grid-students {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 14px;
          margin-bottom: 16px;
        }
        .form-grid-questions {
          display: grid;
          grid-template-columns: 2fr 1fr auto;
          gap: 14px;
          align-items: end;
          margin-bottom: 16px;
        }
        @media (max-width: 640px) {
          .form-grid-questions { grid-template-columns: 1fr; }
          .top-bar { flex-direction:column; }
        }

        .q-cell {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .divider {
          border: none;
          border-top: 2px dashed #e2e8f0;
          margin: 22px 0;
        }

        .form-title {
          font-family: 'Fredoka One', cursive;
          font-size: 17px;
          color: #6366f1;
          margin: 0 0 16px;
        }
      `}</style>

      <div className="td-page">

        {/* ════════ TOP BAR ════════ */}
        <div className="top-bar">
          <h1 className="top-bar-title">👩‍🏫 Teacher Dashboard</h1>
          <div className="top-bar-actions">
            <button className="btn-nav btn-leaderboard" onClick={() => navigate("/global-leaderboard")}>
              🏆 Leaderboard
            </button>
            <button className="btn-nav btn-logout" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* ════════ TABS ════════ */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            🎒 Students
          </button>
          <button
            className={`tab-btn ${activeTab === "questions" ? "active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            📝 Questions
          </button>
        </div>

        {/* ════════════════════════════════════════════
            STUDENTS TAB
        ════════════════════════════════════════════ */}
        {activeTab === "students" && (
          <>
            {/* ── Add / Edit Student Form ── */}
            <div className="panel">
              <p className="form-title">
                {editStudId ? "✏️ Edit Student" : "➕ Add New Student"}
              </p>

              {studError   && <div className="alert-error">⚠️ {studError}</div>}

              <form onSubmit={handleSaveStudent}>
                <div className="form-grid-students">
                  <div>
                    <label className="field-label">👤 Full Name</label>
                    <input
                      className="field-input"
                      placeholder="e.g. Sipho Dlamini"
                      value={studForm.full_name}
                      onChange={(e) => setStudForm({ ...studForm, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">📧 Email</label>
                    <input
                      type="email"
                      className="field-input"
                      placeholder="student@school.com"
                      value={studForm.email}
                      onChange={(e) => setStudForm({ ...studForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">🔒 Password {editStudId && <span style={{ color:"#94a3b8", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>(blank = keep)</span>}</label>
                    <input
                      type="password"
                      className="field-input"
                      placeholder={editStudId ? "Leave blank to keep" : "Min 6 chars"}
                      value={studForm.password}
                      onChange={(e) => setStudForm({ ...studForm, password: e.target.value })}
                      minLength={editStudId ? 0 : 6}
                    />
                  </div>
                  <div>
                    <label className="field-label">🎓 Grade</label>
                    <select
                      className="field-select"
                      value={studForm.grade_id}
                      onChange={(e) => setStudForm({ ...studForm, grade_id: e.target.value })}
                      required
                    >
                      <option value="">Select grade…</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                  <button className="btn-save" type="submit" disabled={studSaving}>
                    {studSaving ? "⏳ Saving..." : editStudId ? "💾 Update Student" : "➕ Add Student"}
                  </button>
                  {editStudId && (
                    <button className="btn-cancel" type="button" onClick={resetStudForm}>
                      ✕ Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ── Student List ── */}
            <div className="panel">
              <SectionHeader icon="👥" title="Students" count={filteredStudents.length} />

              {/* Search + grade filter */}
              <div className="search-row">
                <div className="search-input-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    className="search-input"
                    placeholder="Search by name…"
                    value={studSearch}
                    onChange={(e) => setStudSearch(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"18px" }}>
                <button
                  className={`grade-pill ${studGradeFilter === "" ? "active" : ""}`}
                  onClick={() => setStudGradeFilter("")}
                >All</button>
                {GRADES.map((g) => (
                  <button
                    key={g}
                    className={`grade-pill ${studGradeFilter === String(g) ? "active" : ""}`}
                    onClick={() => setStudGradeFilter(String(g))}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>

              {studLoading ? (
                <div className="empty-state"><div>⏳</div><p>Loading students…</p></div>
              ) : filteredStudents.length === 0 ? (
                <div className="empty-state"><div>🤷</div><p>No students found</p></div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Points</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s, i) => (
                        <tr key={s.id} className="data-row">
                          <td style={{ color:"#94a3b8", fontFamily:"'Fredoka One',cursive" }}>{i + 1}</td>
                          <td>
                            <span style={{ fontWeight:800 }}>{s.full_name}</span>
                          </td>
                          <td><GradeBadge grade={s.grade_id} /></td>
                          <td><span className="pts-chip">⭐ {s.points || 0} pts</span></td>
                          <td>
                            <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end", flexWrap:"wrap" }}>
                              <button className="btn-edit" onClick={() => startEditStudent(s)}>✏️ Edit</button>
                              <button className="btn-delete" onClick={() => confirmDeleteStudent(s)}>🗑️ Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════
            QUESTIONS TAB
        ════════════════════════════════════════════ */}
        {activeTab === "questions" && (
          <>
            {/* ── Add / Edit Question Form ── */}
            <div className="panel">
              <p className="form-title">
                {editQId ? "✏️ Edit Question" : "➕ Add New Question"}
              </p>

              {qError && <div className="alert-error">⚠️ {qError}</div>}

              <form onSubmit={handleSaveQuestion}>
                {/* Question text */}
                <div style={{ marginBottom:"14px" }}>
                  <label className="field-label">🧮 Question</label>
                  <input
                    className="field-input"
                    placeholder="e.g. What is 12 × 7?"
                    value={qForm.question}
                    onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-questions">
                  <div>
                    <label className="field-label">✅ Answer</label>
                    <input
                      className="field-input"
                      placeholder="e.g. 84"
                      value={qForm.answer}
                      onChange={(e) => setQForm({ ...qForm, answer: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">🎓 Grade</label>
                    <select
                      className="field-select"
                      value={qForm.grade_id}
                      onChange={(e) => setQForm({ ...qForm, grade_id: e.target.value })}
                      required
                    >
                      <option value="">Grade…</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display:"flex", gap:"8px", alignItems:"flex-end" }}>
                    <button className="btn-save" type="submit" disabled={qSaving}>
                      {qSaving ? "⏳" : editQId ? "💾 Update" : "➕ Add"}
                    </button>
                    {editQId && (
                      <button className="btn-cancel" type="button" onClick={resetQForm}>✕</button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* ── Question List ── */}
            <div className="panel">
              <SectionHeader icon="📚" title="Question Bank" count={filteredQuestions.length} />

              {/* Search + grade filter */}
              <div className="search-row">
                <div className="search-input-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    className="search-input"
                    placeholder="Search questions…"
                    value={qSearch}
                    onChange={(e) => setQSearch(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"18px" }}>
                <button
                  className={`grade-pill ${qGradeFilter === "" ? "active" : ""}`}
                  onClick={() => setQGradeFilter("")}
                >All</button>
                {GRADES.map((g) => (
                  <button
                    key={g}
                    className={`grade-pill ${qGradeFilter === String(g) ? "active" : ""}`}
                    onClick={() => setQGradeFilter(String(g))}
                  >Grade {g}</button>
                ))}
              </div>

              {qLoading ? (
                <div className="empty-state"><div>⏳</div><p>Loading questions…</p></div>
              ) : filteredQuestions.length === 0 ? (
                <div className="empty-state"><div>📭</div><p>No questions found</p></div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Grade</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuestions.map((q, i) => (
                        <tr key={q.id} className="data-row">
                          <td style={{ color:"#94a3b8", fontFamily:"'Fredoka One',cursive" }}>{i + 1}</td>
                          <td>
                            <span className="q-cell" title={q.question}>{q.question}</span>
                          </td>
                          <td>
                            <span style={{
                              background:"#d1fae5", color:"#065f46",
                              borderRadius:"8px", padding:"3px 10px",
                              fontFamily:"'Fredoka One',cursive", fontSize:"14px",
                            }}>
                              {q.answer}
                            </span>
                          </td>
                          <td><GradeBadge grade={q.grade_id} /></td>
                          <td>
                            <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end", flexWrap:"wrap" }}>
                              <button className="btn-edit" onClick={() => startEditQuestion(q)}>✏️ Edit</button>
                              <button className="btn-delete" onClick={() => confirmDeleteQuestion(q)}>🗑️ Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ════════ GLOBAL SUCCESS TOAST ════════ */}
      {(studSuccess || qSuccess) && (
        <div className="alert-success">{studSuccess || qSuccess}</div>
      )}

      {/* ════════ CONFIRM DELETE MODAL ════════ */}
      {confirmModal && (
        <div className="modal-backdrop" onClick={() => setConfirmModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize:"52px", marginBottom:"12px" }}>🗑️</div>
            <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"22px", color:"#1e293b", margin:"0 0 8px" }}>
              Are you sure?
            </h3>
            <p style={{ color:"#64748b", fontWeight:700, marginBottom:"24px", fontSize:"15px" }}>
              Delete <strong style={{ color:"#1e293b" }}>"{confirmModal.name}"</strong>?
              <br />This cannot be undone!
            </p>
            <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
              <button
                className="btn-cancel"
                style={{ padding:"11px 28px" }}
                onClick={() => setConfirmModal(null)}
              >
                ✕ Cancel
              </button>
              <button
                style={{
                  padding:"11px 28px",
                  background:"linear-gradient(135deg,#ef4444,#dc2626)",
                  color:"white",
                  border:"none",
                  borderRadius:"13px",
                  fontFamily:"'Fredoka One',cursive",
                  fontSize:"17px",
                  cursor:"pointer",
                  boxShadow:"0 4px 0 #991b1b",
                }}
                onClick={async () => {
                  const m = confirmModal;
                  setConfirmModal(null);
                  if (m.type === "student")   await handleDeleteStudent(m.id);
                  if (m.type === "question")  await handleDeleteQuestion(m.id);
                }}
              >
                🗑️ Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
