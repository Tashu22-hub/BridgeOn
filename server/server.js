// server/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');


const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin:"https://connect-on-frontend.vercel.app",
       
        methods: ['GET','POST','PUT','DELETE'],
        allowedHeaders: ['Authorization', 'Content-Type','my-custom-header'],
        credentials: true,
        transports: ['websocket', 'polling']
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin:"http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/admin', require('./routes/admin'));

// Socket.IO handlers
require('./socketHandlers/chatHandler')(io);

// Connect to MongoDB
connectDB();


 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
