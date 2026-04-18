import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [captains, setCaptains] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      const capRes = await api.get('/admin/captains');
      setCaptains(capRes.data);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    }
  };

  const toggleApproval = async (id) => {
    try {
      await api.put(`/admin/captains/${id}/approve`, { id });
      toast.success('Captain status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 relative z-10">
      <h1 className="text-4xl font-display font-bold mb-8">System Analytics</h1>
      
      {/* Soft Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'opacity-60 hover:opacity-100'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('captains')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'captains' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'opacity-60 hover:opacity-100'}`}
        >
          Captains
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">👥</div>
            <h3 className="text-sm font-medium opacity-70 mb-2">Total Users</h3>
            <p className="text-4xl font-display font-bold">{stats.totalUsers}</p>
          </GlassCard>
          <GlassCard className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">👷‍♂️</div>
            <h3 className="text-sm font-medium opacity-70 mb-2">Active Captains</h3>
            <p className="text-4xl font-display font-bold">{stats.totalCaptains}</p>
          </GlassCard>
          <GlassCard className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">📅</div>
            <h3 className="text-sm font-medium opacity-70 mb-2">Total Bookings</h3>
            <p className="text-4xl font-display font-bold">{stats.totalBookings}</p>
          </GlassCard>
          <GlassCard className="relative overflow-hidden group border-indigo-500/30">
            <div className="absolute inset-0 bg-indigo-500/5 -z-10"></div>
            <h3 className="text-sm font-medium opacity-70 mb-2">Revenue</h3>
            <p className="text-4xl font-display font-bold text-gradient">${stats.totalRevenue}</p>
          </GlassCard>
        </div>
      )}

      {activeTab === 'captains' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="!p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-display font-bold">Roster Management</h2>
              <span className="badge badge-blue">{captains.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-xs uppercase tracking-wider opacity-70">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Service</th>
                    <th className="px-6 py-4 font-medium">Earnings</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {captains.map(captain => (
                    <tr key={captain._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{captain.name}</td>
                      <td className="px-6 py-4 opacity-70">{captain.email}</td>
                      <td className="px-6 py-4"><span className="badge badge-blue !text-[10px]">{captain.serviceType}</span></td>
                      <td className="px-6 py-4 font-medium">${captain.earnings}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`badge ${captain.isApproved ? 'badge-green' : 'badge-yellow'}`}>
                          {captain.isApproved ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleApproval(captain._id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${captain.isApproved ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                        >
                          {captain.isApproved ? 'Revoke' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {captains.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-12 opacity-50">No captains registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
