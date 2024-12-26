// src/components/Chat/RoomList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../Common/Modal';

export const RoomList = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms', {
          method: 'GET',
          headers: {
    
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setRooms(data);
        
        // Initialize joined rooms from the fetched data
        const joined = new Set(data
          .filter(room => room.members.some(member => member._id === user.id))
          .map(room => room._id));
        setJoinedRooms(joined);
      } catch (err) {
        console.error('Error fetching rooms:', err.message);
        setError('Failed to fetch rooms.');
      }
    };

    fetchRooms();
  }, []);

  const handleRoomClick = (room) => {
    if (joinedRooms.has(room._id)) {
      // If already joined, navigate directly to the room
      navigate(`/rooms/${room._id}`);
    } else if (room.isPrivate && user.role !== 'admin') {
      // If private room and not admin, show password modal
      setSelectedRoom(room);
      setIsModalOpen(true);
    } else {
      // For public rooms or admin users, join directly
      handleJoinRoom(room);
    }
  };

  const handleJoinRoom = async (room, password = null) => {
    try {
      const response = await fetch(`/api/rooms/${room._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Add room to joined rooms
      setJoinedRooms(prev => new Set([...prev, room._id]));
      setIsModalOpen(false);
      setPassword('');
      navigate(`/room/${room._id}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    handleJoinRoom(selectedRoom, password);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold">{room.name}</h3>
            <p className="text-gray-600">{room.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm ${room.isPrivate ? 'text-red-500' : 'text-green-500'}`}>
                {room.isPrivate ? 'Private' : 'Public'}
              </span>
              <button
                onClick={() => handleRoomClick(room)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {joinedRooms.has(room._id) ? 'Continue Chatting' : 'Join Room'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setError('');
            setPassword('');
          }}
          title="Enter Room Password"
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Room Password"
              className="w-full p-2 border rounded"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Join
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};