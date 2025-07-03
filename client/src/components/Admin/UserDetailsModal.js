// src/components/Admin/UserDetailsModal.js
import React from 'react';
import { Modal } from '../Common/Modal';

export const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details"> 
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="font-medium text-gray-50">Username:</div>
          <div className="text-gray-50">{user.username}</div>

          <div className="font-medium text-gray-50">Role:</div>
          <div className="text-gray-50">{user.role}</div>

          <div className="font-medium text-gray-50">Join Date:</div>
          <div className="text-gray-50">
            {new Date(user.joinDate).toLocaleDateString()}
          </div>

          <div className="font-medium text-gray-50">Rooms:</div>
          <div className="text-gray-50">
            {user.subscribedRooms?.length || 0} rooms
          </div>
        </div>
      </div>
    </Modal>
  );
};


  
  
