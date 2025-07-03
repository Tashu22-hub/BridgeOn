// server/routes/rooms.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Room = require('../models/Room');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
 
// Apply authentication to all routes
router.use(authenticateToken);

// Get all rooms
router.get('/roomlist', async (req, res) => {
    try {
        const rooms = await Room.find()
            .select('-password')
            .populate('createdBy', 'username')
            .populate('members', 'username');

        //console.log(rooms);
        const formattedRooms = rooms.map((room) => ({
            ...room.toObject(),
            members: room.members.map(member => ({
                _id: member._id,
                username: member.username
            }))
        }));
        //console.log(formattedRooms);
        res.status(201).json(formattedRooms);
        console.log(formattedRooms);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



// Create room
router.post('/', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { name, isPrivate = false, description = '', password } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Room name is required' });
        }

        const existingRoom = await Room.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({ error: 'Room already exists' });
        }

        let hashedPassword = null;
        if (isPrivate && password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const room = new Room({
            name,
            isPrivate,
            description,
            createdBy: req.user.id,
            password: hashedPassword,
            members: [req.user.id]
        });

        await room.save();
       
        const populatedRoom = await Room.findById(room._id)
            .select('-password')
            .populate('members', 'username');
        
        res.status(201).json(populatedRoom);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// Update room
router.put('/:id', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { name, description, isPrivate, password } = req.body;
        
        const updateData = { name, description, isPrivate };
        
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const room = await Room.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update room' });
    }
});

// Delete room
router.delete('/:id', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

// Join room
router.post('/:id/join', async (req, res) => {
    try {
        const { password } = req.body;
        const room = await Room.findById(req.params.id).select('+password');

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if user is already a member
        if (room.members.includes(req.user.id)) {
            return res.json({ 
                message: 'Already a member', 
                roomId: room._id 
            });
        }

        // Admin can join any room without password
        if (room.isPrivate && req.user.role !== 'admin') {
            if (!room.password) {
                return res.status(403).json({ error: 'Room password is not set' });
            }

            const isPasswordCorrect = await bcrypt.compare(password, room.password);
            if (!isPasswordCorrect) {
                return res.status(403).json({ error: 'Invalid password' });
            }
        }

        // Add user to room members
        room.members.push(req.user.id);
        await room.save();

        // Update user's subscribed rooms
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { subscribedRooms: room._id }
        });

        res.json({ 
            message: 'Successfully joined room', 
            roomId: room._id 
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
