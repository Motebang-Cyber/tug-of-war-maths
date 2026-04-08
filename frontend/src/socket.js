import { io } from "socket.io-client";

// 🔥 AUTO SWITCH BETWEEN LOCAL + PRODUCTION
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://tug-of-war-backend-wmde.onrender.com" 
    : "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // 🔥 forces websocket (better for Render)
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;
