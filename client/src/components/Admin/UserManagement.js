// src/components/Admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserDetailsModal } from './UserDetailsModal';



export const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage,setSuccessMessage]=useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://bridgeon-backend.onrender.com/api/admin/users', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUsers(data);
    } catch (err) {
      setError('Error fetching users');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
  try {
    const response = await fetch(`https://bridgeon-backend.onrender.com/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update role');
    }

    const updatedUser = await response.json();
    setSuccessMessage(`Role updated successfully for ${updatedUser.user.username}`);
    setTimeout(() => setSuccessMessage(''), 3000);

    // Update state
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, role: newRole } : user
      )
    );
  } catch (err) {
    setError(err.message);
    setTimeout(() => setError(''), 3000);
  }
};


  return (
<div>
      <h2 className="text-2xl font-bold mb-6 text-purple-600">User Management</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {successMessage && (
        <div className="bg-purple-100 text-purple-600 p-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 text-gray-50 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="rounded-md bg-gray-700 text-gray-50 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="guest">Guest</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-50 whitespace-nowrap">
                  {new Date(user.joinDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDetailsModalOpen(true);
                    }}
                    className="text-purple-600 hover:text-purple-700 mr-2"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};
