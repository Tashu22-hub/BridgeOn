import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';




export const Statistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRooms: 0,
    usersByRole: { guest: 0, member: 0, admin: 0 },
    roomStats: { public: 0, private: 0 },
    activityData: [],
    userGrowth: []
  });
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/admin/statistics?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        // Transform data if needed
        setStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalRooms: data.totalRooms || 0,
          usersByRole: data.usersByRole || { guest: 0, member: 0, admin: 0 },
          roomStats: data.roomStats || { public: 0, private: 0 },
          activityData: data.activityData || [],
          userGrowth: data.userGrowth || []
        });
      } catch (err) {
        setError(err.message);
        console.error('Statistics error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchStats();
    }
  }, [timeRange, user?.token]);

  // Add error boundary
  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded">
        <h3 className="font-bold">Error loading statistics</h3>
        <p>{error}</p>
        <button 
          onClick={() => {
            setError('');
            setTimeRange(timeRange); // Trigger refresh
          }}
          className="mt-2 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>;

  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  const userRoleData = [
    { name: 'Guest', value: stats.usersByRole.guest },
    { name: 'Member', value: stats.usersByRole.member },
    { name: 'Admin', value: stats.usersByRole.admin }
  ];

  const roomTypeData = [
    { name: 'Public', value: stats.roomStats.public },
    { name: 'Private', value: stats.roomStats.private }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Statistics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="All registered users"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          subtitle="Currently online"
        />
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          subtitle="Public and private"
        />
        <StatCard
          title="Room Usage"
          value={`${((stats.activeUsers / stats.totalRooms) || 0).toFixed(1)}`}
          subtitle="Users per room"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">User Growth</h3>
          <LineChart width={500} height={300} data={stats.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#8884d8" />
          </LineChart>
        </div>

        {/* User Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">User Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={userRoleData}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {userRoleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Room Types */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Room Types</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={roomTypeData}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {roomTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Daily Activity</h3>
          <BarChart width={500} height={300} data={stats.activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="activeUsers" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <div className="mt-2">
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </div>
    {subtitle && (
      <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
    )}
  </div>
);