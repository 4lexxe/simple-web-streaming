const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { handleConnection } = require('./src/handlers/socketHandler');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

app.get('/health', (req, res) => {
  res.json({ status: 'Screen sharing server running' });
});

io.on('connection', (socket) => {
  handleConnection(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Screen sharing server running on http://localhost:${PORT}`);
});