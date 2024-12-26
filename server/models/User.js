const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['guest', 'member', 'admin'], default: 'guest' },
    subscribedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    joinDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
