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
      origin: (origin, callback) => callback(null, true),
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
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);
    console.log(`[Socket.IO Server]: Socket connected (${socket.id}). User joined room: ${userRoom}`);

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO Server]: Socket disconnected (${socket.id}) for user ${socket.userId}. Reason: ${reason}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io has not been initialized yet. Call initSocket(server) first.");
  return io;
};

module.exports = { initSocket, getIO };
