import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import socket from "../socket";

// ─────────────────────────────────────────────────────────────
// SVG CHARACTER
// ─────────────────────────────────────────────────────────────
function Character({ side, pulling, winner, loser, color = "#3b82f6" }) {
  return (
    <svg
      viewBox="0 0 80 140"
      width="80"
      height="140"
      style={{
        transform: side === "right" ? "scaleX(-1)" : "scaleX(1)",
        filter: winner
          ? "drop-shadow(0 0 14px gold)"
          : loser
          ? "drop-shadow(0 0 8px #ef4444) grayscale(0.5)"
          : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
        transition: "filter 0.4s",
        display: "block",
      }}
      className={pulling ? "char-pulling" : ""}
    >
      <ellipse cx="40" cy="136" rx="22" ry="5" fill="rgba(0,0,0,0.15)" />
      <rect x="22" y="92" width="14" height="34" rx="7" fill={color} />
      <rect x="44" y="92" width="14" height="34" rx="7" fill={color} />
      <ellipse cx="29" cy="126" rx="11" ry="7" fill="#1e293b" />
      <ellipse cx="51" cy="126" rx="11" ry="7" fill="#1e293b" />
      <rect x="18" y="54" width="44" height="42" rx="14" fill={color} />
      <rect x="18" y="66" width="44" height="5" rx="2" fill="rgba(255,255,255,0.25)" />
      <rect x="18" y="78" width="44" height="5" rx="2" fill="rgba(255,255,255,0.25)" />
      <rect x="0" y="58" width="20" height="12" rx="6" fill={color}
        style={{ transformOrigin:"20px 64px", transform: pulling ? "rotate(-25deg)" : "rotate(0deg)", transition:"transform 0.3s" }} />
      <circle cx={pulling ? "3" : "2"} cy="64" r="7" fill="#fde68a" style={{ transition:"cx 0.3s" }} />
      <rect x="60" y="58" width="20" height="12" rx="6" fill={color}
        style={{ transformOrigin:"60px 64px", transform: pulling ? "rotate(25deg)" : "rotate(0deg)", transition:"transform 0.3s" }} />
      <circle cx="77" cy="64" r="7" fill="#fde68a" />
      <rect x="32" y="42" width="16" height="16" rx="6" fill="#fde68a" />
      <circle cx="40" cy="32" r="24" fill="#fde68a" />
      <ellipse cx="40" cy="10" rx="20" ry="10" fill="#1e293b" />
      <rect x="20" y="10" width="40" height="12" fill="#1e293b" />

      {winner ? (
        <>
          <path d="M 28 30 Q 31 26 34 30" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 46 30 Q 49 26 52 30" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 30 40 Q 40 48 50 40" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <text x="50" y="14" fontSize="18" textAnchor="middle">⭐</text>
        </>
      ) : loser ? (
        <>
          <line x1="27" y1="27" x2="33" y2="33" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="33" y1="27" x2="27" y2="33" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="47" y1="27" x2="53" y2="33" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="53" y1="27" x2="47" y2="33" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M 30 44 Q 40 38 50 44" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="30" cy="30" r="4.5" fill="#1e293b" />
          <circle cx="50" cy="30" r="4.5" fill="#1e293b" />
          <circle cx="31.5" cy="28.5" r="1.5" fill="white" />
          <circle cx="51.5" cy="28.5" r="1.5" fill="white" />
          <path d={pulling ? "M 30 40 Q 40 46 50 40" : "M 31 41 Q 40 45 49 41"}
            stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {pulling && !winner && !loser && (
        <>
          <ellipse cx="10" cy="20" rx="3" ry="5" fill="#93c5fd" opacity="0.7" />
          <ellipse cx="64" cy="16" rx="2.5" ry="4" fill="#93c5fd" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// ROPE
// ─────────────────────────────────────────────────────────────
function Rope({ offset }) {
  const knotX = 50 + offset * 4;
  return (
    <div style={{ width:"100%", height:"70px", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <svg viewBox="0 0 500 50" width="100%" height="50"
        style={{ position:"absolute", top:"50%", transform:"translateY(-50%)" }} preserveAspectRatio="none">
        <path d={`M 20 27 Q 125 32 ${knotX*5} 28 Q ${375} 24 480 27`}
          stroke="rgba(0,0,0,0.15)" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={`M 20 25 Q 125 30 ${knotX*5} 26 Q ${375} 22 480 25`}
          stroke="#d97706" strokeWidth="12" fill="none" strokeLinecap="round" />
        {[0,1,2,3,4,5,6,7].map((i) => (
          <line key={i} x1={40+i*55} y1="18" x2={60+i*55} y2="32"
            stroke="#92400e" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        ))}
        <circle cx={knotX*5} cy="25" r="12" fill="#ef4444" stroke="white" strokeWidth="3" />
        <line x1="250" y1="8" x2="250" y2="42" stroke="white" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.6" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left:  `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    color: ["#fbbf24","#f87171","#34d399","#60a5fa","#a78bfa","#fb923c"][i % 6],
    size:  `${8 + Math.random() * 10}px`,
  }));
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:10 }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position:"absolute", top:"-20px", left:p.left,
          width:p.size, height:p.size, background:p.color,
          borderRadius:"2px",
          animation:`confettiFall 1.8s ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME-OVER MODAL  ← replaces the old alert()
// ─────────────────────────────────────────────────────────────
function GameOverModal({ winner, onGoHome, onLeaderboard }) {
  const isWin = winner === "left";

  const modalConfetti = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left:  `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    color: ["#fbbf24","#f87171","#34d399","#60a5fa","#a78bfa","#fb923c"][i % 6],
    size:  `${5 + Math.random() * 9}px`,
    dur:   `${1.6 + Math.random() * 1.4}s`,
  }));

  return (
    <div className="modal-backdrop-game">
      <div className={`modal-box-game ${isWin ? "win-box" : "lose-box"}`}>

        {/* Blurred colour blobs */}
        {isWin ? (
          <>
            <div className="modal-blob" style={{ width:220, height:220, background:"#fbbf24", opacity:0.13, top:-70, left:-70 }} />
            <div className="modal-blob" style={{ width:160, height:160, background:"#f97316", opacity:0.10, bottom:-40, right:-50 }} />
          </>
        ) : (
          <>
            <div className="modal-blob" style={{ width:200, height:200, background:"#7c3aed", opacity:0.16, top:-60, right:-60 }} />
            <div className="modal-blob" style={{ width:160, height:160, background:"#4f46e5", opacity:0.10, bottom:-40, left:-40 }} />
          </>
        )}

        {/* Falling confetti inside modal (win only) */}
        {isWin && modalConfetti.map((p) => (
          <div key={p.id} style={{
            position:"absolute", width:p.size, height:p.size,
            left:p.left, top:"-10px", background:p.color,
            borderRadius:"3px", pointerEvents:"none", zIndex:0,
            animation:`confettiFall ${p.dur} ${p.delay} ease-in forwards`,
          }} />
        ))}

        {/* Decorative glow ring */}
        <div className={`modal-ring ${isWin ? "ring-gold" : "ring-purple"}`} />

        {/* ── Content ── */}
        <div className="modal-content">

          {/* Emoji */}
          <div className={`modal-emoji-big ${isWin ? "emoji-float" : "emoji-wobble"}`}>
            {isWin ? "🏆" : "😢"}
          </div>

          {/* Heading */}
          {isWin
            ? <h2 className="modal-heading-win">You Win!</h2>
            : <h2 className="modal-heading-lose">So Close!</h2>
          }

          {/* Sub-text */}
          <p className={`modal-subtext ${isWin ? "subtext-win" : "subtext-lose"}`}>
            {isWin
              ? "🎉 Amazing maths skills! You're a champion!"
              : "💪 Great effort! Every game makes you smarter!"}
          </p>

          {/* Spinning stars (win only) */}
          {isWin && (
            <div className="modal-stars-row">
              <span className="modal-star star1">⭐</span>
              <span className="modal-star star2">🌟</span>
              <span className="modal-star star3">⭐</span>
            </div>
          )}

          {/* Points chip */}
          <div className={`modal-chip ${isWin ? "chip-win" : "chip-lose"}`}>
            {isWin ? "🎁 +3 Points Added to Your Score!" : "🧠 Keep Practising — You'll Win Next Time!"}
          </div>

          {/* Primary button */}
          <button className={`modal-btn-primary ${isWin ? "btn-gold" : "btn-purple"}`} onClick={onGoHome}>
            {isWin ? "🏠 Back to Home!" : "🔄 Play Again!"}
          </button>

          {/* Secondary button */}
          <button className="modal-btn-secondary" onClick={onLeaderboard}>
            🏆 See Leaderboard
          </button>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN GAME COMPONENT
// ─────────────────────────────────────────────────────────────
function TugOfWarGame() {
  const { matchId } = useParams();
  const navigate    = useNavigate();

  const [question,     setQuestion]     = useState(null);
  const [answer,       setAnswer]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [ropePosition, setRopePosition] = useState(0);
  const [submitted,    setSubmitted]    = useState(false);
  const [winner,       setWinner]       = useState(null);   // "left" | "right" | null
  const [feedback,     setFeedback]     = useState(null);   // "correct" | "wrong" | null
  const [myScore,      setMyScore]      = useState(0);
  const [oppScore,     setOppScore]     = useState(0);
  const [shake,        setShake]        = useState(false);
  const [showModal,    setShowModal]    = useState(false);  // ✅ styled end-game popup

  const inputRef = useRef(null);
  const grade    = localStorage.getItem("grade");
  const myId     = localStorage.getItem("userId");

  // ─── Fetch question ───────────────────────────────────────
  const fetchQuestion = async () => {
    try {
      const res = await API.get(`/game/question?grade=${grade}`);
      setQuestion(res.data);
      setAnswer("");
      setSubmitted(false);
      setFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error("Question fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestion(); }, []);

  // ─── Socket ───────────────────────────────────────────────
  useEffect(() => {
    if (!matchId) return;

    socket.emit("join-match", { matchId });

    socket.on("rope-update", ({ ropePosition: rp }) => {
      setRopePosition(rp);
    });

    socket.on("game-over", (data) => {
      const winnerId = data.winnerId || data.winner;
      if (!winnerId) { navigate("/student"); return; }

      const iWon = String(winnerId) === String(myId);
      setWinner(iWon ? "left" : "right");

      // ✅ Show styled modal — NO browser alert()
      setTimeout(() => setShowModal(true), 1200);
    });

    return () => {
      socket.off("rope-update");
      socket.off("game-over");
    };
  }, [matchId, navigate]);

  // ─── Submit answer ────────────────────────────────────────
  const handleSubmit = () => {
    if (!answer.trim() || submitted) return;

    const isCorrect =
      answer.trim().toLowerCase() === String(question?.answer).trim().toLowerCase();

    setSubmitted(true);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setMyScore((s) => s + 1);
    } else {
      setOppScore((s) => s + 1);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }

    socket.emit("game-answer", { matchId, isCorrect });
    setTimeout(fetchQuestion, isCorrect ? 900 : 1200);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  const clampedRope = Math.max(-5, Math.min(5, ropePosition));

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 40%, #0f4c75 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px 40px",
      fontFamily: "'Fredoka One', cursive",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* ══════════════════════════ ALL STYLES ══════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap');

        /* ─── Base keyframes ─── */
        @keyframes twinkle {
          0%,100% { opacity: 0.3; } 50% { opacity: 1; }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes correctPop {
          0% { transform: scale(1); } 40% { transform: scale(1.18); } 100% { transform: scale(1); }
        }
        @keyframes wrongShake {
          0%,100%{ transform: translateX(0); }
          20%   { transform: translateX(-8px); }
          40%   { transform: translateX( 8px); }
          60%   { transform: translateX(-5px); }
          80%   { transform: translateX( 5px); }
        }
        @keyframes feedbackFade {
          0%   { opacity: 1; transform: translateY(0)    scale(1);   }
          70%  { opacity: 1; transform: translateY(-20px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.9); }
        }
        @keyframes charPull {
          0%,100% { transform: translateX(0); } 50% { transform: translateX(-4px); }
        }
        @keyframes winnerBounce {
          0%,100% { transform: translateY(0)   scale(1);    }
          40%     { transform: translateY(-12px) scale(1.05); }
        }

        /* ─── Modal keyframes ─── */
        @keyframes backdropIn  { from { opacity: 0; } to { opacity: 1; } }

        @keyframes modalDrop {
          0%   { opacity: 0; transform: scale(0.55) translateY(-80px) rotate(-5deg); }
          55%  { transform: scale(1.07) translateY(8px) rotate(1.5deg); }
          75%  { transform: scale(0.96) translateY(-3px) rotate(-0.5deg); }
          100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
        }
        @keyframes pulseBorderGold {
          0%,100% { box-shadow: 0 0 0 4px rgba(251,191,36,0.45), 0 28px 72px rgba(0,0,0,0.5); }
          50%     { box-shadow: 0 0 0 14px rgba(251,191,36,0.10), 0 28px 72px rgba(0,0,0,0.5); }
        }
        @keyframes pulseBorderPurple {
          0%,100% { box-shadow: 0 0 0 4px rgba(124,58,237,0.45), 0 28px 72px rgba(0,0,0,0.5); }
          50%     { box-shadow: 0 0 0 14px rgba(124,58,237,0.10), 0 28px 72px rgba(0,0,0,0.5); }
        }
        @keyframes floatUp {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-14px); }
        }
        @keyframes sadWobble {
          0%,100% { transform: rotate(0deg); }
          25%     { transform: rotate(-9deg); }
          75%     { transform: rotate( 9deg); }
        }
        @keyframes rainbowShimmer {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg)   scale(1);    }
          50%  { transform: rotate(180deg) scale(1.35); }
          to   { transform: rotate(360deg) scale(1);    }
        }
        @keyframes ringPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.20; }
          50%     { transform: translate(-50%,-50%) scale(1.22); opacity: 0.07; }
        }
        @keyframes chipBounce {
          0%,100% { transform: scale(1);    }
          50%     { transform: scale(1.06); }
        }

        /* ─── Game elements ─── */
        .char-pulling { animation: charPull 0.5s ease-in-out infinite; }

        .game-card {
          width: 100%; max-width: 760px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 28px;
          overflow: hidden;
        }
        .arena {
          background: linear-gradient(135deg, #1a4a6b 0%, #0d3350 100%);
          padding: 24px 16px 12px;
          position: relative;
        }
        .grass {
          height: 24px;
          background: linear-gradient(180deg, #16a34a, #15803d);
          position: relative; margin-top: -4px;
        }
        .grass::after {
          content: '';
          position: absolute;
          top: -8px; left: 0; right: 0; height: 12px;
          background: repeating-linear-gradient(90deg, #22c55e 0, #22c55e 6px, #16a34a 6px, #16a34a 12px);
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        .star-dot {
          position: absolute; background: white; border-radius: 50%;
          animation: twinkle 2s ease-in-out infinite;
        }
        .score-bubble {
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.25);
          border-radius: 50px; padding: 6px 20px;
          color: white; font-size: 20px; text-align: center;
        }
        .tension-track {
          height: 16px; background: rgba(0,0,0,0.3);
          border-radius: 50px; overflow: hidden; position: relative;
          border: 2px solid rgba(255,255,255,0.15);
        }
        .tension-fill {
          position: absolute; top: 0; bottom: 0; border-radius: 50px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .tension-marker {
          position: absolute; top: -4px; bottom: -4px; width: 4px;
          background: white; border-radius: 2px; left: 50%;
          transform: translateX(-50%); box-shadow: 0 0 8px rgba(255,255,255,0.8);
        }
        .q-card {
          background: white; border-radius: 24px;
          padding: 28px 24px; text-align: center;
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        }
        .q-text {
          font-family: 'Fredoka One', cursive;
          font-size: clamp(26px, 6vw, 40px);
          color: #1e293b; margin: 0 0 20px; line-height: 1.2;
        }
        .answer-input {
          width: 100%; max-width: 240px;
          padding: 14px 20px;
          font-family: 'Fredoka One', cursive; font-size: 28px;
          text-align: center; border: 4px solid #e2e8f0;
          border-radius: 18px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          background: #fffdf5; color: #1e293b;
        }
        .answer-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 5px rgba(124,58,237,0.18);
          transform: scale(1.03);
        }
        .answer-input.correct { border-color: #10b981; background: #d1fae5; animation: correctPop 0.4s ease; }
        .answer-input.wrong   { border-color: #ef4444; background: #fee2e2; animation: wrongShake 0.5s ease; }

        .submit-btn {
          padding: 14px 40px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white; border: none; border-radius: 18px;
          font-family: 'Fredoka One', cursive; font-size: 22px;
          cursor: pointer; box-shadow: 0 6px 0 #4c1d95;
          position: relative; top: 0;
          transition: top 0.1s, box-shadow 0.1s; margin-top: 16px;
        }
        .submit-btn:hover:not(:disabled) { top: 2px; box-shadow: 0 4px 0 #4c1d95; }
        .submit-btn:active:not(:disabled){ top: 5px; box-shadow: 0 1px 0 #4c1d95; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .exit-btn {
          padding: 10px 24px;
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 14px;
          font-family: 'Fredoka One', cursive; font-size: 16px;
          cursor: pointer; transition: all 0.2s; margin-top: 12px;
        }
        .exit-btn:hover { background: rgba(255,255,255,0.22); color: white; }

        .feedback-toast {
          position: absolute; top: 20px; left: 50%;
          transform: translateX(-50%);
          font-family: 'Fredoka One', cursive; font-size: 28px;
          padding: 10px 28px; border-radius: 50px;
          pointer-events: none; z-index: 20;
          animation: feedbackFade 1s ease forwards; white-space: nowrap;
        }
        .feedback-toast.correct { background: #d1fae5; color: #065f46; border: 3px solid #10b981; }
        .feedback-toast.wrong   { background: #fee2e2; color: #7f1d1d; border: 3px solid #ef4444; }

        .winner-overlay {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: rgba(0,0,0,0.42);
          backdrop-filter: blur(3px);
          z-index: 15; pointer-events: none;
        }
        .winner-overlay-text {
          font-family: 'Fredoka One', cursive;
          font-size: clamp(28px, 7vw, 48px);
          color: #fbbf24;
          text-shadow: 0 0 30px rgba(251,191,36,0.8), 0 4px 12px rgba(0,0,0,0.5);
          animation: winnerBounce 0.8s ease-in-out infinite;
        }

        /* ════════════════════════════════════
           KID-FRIENDLY GAME-OVER MODAL
        ════════════════════════════════════ */
        .modal-backdrop-game {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.78);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: backdropIn 0.3s ease both;
        }
        .modal-box-game {
          position: relative;
          border-radius: 36px;
          padding: 48px 32px 40px;
          max-width: 400px; width: 100%;
          text-align: center; overflow: hidden;
        }
        .win-box {
          background: linear-gradient(160deg, #0a1f3a 0%, #0c3257 50%, #091e35 100%);
          border: 4px solid #fbbf24;
          animation: modalDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) both,
                     pulseBorderGold 2.5s ease-in-out 0.9s infinite;
        }
        .lose-box {
          background: linear-gradient(160deg, #12052a 0%, #1a0a38 50%, #0f0520 100%);
          border: 4px solid #7c3aed;
          animation: modalDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) both,
                     pulseBorderPurple 2.5s ease-in-out 0.9s infinite;
        }
        .modal-blob {
          position: absolute; border-radius: 50%;
          filter: blur(44px); pointer-events: none; z-index: 0;
        }
        .modal-ring {
          position: absolute; width: 140px; height: 140px;
          border-radius: 50%; left: 50%; top: 76px;
          transform: translate(-50%,-50%);
          pointer-events: none; z-index: 0;
          animation: ringPulse 2.2s ease-in-out infinite;
        }
        .ring-gold   { background: radial-gradient(circle, #fbbf24, transparent 70%); }
        .ring-purple { background: radial-gradient(circle, #7c3aed, transparent 70%); }

        .modal-content { position: relative; z-index: 1; }

        .modal-emoji-big {
          font-size: 90px; line-height: 1;
          display: block; margin-bottom: 4px;
        }
        .emoji-float  { animation: floatUp   2.2s ease-in-out infinite; }
        .emoji-wobble { animation: sadWobble 1.8s ease-in-out infinite; }

        .modal-heading-win {
          font-family: 'Fredoka One', cursive;
          font-size: clamp(38px, 9vw, 54px);
          margin: 10px 0 6px;
          background: linear-gradient(90deg, #fbbf24, #f97316, #fde68a, #fbbf24);
          background-size: 260% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbowShimmer 2.5s linear infinite;
        }
        .modal-heading-lose {
          font-family: 'Fredoka One', cursive;
          font-size: clamp(34px, 8vw, 48px);
          color: #c4b5fd; margin: 10px 0 6px;
          text-shadow: 0 2px 18px rgba(167,139,250,0.55);
        }
        .modal-subtext {
          font-family: 'Nunito', sans-serif;
          font-weight: 800; font-size: 16px;
          margin: 6px 0 20px; line-height: 1.5;
        }
        .subtext-win  { color: #bbf7d0; }
        .subtext-lose { color: #ddd6fe; }

        .modal-stars-row {
          display: flex; justify-content: center;
          gap: 10px; margin-bottom: 18px;
        }
        .modal-star { font-size: 36px; display: inline-block; animation: starSpin 2s ease-in-out infinite; }
        .star1 { animation-delay: 0s;    }
        .star2 { animation-delay: 0.25s; }
        .star3 { animation-delay: 0.5s;  }

        .modal-chip {
          display: inline-block; border-radius: 50px;
          padding: 10px 22px;
          font-family: 'Fredoka One', cursive; font-size: 16px;
          margin-bottom: 26px;
          animation: chipBounce 1.8s ease-in-out infinite;
          line-height: 1.3;
        }
        .chip-win  { background: rgba(251,191,36,0.18); border: 2.5px solid rgba(251,191,36,0.5); color: #fde68a; }
        .chip-lose { background: rgba(167,139,250,0.15); border: 2.5px solid rgba(167,139,250,0.4); color: #ddd6fe; }

        .modal-btn-primary {
          display: block; width: 100%; padding: 17px;
          border: none; border-radius: 20px;
          font-family: 'Fredoka One', cursive; font-size: 23px;
          cursor: pointer; margin-bottom: 12px;
          position: relative; top: 0;
          transition: top 0.12s, box-shadow 0.12s, filter 0.15s;
        }
        .btn-gold {
          background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
          color: #78350f;
          box-shadow: 0 7px 0 #92400e, 0 14px 30px rgba(251,191,36,0.35);
          text-shadow: 0 1px 2px rgba(0,0,0,0.12);
        }
        .btn-gold:hover  { filter: brightness(1.08); top: 2px; box-shadow: 0 5px 0 #92400e, 0 10px 22px rgba(251,191,36,0.3); }
        .btn-gold:active { top: 6px; box-shadow: 0 1px 0 #92400e; }

        .btn-purple {
          background: linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6);
          color: white;
          box-shadow: 0 7px 0 #4c1d95, 0 14px 30px rgba(124,58,237,0.35);
        }
        .btn-purple:hover  { filter: brightness(1.1); top: 2px; box-shadow: 0 5px 0 #4c1d95, 0 10px 22px rgba(124,58,237,0.3); }
        .btn-purple:active { top: 6px; box-shadow: 0 1px 0 #4c1d95; }

        .modal-btn-secondary {
          display: block; width: 100%; padding: 13px;
          border: 2.5px solid rgba(255,255,255,0.18);
          border-radius: 16px; background: transparent;
          font-family: 'Fredoka One', cursive; font-size: 17px;
          color: rgba(255,255,255,0.5); cursor: pointer;
          transition: all 0.18s;
        }
        .modal-btn-secondary:hover {
          background: rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.9);
          border-color: rgba(255,255,255,0.35);
        }
      `}</style>

      {/* ── Twinkling background stars ── */}
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="star-dot" style={{
          width:  `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          top:    `${Math.random() * 35}%`,
          left:   `${Math.random() * 100}%`,
          animationDelay:    `${Math.random() * 2}s`,
          animationDuration: `${1.5 + Math.random() * 2}s`,
        }} />
      ))}

      {/* ── Title ── */}
      <h1 style={{
        color: "white", fontSize: "clamp(22px,5vw,36px)",
        textShadow: "0 3px 12px rgba(0,0,0,0.5)",
        marginBottom: "20px", textAlign: "center",
      }}>
        🪢 Maths Tug of War!
      </h1>

      {/* ── Game card ── */}
      <div className="game-card">

        {/* Arena */}
        <div className="arena">
          {winner && <Confetti />}

          {/* Soft in-arena overlay — full message is in the modal */}
          {winner && (
            <div className="winner-overlay">
              <div className="winner-overlay-text">
                {winner === "left" ? "🏆 Amazing!" : "💪 So Close!"}
              </div>
            </div>
          )}

          {/* Scoreboard */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
            <div className="score-bubble">
              <div style={{ fontSize:"11px", opacity:0.7, fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>YOU</div>
              <div style={{ fontSize:"28px" }}>{myScore}</div>
            </div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontFamily:"'Fredoka One',cursive", fontSize:"20px" }}>VS</div>
            <div className="score-bubble">
              <div style={{ fontSize:"11px", opacity:0.7, fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>OPPONENT</div>
              <div style={{ fontSize:"28px" }}>{oppScore}</div>
            </div>
          </div>

          {/* Tension bar */}
          <div style={{ marginBottom:"20px" }}>
            <div className="tension-track">
              <div className="tension-fill" style={{ left:0, width:`${50+clampedRope*-5}%`, background:"linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
              <div className="tension-fill" style={{ right:0, width:`${50+clampedRope*5}%`,  background:"linear-gradient(270deg,#ef4444,#f87171)" }} />
              <div className="tension-marker" />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"4px" }}>
              <span style={{ color:"#60a5fa", fontSize:"11px", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>◀ You</span>
              <span style={{ color:"#f87171", fontSize:"11px", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>Them ▶</span>
            </div>
          </div>

          {/* Characters + Rope */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", padding:"0 8px", position:"relative" }}>
            <div style={{ flex:"0 0 auto", transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1)", transform:`translateX(${clampedRope*8}px)` }}>
              <Character side="left"  pulling={!winner} winner={winner==="left"}  loser={winner==="right"} color="#3b82f6" />
            </div>
            <div style={{ flex:"1", transition:"transform 0.4s ease" }}>
              <Rope offset={clampedRope} />
            </div>
            <div style={{ flex:"0 0 auto", transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1)", transform:`translateX(${clampedRope*-8}px)` }}>
              <Character side="right" pulling={!winner} winner={winner==="right"} loser={winner==="left"}  color="#ef4444" />
            </div>
          </div>

          <div className="grass" />
        </div>

        {/* Question card */}
        <div style={{ padding:"24px" }}>
          <div className="q-card" style={{ position:"relative" }}>

            {feedback && (
              <div className={`feedback-toast ${feedback}`}>
                {feedback === "correct" ? "✅ Correct! +1" : "❌ Wrong! Try again!"}
              </div>
            )}

            {loading ? (
              <div style={{ padding:"30px 0", color:"#9ca3af", fontFamily:"'Fredoka One',cursive", fontSize:"20px" }}>
                <div style={{ fontSize:"36px" }}>🧮</div>
                Loading question...
              </div>
            ) : (
              <>
                <div style={{ marginBottom:"12px" }}>
                  <span style={{ background:"#ede9fe", color:"#7c3aed", borderRadius:"50px", padding:"4px 14px", fontSize:"13px", fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>
                    Grade {grade} • Maths
                  </span>
                </div>
                <p className="q-text">{question?.question}</p>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  className={`answer-input ${feedback || ""}`}
                  placeholder="?"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={submitted}
                  autoComplete="off"
                />
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <button className="submit-btn" onClick={handleSubmit} disabled={submitted || !answer.trim()}>
                    {submitted ? "⏳ Next..." : "🚀 Submit!"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign:"center" }}>
            <button className="exit-btn" onClick={() => navigate("/student")}>🚪 Exit Game</button>
          </div>
        </div>
      </div>

      {/* ════════ STYLED GAME-OVER MODAL ════════ */}
      {showModal && (
        <GameOverModal
          winner={winner}
          onGoHome={() => navigate("/student")}
          onLeaderboard={() => navigate("/leaderboard")}
        />
      )}

    </div>
  );
}

export default TugOfWarGame;
