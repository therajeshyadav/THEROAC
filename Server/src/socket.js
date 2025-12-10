const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const NotificationService = require('./services/notificationService');
const { Notification } = require('./models');

let io;
let notificationService;

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          "https://theroac.com",
          "https://www.theroac.com",
          "http://localhost:3000"
        ];

        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.log("Socket.io CORS blocked:", origin);
        return callback(null, false);
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  notificationService = new NotificationService(io);
  io.use((socket, next) => {
    try {
      const headerToken = socket.handshake.headers?.authorization;
      const tokenFromHeader = headerToken?.startsWith("Bearer ")
        ? headerToken.split(" ")[1]
        : null;

      const token =
        socket.handshake.auth?.token ||
        tokenFromHeader;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);
    socket.join(`user_${socket.userId}`);
    socket.emit("connected", {
      message: "Connected to notification server",
      userId: socket.userId
    });

    socket.on("request_notifications", async () => {
      try {
        const notifications = await Notification.findAll({
          where: { userId: socket.userId, read: false },
          order: [["createdAt", "DESC"]],
          limit: 10
        });

        socket.emit("notifications_list", notifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    });

    socket.on("mark_notification_read", async (notificationId) => {
      try {
        await Notification.update(
          { read: true, readAt: new Date() },
          { where: { id: notificationId, userId: socket.userId } }
        );

        socket.emit("notification_marked_read", { notificationId });
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });

    socket.on("error", (err) => {
      console.error("Socket Error:", err);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

function getNotificationService() {
  if (!notificationService) {
    throw new Error("Notification service not initialized");
  }
  return notificationService;
}

module.exports = {
  initializeSocket,
  getIO,
  getNotificationService
};
