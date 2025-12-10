require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initializeSocket } = require('./src/socket');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initializeSocket(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server initialized`);
});

module.exports = server;
