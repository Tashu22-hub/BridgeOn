import React ,{ useEffect }from 'react';
import socket from './socket';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Common/Header';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { RoomList } from './components/Chat/RoomList';
import { ChatRoom } from './components/Chat/ChatRoom';
import { AdminDashboard } from './components/Admin/AdminDashboard'; 

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/rooms" />;
  }

  return children;
};

const App = () => {
  useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to WebSocket server:', socket.id);
        });

        socket.on('message', (data) => {
            console.log('Message received:', data);
        });

        socket.on('disconnect', () => {
            console.warn('Disconnected from WebSocket server');
        });

        return () => {
            socket.disconnect(); // Cleanup on component unmount
        };
    }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black">
          <Header />
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Navigate to="/rooms" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/rooms" element={<RoomList />} />
              <Route
                path="/room/:roomId"
                element={
                  <PrivateRoute>
                    <ChatRoom />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute requireAdmin>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

