import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password, role });
      dispatch(setCredentials(data));
      toast.success('Logged in successfully!');
      if (data.role === 'captain') navigate('/captain-dashboard');
      else if (data.role === 'admin') navigate('/admin-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4 relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <GlassCard>
          <h2 className="text-3xl font-display font-bold mb-8 text-center">Welcome Back</h2>
          
          <div className="flex bg-slate-800/50 rounded-xl p-1 mb-8 backdrop-blur-md">
            {['user', 'captain', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === r ? 'bg-indigo-500 text-white shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                onClick={() => setRole(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium opacity-80 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium opacity-80 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-8 py-3">
              Login as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm opacity-70">
            Don't have an account? <Link to={`/register?role=${role}`} className="text-indigo-400 hover:text-indigo-300 font-medium ml-1">Sign up</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;