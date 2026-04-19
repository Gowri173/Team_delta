import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', serviceType: '', customService: '' });
  const [role, setRole] = useState('user');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'captain') setRole('captain');
  }, [location]);

  useEffect(() => {
    if (role === 'captain') {
      fetchServices();
    }
  }, [role]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/services');
      setServices(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, serviceType: data[0].name }));
      }
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (role === 'captain') {
        if (!formData.serviceType) {
          toast.error('Please select a service');
          setLoading(false);
          return;
        }
        if (formData.serviceType === 'OTHER' && !formData.customService.trim()) {
          toast.error('Please enter a custom service name');
          setLoading(false);
          return;
        }
      }

      const endpoint = role === 'captain' ? '/auth/register/captain' : '/auth/register/user';
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role
      };

      if (role === 'captain') {
        submitData.serviceType = formData.serviceType === 'OTHER' ? formData.customService : formData.serviceType;
        submitData.isCustomService = formData.serviceType === 'OTHER';
        submitData.customService = formData.customService;
      }

      const { data } = await api.post(endpoint, submitData);
      dispatch(setCredentials(data));
      toast.success('Registration successful!');
      navigate(data.role === 'captain' ? '/captain-dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 pt-32 pb-12 relative z-10">
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
              <label className="block text-sm font-medium opacity-80 mb-2">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3" placeholder="+1234567890" required />
            </div>
            <div>
              <label className="block text-sm font-medium opacity-80 mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3" placeholder="••••••••" required />
            </div>

            {role === 'captain' && (
              <>
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-2">Service Specialization</label>
                  <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full px-4 py-3" disabled={loading}>
                    <option value="">Select a service...</option>
                    {services.map(service => (
                      <option key={service._id} value={service.name}>{service.name}</option>
                    ))}
                    <option value="OTHER">Other (Custom)</option>
                  </select>
                </div>

                {formData.serviceType === 'OTHER' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-sm font-medium opacity-80 mb-2">Custom Service Name</label>
                    <input
                      type="text"
                      name="customService"
                      value={formData.customService}
                      onChange={handleChange}
                      className="w-full px-4 py-3"
                      placeholder="e.g., Pet Grooming, HVAC Repair, etc."
                      required
                    />
                    <p className="text-xs opacity-60 mt-1">This will be added as a new service for future registrations</p>
                  </motion.div>
                )}
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-8 py-3 !bg-purple-600 hover:!bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Registering...' : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
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
