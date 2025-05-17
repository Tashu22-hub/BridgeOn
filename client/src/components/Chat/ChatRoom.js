// src/components/Chat/ChatRoom.js
// src/components/Chat/ChatRoom.js
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import { useAuth } from '../../context/AuthContext';
// import { MessageList } from './MessageList';
// import { MessageInput } from './MessageInput';

// export const ChatRoom = () => {
//   const { roomId } = useParams();
//   const { user } = useAuth();
//   const [socket, setSocket] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [users, setUsers] = useState([]);

  
//   useEffect(() => {
//     if (user) {
//       socket.emit('authenticate', user.token);
//       socket.emit('join', { roomId });

//       socket.on('message', (message) => {
//         setMessages((prev) => [...prev, message]);
//       });

//       socket.on('roomData', ({ users: roomUsers }) => {
//         setUsers(roomUsers);
//       });

//       socket.on('error', (error) => {
//         console.error('Socket error:', error);
//       });
//     }

//     return () => {
//       socket.off('message');
//       socket.off('roomData');
//       socket.off('error');
//     };
//   }, [roomId, user]);

//   const sendMessage = (message) => {
//     socket.emit('sendMessage', message);
//   };



//   return (
//     <div className="flex flex-col h-screen">
//       <div className="flex-1 overflow-hidden">
//         <MessageList messages={messages} />
//       </div>
//       <MessageInput onSendMessage={sendMessage} />
//       <div className="p-4 bg-gray-100">
//         <h3 className="font-bold">Online Users:</h3>
//         <ul>
//           {users.map((username, index) => (
//             <li key={index}>{username}</li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default ChatRoom;
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

  // Initialize Socket Connection
  useEffect(() => {
    if (user) {
      const newSocket = io('https://bridgeon-backend.onrender.com'); // Replace with your backend URL
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('authenticate', user.token);
        newSocket.emit('join', { roomId });
      });

      newSocket.on('message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on('roomData', ({ users: roomUsers }) => {
        setUsers(roomUsers);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // Cleanup on component unmount
      return () => {
        newSocket.disconnect();
        console.log('Socket disconnected and cleaned up.');
      };
    }
  }, [user, roomId]); // Recreate socket when user or roomId changes

  // Handle sending messages
  const sendMessage = (message) => {
    if (socket && socket.connected) {
      socket.emit('sendMessage', message);
    } else {
      console.error('Socket not connected. Cannot send message.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 overflow-hidden bg-gray-900">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSendMessage={sendMessage} />
      <div className="p-4 bg-purple-700">
        <h3 className="font-bold text-white">Online Users:</h3>
        <ul className="text-gray-300">
          {users.map((username, index) => (
            <li key={index}>{username}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};


export default ChatRoom;

