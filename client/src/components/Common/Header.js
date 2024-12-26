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
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          ChatRoom App
        </Link>
        <nav className="space-x-4">
          {user ? (
            <>
              <Link to="/rooms" className="hover:text-blue-200">
                Rooms
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-200">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="hover:text-blue-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link to="/register" className="hover:text-blue-200">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};