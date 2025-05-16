// src/components/Admin/RoomManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../Common/Modal';

const RoomManagement = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '',
    description: '',
    isPrivate: false,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/rooms/roomlist', {
        method:'GET',
        headers: {
  
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch rooms');
      setRooms(data);
    } catch (err) {
      setError(err.message || 'Error fetching rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (formData.isPrivate && !formData.password) {
        throw new Error('Password is required for private rooms.');
      }

      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create room');

      setRooms((prevRooms) => [...prevRooms, data]);
      setIsCreateModalOpen(false);
      resetForm();
      setSuccessMessage('Room created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/${selectedRoom._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room._id === selectedRoom._id ? data : room
        )
      );
      setIsEditModalOpen(false);
      resetForm();
      setSuccessMessage('Room updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete room');
      }

      setRooms((prevRooms) =>
        prevRooms.filter((room) => room._id !== roomId)
      );
      setSuccessMessage('Room deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Error deleting room');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isPrivate: false,
      password: '',
    });
    setError('');
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      description: room.description,
      isPrivate: room.isPrivate,
      password: '',
    });
    setIsEditModalOpen(true);
  };

  const RoomForm = React.memo(({ onSubmit, submitText, formData, setFormData, error }) => {
  const handleInputChange = (field) => (event) => {
    const value = field === "isPrivate" ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={handleInputChange("name")}
          className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"

          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white ">Description</label>
        <textarea
          value={formData.description}
          onChange={handleInputChange("description")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 text-black focus:ring-purple-500 min-h-[100px] resize-y"

          rows="3"
          placeholder="Enter room description"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.isPrivate}
          onChange={handleInputChange("isPrivate")}
          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          
        />
        <label className="ml-2 block text-sm text-white">Private Room</label>
      </div>

      {formData.isPrivate && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            
          />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm" aria-live="assertive">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        {submitText}
      </button>
    </form>
  );
});



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-700">Room Management</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
        >
          Create New Room
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-500 p-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="border rounded-lg p-4 bg-white shadow"
          >
            <h3 className="text-xl font-bold mb-2 text-purple-700">{room.name}</h3>
            <p className="text-gray-600 mb-4">{room.description}</p>
            <div className="flex justify-between items-center">
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  room.isPrivate
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {room.isPrivate ? 'Private' : 'Public'}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => openEditModal(room)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
  isOpen={isCreateModalOpen}
  onClose={() => {
    setIsCreateModalOpen(false);
    resetForm();
  }}
  title="Create New Room"
>
  <RoomForm
    onSubmit={handleSubmit} // Function to handle room creation
    submitText="Create Room" // Button text
    formData={formData} // Form state
    setFormData={setFormData} // Form state updater
    error={error} // Error message (if any)
  />
</Modal>

<Modal
  isOpen={isEditModalOpen}
  onClose={() => {
    setIsEditModalOpen(false);
    resetForm();
  }}
  title="Edit Room"
>
  <RoomForm
    onSubmit={handleUpdate} // Function to handle room update
    submitText="Update Room" // Button text
    formData={formData} // Form state
    setFormData={setFormData} // Form state updater
    error={error} // Error message (if any)
  />
</Modal>

    </div>
  );
};

export default RoomManagement;
