import React, { useEffect, useState } from "react";
import API from "../api/api";
import socket from "../socket";
import bgImage from "../assets/login-bg.png";

const PLAYERS_PER_PAGE = 10;

const GRADE_COLORS = ["", "#f87171","#fb923c","#fbbf24","#4ade80","#34d399","#60a5fa","#a78bfa"];
const GRADE_EMOJIS = ["","🔴","🟠","🟡","🟢","💚","🔵","🟣"];

const MEDAL = ["🥇","🥈","🥉"];

const GlobalLeaderboard = () => {
  const [players, setPlayers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [grade, setGrade]               = useState("");       // "" = all grades
  const [search, setSearch]             = useState("");
  const [currentPage, setCurrentPage]   = useState(1);

  // ─── Fetch ────────────────────────────────────────────────
  const fetchLeaderboard = async () => {
    try {
      // Fetch ALL students (no grade param so backend returns everyone)
      const res = await API.get("/dashboard/leaderboard");
      setPlayers(res.data.leaderboard || []);
    } catch (err) {
      console.error("❌ Leaderboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Real-time updates when a game finishes
  useEffect(() => {
    socket.on("leaderboard-updated", fetchLeaderboard);
    return () => socket.off("leaderboard-updated", fetchLeaderboard);
  }, []);

  // ─── Filter + Sort ────────────────────────────────────────
  const filtered = players
    .filter((p) => {
      const matchGrade  = grade  ? String(p.grade_id) === String(grade) : true;
      // Search by surname = last word of full_name
      const surname     = p.full_name?.trim().split(" ").pop() || "";
      const matchSearch = search
        ? surname.toLowerCase().includes(search.toLowerCase()) ||
          p.full_name?.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchGrade && matchSearch;
    })
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  // ─── Pagination ───────────────────────────────────────────
  const totalPages     = Math.max(1, Math.ceil(filtered.length / PLAYERS_PER_PAGE));
  const safePage       = Math.min(currentPage, totalPages);
  const pageStart      = (safePage - 1) * PLAYERS_PER_PAGE;
  const pagePlayers    = filtered.slice(pageStart, pageStart + PLAYERS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [grade, search]);

  // ─── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          fontFamily: "'Fredoka One', cursive",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "64px", animation: "spin 1s linear infinite" }}>🏆</div>
        <h2 style={{ color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>Loading scores...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 16px 60px",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.05); }
        }

        .lb-card {
          width: 100%;
          max-width: 1000px;
          background: rgba(255,255,255,0.97);
          border-radius: 28px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.22);
          overflow: hidden;
          animation: slideUp 0.5s ease both;
        }

        .lb-header {
          background: linear-gradient(135deg, #1e3a8a, #7c3aed);
          padding: 32px 32px 28px;
          text-align: center;
          position: relative;
        }
        .lb-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 6px;
          background: linear-gradient(90deg, #fbbf24, #f87171, #34d399, #60a5fa, #fbbf24);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .lb-title {
          font-family: 'Fredoka One', cursive;
          font-size: clamp(28px, 5vw, 42px);
          color: white;
          margin: 0 0 4px;
          text-shadow: 0 3px 12px rgba(0,0,0,0.3);
        }
        .lb-subtitle {
          color: rgba(255,255,255,0.75);
          font-size: 15px;
          font-weight: 600;
          margin: 0;
        }

        .lb-body { padding: 28px 28px 24px; }

        /* Filters */
        .filter-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
          align-items: center;
        }

        .search-box {
          flex: 1;
          min-width: 180px;
          border: 3px solid #e5e7eb;
          border-radius: 14px;
          padding: 11px 16px;
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fffdf5;
        }
        .search-box:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124,58,237,0.15);
        }

        .grade-pill {
          border: 3px solid #e5e7eb;
          border-radius: 50px;
          padding: 8px 18px;
          font-family: 'Fredoka One', cursive;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          background: #f9fafb;
          color: #6b7280;
          white-space: nowrap;
        }
        .grade-pill:hover  { border-color: #7c3aed; color: #7c3aed; background: #f5f3ff; }
        .grade-pill.active { background: #7c3aed; border-color: #7c3aed; color: white; box-shadow: 0 4px 12px rgba(124,58,237,0.35); }

        .grade-pills-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        /* Table */
        .lb-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
        .lb-table thead th {
          font-family: 'Fredoka One', cursive;
          font-size: 14px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 4px 16px 10px;
          text-align: left;
          border-bottom: 2px solid #f3f4f6;
        }
        .lb-table thead th:last-child { text-align: right; }

        .lb-row {
          background: #f9fafb;
          border-radius: 14px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .lb-row:hover { transform: translateX(4px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .lb-row.gold   { background: linear-gradient(135deg, #fef9c3, #fef3c7); }
        .lb-row.silver { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); }
        .lb-row.bronze { background: linear-gradient(135deg, #fff7ed, #fed7aa); }

        .lb-row td {
          padding: 14px 16px;
          font-weight: 700;
          font-size: 15px;
          vertical-align: middle;
        }
        .lb-row td:first-child { border-radius: 14px 0 0 14px; }
        .lb-row td:last-child  { border-radius: 0 14px 14px 0; text-align: right; }

        .rank-badge {
          font-family: 'Fredoka One', cursive;
          font-size: 18px;
          min-width: 36px;
          display: inline-block;
          text-align: center;
        }

        .grade-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 800;
          color: white;
        }

        .points-badge {
          font-family: 'Fredoka One', cursive;
          font-size: 18px;
          color: #7c3aed;
        }

        .no-results {
          text-align: center;
          padding: 48px 0;
          font-family: 'Fredoka One', cursive;
          font-size: 20px;
          color: #9ca3af;
        }

        /* Pagination */
        .pagination-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .pg-btn {
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 8px 14px;
          font-family: 'Fredoka One', cursive;
          font-size: 16px;
          cursor: pointer;
          background: #f9fafb;
          color: #374151;
          transition: all 0.15s;
          min-width: 42px;
          text-align: center;
        }
        .pg-btn:hover:not(:disabled) { border-color: #7c3aed; color: #7c3aed; background: #f5f3ff; }
        .pg-btn.active { background: #7c3aed; border-color: #7c3aed; color: white; box-shadow: 0 3px 10px rgba(124,58,237,0.35); }
        .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .stat-strip {
          display: flex;
          gap: 12px;
          justify-content: center;
          padding: 16px 28px;
          background: linear-gradient(135deg, #f5f3ff, #ede9fe);
          border-top: 2px dashed #ddd6fe;
          flex-wrap: wrap;
        }
        .stat-chip {
          background: white;
          border-radius: 50px;
          padding: 8px 18px;
          font-family: 'Fredoka One', cursive;
          font-size: 14px;
          color: #7c3aed;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          white-space: nowrap;
        }
      `}</style>

      <div className="lb-card">

        {/* ── Header ── */}
        <div className="lb-header">
          <div style={{ fontSize: "52px", marginBottom: "8px", animation: "pulse 2s ease-in-out infinite" }}>🏆</div>
          <h1 className="lb-title">Global Leaderboard</h1>
          <p className="lb-subtitle">Who's the Maths Champion? 🧠⚡</p>
        </div>

        {/* ── Stats strip ── */}
        <div className="stat-strip">
          <span className="stat-chip">👥 {players.length} students</span>
          <span className="stat-chip">
            🏅 Top scorer: {players[0]?.full_name?.split(" ")[0] || "—"} ({players[0]?.points || 0} pts)
          </span>
          <span className="stat-chip">
            📊 Showing: {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="lb-body">

          {/* Search */}
          <div className="filter-row">
            <input
              type="text"
              className="search-box"
              placeholder="🔍 Search by surname or full name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="grade-pill"
                onClick={() => setSearch("")}
                style={{ color: "#ef4444", borderColor: "#fca5a5" }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Grade pills */}
          <div className="grade-pills-row">
            <button
              className={`grade-pill ${grade === "" ? "active" : ""}`}
              onClick={() => setGrade("")}
            >
              🌍 All Grades
            </button>
            {[1,2,3,4,5,6,7].map((g) => (
              <button
                key={g}
                className={`grade-pill ${grade === String(g) ? "active" : ""}`}
                onClick={() => setGrade(String(g))}
              >
                {GRADE_EMOJIS[g]} Grade {g}
              </button>
            ))}
          </div>

          {/* Table */}
          {pagePlayers.length === 0 ? (
            <div className="no-results">
              <div style={{ fontSize: "52px" }}>😕</div>
              <p>No students found!</p>
              <p style={{ fontSize: "15px", color: "#d1d5db" }}>Try a different grade or search term</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="lb-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>#</th>
                    <th>Student</th>
                    <th>Grade</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {pagePlayers.map((player, idx) => {
                    const globalRank = pageStart + idx;           // 0-based overall rank
                    const isTop3     = globalRank < 3;

                    return (
                      <tr
                        key={player.id}
                        className={`lb-row ${globalRank === 0 ? "gold" : globalRank === 1 ? "silver" : globalRank === 2 ? "bronze" : ""}`}
                      >
                        {/* Rank */}
                        <td>
                          <span className="rank-badge">
                            {isTop3 ? MEDAL[globalRank] : globalRank + 1}
                          </span>
                        </td>

                        {/* Name */}
                        <td>
                          <span style={{ fontSize: "15px" }}>{player.full_name}</span>
                          {globalRank === 0 && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "11px",
                                background: "#fbbf24",
                                color: "#78350f",
                                borderRadius: "50px",
                                padding: "2px 8px",
                                fontWeight: 800,
                              }}
                            >
                              CHAMPION
                            </span>
                          )}
                        </td>

                        {/* Grade */}
                        <td>
                          <span
                            className="grade-tag"
                            style={{ background: GRADE_COLORS[player.grade_id] || "#9ca3af" }}
                          >
                            Grade {player.grade_id}
                          </span>
                        </td>

                        {/* Points */}
                        <td>
                          <span className="points-badge">⭐ {player.points || 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-row">
              <button
                className="pg-btn"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(1)}
                title="First page"
              >
                «
              </button>
              <button
                className="pg-btn"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ‹ Prev
              </button>

              {/* Page number pills — max 5 shown */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  return p === 1 || p === totalPages || Math.abs(p - safePage) <= 2;
                })
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="pg-btn" style={{ cursor: "default", pointerEvents: "none" }}>…</span>
                  ) : (
                    <button
                      key={p}
                      className={`pg-btn ${safePage === p ? "active" : ""}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                className="pg-btn"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next ›
              </button>
              <button
                className="pg-btn"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Last page"
              >
                »
              </button>
            </div>
          )}

          {/* Page info */}
          {filtered.length > 0 && (
            <p
              style={{
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "13px",
                fontWeight: 700,
                marginTop: "12px",
              }}
            >
              Showing {pageStart + 1}–{Math.min(pageStart + PLAYERS_PER_PAGE, filtered.length)} of {filtered.length} students
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalLeaderboard;
