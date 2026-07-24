const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

/**
 * Every connected user is joined to a private room named `user:<id>`.
 * To push something to one user from anywhere in the backend, do:
 *   getIO().to(`user:${userId}`).emit("notification:new", payload);
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Auth handshake: the frontend must connect with
  //   io(url, { auth: { token: accessToken } })
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    console.log(`Socket connected: user ${socket.userId} (${socket.id})`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: user ${socket.userId} (${socket.id})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io has not been initialized yet. Call initSocket(server) first.");
  return io;
};

module.exports = { initSocket, getIO };
