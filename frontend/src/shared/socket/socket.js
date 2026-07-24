import { io } from "socket.io-client";

// Same host as axiosInstance's baseURL, but without the /api prefix —
// Socket.IO does its own HTTP upgrade handshake at the server root.
const SOCKET_URL = "http://localhost:3000";

let socket = null;

/**
 * Creates (or reuses) the single socket connection for the app, authenticated
 * with the current access token. Call this once the user is logged in.
 */
export const connectSocket = (token) => {
  if (!token) return null;

  if (socket && socket.connected && socket.auth?.token === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
