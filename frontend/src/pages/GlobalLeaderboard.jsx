import React, { useEffect, useState } from "react";
import API from "../api/api";
import bgImage from "../assets/login-bg.png";

const GlobalLeaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);

  const [loading, setLoading] = useState(true);

  // 🎯 FILTERS
  const [grade, setGrade] = useState("1");
  const [search, setSearch] = useState("");

  // 📄 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;

  // ---------------- FETCH ALL PLAYERS ----------------
  const fetchLeaderboard = async () => {
    try {
      const res = await API.get("/dashboard/leaderboard"); // 👈 must return ALL students
      const data = res.data.leaderboard || [];

      setPlayers(data);
      setFilteredPlayers(data);
    } catch (err) {
      console.error("❌ Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // ---------------- FILTER LOGIC ----------------
  useEffect(() => {
    let filtered = players;

    // 🎯 FILTER BY GRADE
    if (grade) {
      filtered = filtered.filter(
        (p) => String(p.grade_id) === String(grade)
      );
    }

    // 🔍 SEARCH BY NAME
    if (search) {
      filtered = filtered.filter((p) =>
        p.full_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🏆 SORT BY POINTS DESC
    filtered.sort((a, b) => (b.points || 0) - (a.points || 0));

    setFilteredPlayers(filtered);
    setCurrentPage(1); // reset page on filter
  }, [players, grade, search]);

  // ---------------- PAGINATION ----------------
  const indexOfLast = currentPage * playersPerPage;
  const indexOfFirst = indexOfLast - playersPerPage;
  const currentPlayers = filteredPlayers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="text-center mt-5">
        <h3>Loading leaderboard...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 20px",
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          width: "95%",
          maxWidth: "1100px",
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "20px",
        }}
      >
        {/* HEADER */}
        <h2 className="text-center mb-4">🌍 Global Leaderboard</h2>

        {/* FILTERS */}
        <div className="row mb-4 g-3">
          {/* GRADE FILTER */}
          <div className="col-md-4">
            <select
              className="form-select"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              {[1,2,3,4,5,6,7].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH */}
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search student by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Grade</th>
                <th>Points</th>
              </tr>
            </thead>

            <tbody>
              {currentPlayers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No students found
                  </td>
                </tr>
              ) : (
                currentPlayers.map((player, index) => (
                  <tr key={player.id}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{player.full_name}</td>
                    <td>
                      <span className="badge bg-info">
                        Grade {player.grade_id}
                      </span>
                    </td>
                    <td>
                      <strong>{player.points || 0}</strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination">

                <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                </li>

                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages && "disabled"
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </li>

              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLeaderboard;