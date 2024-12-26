// src/components/Admin/AdminDashboard.js
import React, { useState } from 'react';
import RoomManagement  from './RoomManagement';
import { UserManagement } from './UserManagement';
import { Statistics } from './Statistics';
//import {RoomManagement} from './RoomManagement';
export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('rooms');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-6">
        <nav className="flex space-x-4 border-b">
          <button
            className={`py-2 px-4 ${
              activeTab === 'rooms'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('rooms')}
          >
            Rooms
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'statistics'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
        </nav>
      </div>

      {activeTab === 'rooms' && <RoomManagement/>}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'statistics' && <Statistics />}
    </div>
  );
};

