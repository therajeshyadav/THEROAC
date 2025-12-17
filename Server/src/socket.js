const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const NotificationService = require('./services/notificationService');

let io;
let notificationService;

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Initialize notification service with io
  notificationService = new NotificationService(io);

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.join(`user_${socket.userId}`);

    // Send connection confirmation
    socket.emit('connected', { 
      message: 'Connected to notification server',
      userId: socket.userId 
    });

    // Handle manual notification request
    socket.on('request_notifications', async () => {
      try {
        const { Notification } = require('./models');
        const notifications = await Notification.findAll({
          where: { userId: socket.userId, read: false },
          order: [['createdAt', 'DESC']],
          limit: 10
        });
        socket.emit('notifications_list', notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    });

    // Handle mark as read
    socket.on('mark_notification_read', async (notificationId) => {
      try {
        const { Notification } = require('./models');
        await Notification.update(
          { read: true, readAt: new Date() },
          { where: { id: notificationId, userId: socket.userId } }
        );
        socket.emit('notification_marked_read', { notificationId });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

function getNotificationService() {
  if (!notificationService) {
    throw new Error('Notification service not initialized');
  }
  return notificationService;
}

module.exports = {
  initializeSocket,
  getIO,
  getNotificationService
};
