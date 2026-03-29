import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import socket from "../socket";

// 🎮 THREE JS
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useFBX } from "@react-three/drei";

// ----------------------
// 🧠 Detect WebGL Support
// ----------------------
function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// ----------------------
// 🧍 3D PLAYER (FBX MODEL)
// ----------------------
function PlayerModel({ url, position }) {
  const fbx = useFBX(url);

  return (
    <primitive
      object={fbx}
      scale={0.02}
      position={position}
    />
  );
}

// ----------------------
// 🪢 3D ROPE
// ----------------------
function Rope3D({ ropePosition }) {
  return (
    <mesh position={[ropePosition, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 6, 32]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

// ----------------------
// 🎨 2D GAME (KID FRIENDLY)
// ----------------------
function Game2D({ ropePosition, winner }) {
  return (
    <div
      style={{
        height: "300px",
        background: "linear-gradient(to right, #6EE7B7, #3B82F6)",
        borderRadius: "20px",
        position: "relative",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      {/* LEFT PLAYER */}
      <div
        style={{
          position: "absolute",
          left: `${20 + ropePosition * 5}px`,
          bottom: "20px",
          fontSize: "60px",
          transition: "all 0.3s",
          transform: winner === "left" ? "scale(1.3)" : "scale(1)",
        }}
      >
        🧑‍🚀
      </div>

      {/* RIGHT PLAYER */}
      <div
        style={{
          position: "absolute",
          right: `${20 - ropePosition * 5}px`,
          bottom: "20px",
          fontSize: "60px",
          transition: "all 0.3s",
          transform: winner === "right" ? "scale(1.3)" : "scale(1)",
        }}
      >
        🧑‍🎤
      </div>

      {/* ROPE */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `calc(50% + ${ropePosition * 25}px)`,
          transform: "translate(-50%, -50%)",
          width: "220px",
          height: "12px",
          background: "orange",
          borderRadius: "10px",
          transition: "all 0.3s ease",
        }}
      />

      {/* CENTER LINE */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: "4px",
          background: "red",
        }}
      />

      {/* WIN ANIMATION */}
      {winner && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            width: "100%",
            textAlign: "center",
            fontSize: "30px",
            animation: "bounce 1s infinite",
          }}
        >
          🎉 WINNER! 🎉
        </div>
      )}
    </div>
  );
}

// ----------------------
// 🎮 MAIN GAME
// ----------------------
function TugOfWarGame() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  const [ropePosition, setRopePosition] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [use3D, setUse3D] = useState(true);
  const [winner, setWinner] = useState(null);

  const grade = localStorage.getItem("grade");

  // ---------------- FETCH QUESTION ----------------
  const fetchQuestion = async () => {
    try {
      const res = await API.get(`/game/question?grade=${grade}`);
      setQuestion(res.data);
      setAnswer("");
      setSubmitted(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  // ---------------- WEBGL CHECK ----------------
  useEffect(() => {
    if (!isWebGLAvailable()) {
      setUse3D(false);
    }
  }, []);

  // ---------------- SOCKET ----------------
  useEffect(() => {
    if (!matchId) return;

    socket.emit("join-match", { matchId });

    socket.on("rope-update", ({ ropePosition }) => {
      setRopePosition(ropePosition);
    });

    socket.on("game-over", (data) => {
      console.log("GAME OVER DATA:", data);

      const winnerId = data.winnerId || data.winner;

      if (!winnerId) {
        alert("Game finished!");
        navigate("/student");
        return;
      }

      const myId = localStorage.getItem("userId");

      if (String(winnerId) === String(myId)) {
        setWinner("left");
        setTimeout(() => {
          alert("🏆 You Win!!! 🎉");
          navigate("/student");
        }, 1500);
      } else {
        setWinner("right");
        setTimeout(() => {
          alert("😢 You Lost!");
          navigate("/student");
        }, 1500);
      }
    });

    return () => {
      socket.off("rope-update");
      socket.off("game-over");
    };
  }, [matchId, navigate]);

  // ---------------- SUBMIT ----------------
  const handleSubmit = () => {
    if (!answer) return;

    const isCorrect =
      answer.trim() === String(question?.answer).trim();

    socket.emit("game-answer", {
      matchId,
      isCorrect,
    });

    setSubmitted(true);
    setTimeout(fetchQuestion, 700);
  };

  // ---------------- UI ----------------
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        background: "linear-gradient(to bottom, #fef3c7, #fca5a5)",
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        🪢 Tug of War Maths
      </h1>

      {/* 🎮 GAME AREA */}
      {use3D ? (
        <div style={{ height: "400px" }}>
          <Canvas>
            <ambientLight />
            <directionalLight position={[5, 5, 5]} />

            {/* PLAYERS */}
            <PlayerModel
              url="/models/playerA.glb.fbx"
              position={[-3 + ropePosition, 0, 0]}
            />
            <PlayerModel
              url="/models/playerB.glb.fbx"
              position={[3 + ropePosition, 0, 0]}
            />

            {/* ROPE */}
            <Rope3D ropePosition={ropePosition} />

            <OrbitControls />
          </Canvas>
        </div>
      ) : (
        <Game2D ropePosition={ropePosition} winner={winner} />
      )}

      {/* QUESTION */}
      <div
        style={{
          marginTop: "20px",
          background: "white",
          padding: "20px",
          borderRadius: "15px",
          textAlign: "center",
        }}
      >
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h2>{question?.question}</h2>

            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitted}
              style={{
                padding: "10px",
                fontSize: "18px",
                marginTop: "10px",
              }}
            />

            <div style={{ marginTop: "10px" }}>
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={() => navigate("/student")}>
                Exit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TugOfWarGame;