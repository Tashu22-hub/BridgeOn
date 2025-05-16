import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-purple-500 text-xl font-bold">
        BridgeOn
        </Link>
        <nav className="space-x-4">
          {user ? (
            <>
              <Link to="/rooms" className="text-purple-500 hover:text-purple-700">
                HUBS
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-purple-500 hover:text-purple-700">
                  ADMIN
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-purple-500 hover:text-purple-700"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-purple-500 hover:text-purple-700 focus:ring-white">
                LOGIN
              </Link>
              <Link to="/register" className="text-purple-500 hover:text-purple-700 focus:ring-white">
                REGISTER
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};