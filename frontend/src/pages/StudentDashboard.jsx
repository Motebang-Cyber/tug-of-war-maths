import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import bgImage from "../assets/login-bg.png";

function StudentDashboard() {
  const navigate = useNavigate();

  const [studentInfo, setStudentInfo] = useState(null);
  const [onlineStudents, setOnlineStudents] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [challengingStudentId, setChallengingStudentId] = useState(null);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name");
  const userGrade = localStorage.getItem("grade");

  // -------------------- LOGOUT --------------------
  const logout = () => {
    socket.emit("logout", { studentId: studentInfo?.id });
    localStorage.clear();
    navigate("/");
  };

  // -------------------- INITIALIZE --------------------
  useEffect(() => {
    if (!userId || !userName || !userGrade) {
      setError("Session expired. Please login again.");
      navigate("/");
      return;
    }

    const student = {
      id: parseInt(userId),
      full_name: userName,
      grade_id: parseInt(userGrade),
    };

    setStudentInfo(student);

    // Notify server student is online
    socket.emit("student-online", {
      studentId: student.id,
      name: student.full_name,
      grade: student.grade_id,
    });

    setLoading(false);
  }, []);

  // -------------------- SOCKET EVENTS --------------------
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    socket.on("update-online-students", (students) => {
      setOnlineStudents(students);
    });

    socket.on("match-request", (request) => {
      setIncomingRequests((prev) => [...prev, request]);
    });

    socket.on("match-response", ({ accepted, matchId }) => {
      setChallengingStudentId(null);

      if (accepted) {
        navigate(`/game/${matchId}`);
      } else {
        alert("❌ Challenge declined");
      }
    });

    socket.on("start-game", ({ matchId }) => {
      setChallengingStudentId(null);
      navigate(`/game/${matchId}`);
    });

    return () => {
      socket.off("update-online-students");
      socket.off("match-request");
      socket.off("match-response");
      socket.off("start-game");
    };
  }, []);

  // -------------------- HELPERS --------------------
  const isSelf = (studentId) => studentInfo?.id === studentId;

  const sameGradeStudents = onlineStudents.filter(
    (student) =>
      !isSelf(student.studentId) &&
      parseInt(student.grade) === parseInt(userGrade)
  );

  // -------------------- CHALLENGE --------------------
  const sendMatchRequest = (studentId) => {
    if (challengingStudentId) {
      alert("⏳ Waiting for previous response...");
      return;
    }

    setChallengingStudentId(studentId);

    socket.emit("send-match-request", {
      to: studentId,
    });
  };

  const respondToRequest = (fromId, accept) => {
    socket.emit("respond-match-request", {
      from: fromId,
      accept,
    });

    setIncomingRequests((prev) => prev.filter((r) => r.from !== fromId));
  };

  // -------------------- UI BUTTON --------------------
  const getChallengeButton = (student) => {
    if (isSelf(student.studentId))
      return <div className="text-success fw-bold">You 👋</div>;

    if (challengingStudentId === student.studentId)
      return (
        <button className="btn btn-warning w-100 mt-2" disabled>
          ⏳ Waiting...
        </button>
      );

    return (
      <button
        className="btn btn-primary w-100 mt-2"
        onClick={() => sendMatchRequest(student.studentId)}
      >
        ⚔️ Challenge
      </button>
    );
  };

  // -------------------- LOADING --------------------
  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  // -------------------- ERROR --------------------
  if (error)
    return (
      <div
        className="alert alert-danger text-center mt-5"
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        {error}
      </div>
    );

  // -------------------- UI --------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        paddingTop: "50px",
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          width: "95%",
          maxWidth: "1000px",
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "15px",
        }}
      >
        <div className="text-center mb-4">
          <h2>Welcome back, {studentInfo.full_name} 🎓</h2>
          <p className="text-muted">
            Grade {studentInfo.grade_id} |{" "}
            <span className="badge bg-success">Online</span>
          </p>
        </div>

        <div className="text-center mb-4">
          <button
            className="btn btn-warning btn-lg me-3"
            onClick={() => navigate("/leaderboard")}
          >
            🏆 Leaderboard
          </button>

          <button className="btn btn-danger btn-lg" onClick={logout}>
            Logout
          </button>
        </div>

        <hr />

        <h4>👥 Same Grade Online ({sameGradeStudents.length})</h4>

        {sameGradeStudents.length === 0 ? (
          <div className="alert alert-info text-center">
            No other Grade {userGrade} students online.
          </div>
        ) : (
          <div className="row g-3">
            {sameGradeStudents.map((student) => (
              <div key={student.studentId} className="col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h6>{student.name}</h6>
                    <p className="text-muted">Grade {student.grade}</p>

                    <div className="badge bg-success mb-2">Online</div>

                    {getChallengeButton(student)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr />

        <h4>📨 Incoming Challenges ({incomingRequests.length})</h4>

        {incomingRequests.length === 0 ? (
          <div className="alert alert-secondary text-center">
            No challenges yet
          </div>
        ) : (
          incomingRequests.map((req) => (
            <div
              key={req.from}
              className="alert alert-warning d-flex justify-content-between"
            >
              <div>
                <strong>{req.fromName}</strong> wants to play!
              </div>

              <div>
                <button
                  className="btn btn-success btn-sm me-2"
                  onClick={() => respondToRequest(req.from, true)}
                >
                  Accept
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => respondToRequest(req.from, false)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;