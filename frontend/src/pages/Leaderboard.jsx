import React, { useEffect, useState } from "react";
import API from "../api/api";
import socket from "../socket";
import bgImage from "../assets/login-bg.png";

const Leaderboard = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  // 🎯 LEVEL SYSTEM
  const getLevel = (points) => {
    if (points >= 400) return 10;
    if (points >= 300) return 9;
    if (points >= 230) return 8;
    if (points >= 170) return 7;
    if (points >= 120) return 6;
    if (points >= 80) return 5;
    if (points >= 50) return 4;
    if (points >= 25) return 3;
    if (points >= 10) return 2;
    return 1;
  };

  // 🎯 BADGES SYSTEM
  const getBadges = (points, wins = 0) => {
    let badges = [];

    if (wins >= 1) badges.push("🥇 First Win");
    if (wins >= 3) badges.push("🔥 Hot Streak");
    if (wins >= 10) badges.push("🧠 Math Genius");
    if (points >= 400) badges.push("👑 Champion");

    return badges;
  };

  // ---------------- FETCH PLAYER ----------------
  const fetchPlayer = async () => {
    try {
      const res = await API.get(`/dashboard/leaderboard`);
      const players = res.data.leaderboard || [];

      const currentPlayer = players.find(p => p.id == userId);

      if (currentPlayer) {
        setPlayer(currentPlayer);
      }
    } catch (err) {
      console.error("❌ Error fetching player:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, []);

  // 🔥 REAL-TIME UPDATE
  useEffect(() => {
    socket.on("leaderboard-updated", () => {
      fetchPlayer();
    });

    return () => {
      socket.off("leaderboard-updated");
    };
  }, []);

  if (loading || !player) {
    return (
      <div className="text-center mt-5">
        <h3>Loading your progress...</h3>
      </div>
    );
  }

  const level = getLevel(player.points);
  const badges = getBadges(player.points, player.points / 3);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="card shadow p-4 text-center"
        style={{
          width: "90%",
          maxWidth: "500px",
          borderRadius: "20px",
          backgroundColor: "rgba(255,255,255,0.95)",
        }}
      >
        <h2 className="mb-3">🎮 Your Progress</h2>

        <h3>{player.full_name}</h3>

        {/* ⭐ LEVEL */}
        <div className="my-3">
          <h4>⭐ Level {level}</h4>
          <div className="progress">
            <div
              className="progress-bar bg-success"
              style={{
                width: `${(player.points % 50) * 2}%`,
              }}
            >
              {player.points} pts
            </div>
          </div>
        </div>

        {/* 🏆 POINTS */}
        <h5 className="mt-3">🏆 Total Points: {player.points}</h5>

        {/* 🏅 BADGES */}
        <div className="mt-4">
          <h5>🏅 Badges</h5>

          {badges.length === 0 ? (
            <p className="text-muted">No badges yet 😢</p>
          ) : (
            <div>
              {badges.map((badge, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: "20px",
                    margin: "5px",
                    display: "inline-block",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 🎯 MOTIVATION */}
        <div className="mt-4">
          <p className="text-muted">
            Keep playing to unlock more levels and badges 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;