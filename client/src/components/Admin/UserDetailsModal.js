// src/components/Admin/UserDetailsModal.js
import React from 'react';
import { Modal } from '../Common/Modal';

export const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="font-semibold">Username:</div>
          <div>{user.username}</div>
          
          <div className="font-semibold">Role:</div>
          <div>{user.role}</div>
          
          <div className="font-semibold">Join Date:</div>
          <div>{new Date(user.joinDate).toLocaleDateString()}</div>
          
          <div className="font-semibold">Rooms:</div>
          <div>{user.subscribedRooms?.length || 0} rooms</div>
        </div>
      </div>
    </Modal>
  );
};


  
  