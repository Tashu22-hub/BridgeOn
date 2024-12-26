// src/components/Chat/ChatRoom.js
// src/components/Chat/ChatRoom.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  
  useEffect(() => {
    if (user) {
      socket.emit('authenticate', user.token);
      socket.emit('join', { roomId });

      socket.on('message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on('roomData', ({ users: roomUsers }) => {
        setUsers(roomUsers);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    return () => {
      socket.off('message');
      socket.off('roomData');
      socket.off('error');
    };
  }, [roomId, user]);

  const sendMessage = (message) => {
    socket.emit('sendMessage', message);
  };



  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSendMessage={sendMessage} />
      <div className="p-4 bg-gray-100">
        <h3 className="font-bold">Online Users:</h3>
        <ul>
          {users.map((username, index) => (
            <li key={index}>{username}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatRoom;

