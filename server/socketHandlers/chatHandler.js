const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');

const connectedUsers = new Map();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('authenticate', async (token) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                connectedUsers.set(socket.id, user);
            } catch (error) {
                connectedUsers.set(socket.id, { role: 'guest' });
            }
        });

        


        socket.on('join', async ({ roomId, password }) => {
  try {
    const user = connectedUsers.get(socket.id);
    const room = await Room.findById(roomId);

    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    // Private Room Check
    if (room.isPrivate) {
      if (user.role === 'guest') {
        socket.emit('error', 'Members only room');
        return;
      }
      
      // If it's a private room and the user is a guest, check password
      if (user.role !== 'admin' && room.password && password !== room.password) {
        socket.emit('error', 'Invalid room password');
        return;
      }
    }

    // Leave previous room if any
    const currentRoom = [...socket.rooms][1]; 
    if (currentRoom) {
      socket.leave(currentRoom);
      socket.to(currentRoom).emit('message', {
        user: 'admin',
        text: `${user.username || 'A user'} has left.`
      });
    }

    // Join new room
    socket.join(roomId);
    socket.emit('message', {
      user: 'admin',
      text: `Welcome to ${room.name}!`
    });

    socket.to(roomId).emit('message', {
      user: 'admin',
      text: `${user.username || 'A user'} has joined!`
    });

    // Update room users list
    const roomUsers = await Promise.all(
      Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        .map(async (socketId) => {
          const user = connectedUsers.get(socketId);
          return user?.username || 'Anonymous';
        })
    );

    io.to(roomId).emit('roomData', {
      room: room.name,
      users: roomUsers
    });
  } catch (error) {
    socket.emit('error', 'Error joining room');
  }
});


        socket.on('sendMessage', async (message) => {
            const user = connectedUsers.get(socket.id);
            const room = Array.from(socket.rooms).find((r) => r !== socket.id); // Ensure correct room is retrieved

    if (room) {
        console.log('Emitting message:', {
            user: user?.username || 'Anonymous',
            text: message,
        });

        io.to(room).emit('message', {
            user: user?.username || 'Anonymous',
            text: message || '',
        });
            }
        });

        socket.on('disconnect', () => {
            const user = connectedUsers.get(socket.id);
            connectedUsers.delete(socket.id);
            console.log('User disconnected:', { user });

            socket.rooms.forEach(room => {
                if (room !== socket.id) {
                    io.to(room).emit('message', {
                        user: 'admin',
                        text: `${user?.username || 'A user'} has left.`
                    });
                }
            });
        });
    });
};