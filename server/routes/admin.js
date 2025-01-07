const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Room = require('../models/Room');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');


// Admin Authentication
router.use(authenticateToken);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});

// Room Management
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add room
router.post('/rooms', async (req, res) => {
    try {
        const { name, description, isPrivate, password } = req.body;
        
        // Check for duplicate room
        const existingRoom = await Room.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({ error: 'Room name already exists' });
        }

        let hashedPassword = null;
        if (isPrivate && password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const room = new Room({
            name,
            description,
            isPrivate,
            password: hashedPassword,
            createdBy: req.user.id,
            members: [req.user.id]
        });

        await room.save();
        const populatedRoom = await Room.findById(room._id)
            .populate('createdBy', 'username');
            
        res.status(201).json(populatedRoom);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create room' });
    }
});


// Update room
router.put('/rooms/:id', async (req, res) => {
    try {
        const { name, description, isPrivate, password } = req.body;
        
        // Check for duplicate name if name is being changed
        const existing = await Room.findOne({ 
            name, 
            _id: { $ne: req.params.id } 
        });
        if (existing) {
            return res.status(400).json({ error: 'Room name already exists' });
        }

        const updateData = { name, description, isPrivate };
        
        // Only update password if provided
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const room = await Room.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update room' });
    }
});

// Delete room
router.delete('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

//update role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['guest', 'member', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Statistics
router.get('/statistics', async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'week';
    const now = new Date();
    let startDate = new Date();

    switch(timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const [totalUsers, activeUsers, totalRooms] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: startDate } }),
      Room.countDocuments()
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const roomStats = await Room.aggregate([
      { $group: { 
        _id: '$isPrivate',
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalRooms,
      usersByRole: {
        guest: usersByRole.find(r => r._id === 'guest')?.count || 0,
        member: usersByRole.find(r => r._id === 'member')?.count || 0,
        admin: usersByRole.find(r => r._id === 'admin')?.count || 0
      },
      roomStats: {
        public: roomStats.find(r => !r._id)?.count || 0,
        private: roomStats.find(r => r._id)?.count || 0
      },
      activityData: [], // Add your activity data logic if needed
      userGrowth: []  // Add your growth data logic if needed
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;