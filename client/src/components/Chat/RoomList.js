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
        const response = await fetch('http://localhost:5000/api/rooms/roomlist', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        const contentType = response.headers.get('Content-Type');
        
        // if (!response.ok) {
        //   const text = await response.text(); // Log the HTML response if it's not JSON
        //   throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
        // }
        
        const data = await response.json();
        
        if (!response.ok){
          
          throw new Error(data.error);
        }
        setRooms(data);
        
        // Initialize joined rooms from the fetched data
        const joined = new Set(data
          .filter(room => room.members.some(member => member._id === user.id))
          .map(room => room._id));
        setJoinedRooms(joined);
      } catch (err) {
        console.error('Error fetching rooms:', err.message);
        setError('Please Login to see rooms');
      }
    };

    fetchRooms();
  }, []);
  // useEffect(() => {
  //   const fetchRooms = async () => {
  //     try {
  //       const response = await fetch('/api/rooms/roomlist', {
  //         method: 'GET',
  //         headers: {
  //            'Authorization': `Bearer ${user.token}`,
  //           'Content-Type': 'application/json',
  //         },
  //         credentials: 'include',
  //       });
  //       console.log(response.body)
  //       const contentType = response.headers.get('Content-Type');
  //       console.log(contentType);
  
  //       if (!response.ok) {
  //         const errorText = await response.text();  // Read the body as text if it's an error
  //         throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
  //       }
  
  //       // Only parse JSON if the content type is JSON
  //       if (contentType && contentType.includes('application/json')) {
  //         const data = await response.body.json();
  //         console.log(data);
  
  //         setRooms(data);
  
  //         // Initialize joined rooms from the fetched data
  //         const joined = new Set(
  //           data
  //             .filter(room => room.members.some(member => member._id === user.id))
  //             .map(room => room._id)
  //         );
  //         setJoinedRooms(joined);
  //       } else if (contentType && contentType.includes('text/html')) {
  //         // If the content is HTML (likely an error page), read it as text
  //         const htmlResponse = await response.text();
  //         console.error("Received HTML response instead of JSON:", htmlResponse);
  //         throw new Error("Expected JSON, but received HTML response.");
  //       } else {
  //         // Handle any other unexpected content types
  //         throw new Error('Unexpected response format');
  //       }
  //     } catch (err) {
  //       console.error('Error fetching rooms:', err.message);
  //       setError('Failed to fetch rooms.');
  //     }
  //   };
  
  //   fetchRooms();
  // }, [user.token, user.id]);
  
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
      const response = await fetch(`http://localhost:5000/api/rooms/${room._id}/join`, {
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
<div className="container mx-auto p-4 bg-black min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-500">Available Zones</h2>
      
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-2xl font-bold mb-2 text-white">{room.name}</h3>
            <p className="text-gray-300">{room.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm ${room.isPrivate ? 'text-red-400' : 'text-green-400'}`}>
                {room.isPrivate ? 'Private' : 'Public'}
              </span>
              <button
                onClick={() => handleRoomClick(room)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700"
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
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Join
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
