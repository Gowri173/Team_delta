import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', serviceType: 'Plumbing' });
  const [role, setRole] = useState('user');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'captain') setRole('captain');
  }, [location]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { ...formData, role });
      dispatch(setCredentials(data));
      toast.success('Registration successful!');
      navigate(data.role === 'captain' ? '/captain-dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4 py-12 relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <GlassCard>
          <h2 className="text-3xl font-display font-bold mb-8 text-center">Create Account</h2>
          
          <div className="flex bg-slate-800/50 rounded-xl p-1 mb-8 backdrop-blur-md">
            {['user', 'captain'].map((r) => (
              <button
                key={r}
                type="button"
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === r ? 'bg-purple-500 text-white shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                onClick={() => setRole(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium opacity-80 mb-2">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium opacity-80 mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium opacity-80 mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3" placeholder="••••••••" required />
            </div>
            
            {role === 'captain' && (
              <div>
                <label className="block text-sm font-medium opacity-80 mb-2">Service Specialization</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full px-4 py-3">
                  <option value="Plumbing">Plumbing</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>
            )}
            
            <button type="submit" className="btn-primary w-full mt-8 py-3 !bg-purple-600 hover:!bg-purple-700">
              Register as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm opacity-70">
            Already verified? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium ml-1">Login</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Register;
