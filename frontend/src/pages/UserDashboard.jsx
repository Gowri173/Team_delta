import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import GlassCard from '../components/GlassCard';
import api from '../services/api';
import { toast } from 'react-toastify';
import L from 'leaflet';
import { motion } from 'framer-motion';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

const UserDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [position, setPosition] = useState(null);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/login');
      return;
    }

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPosition({ lat: 51.505, lng: -0.09 }) // fallback
    );

    fetchServices();
    fetchBookings();
  }, [user, navigate]);

  const fetchServices = async () => {
    const { data } = await api.get('/services');
    setServices(data);
  };

  const fetchBookings = async () => {
    const { data } = await api.get('/bookings/mybookings');
    setMyBookings(data);
  };

  const handleBookService = async () => {
    if (!selectedService || !position) {
      return toast.error('Please select a service and location');
    }
    const serviceObj = services.find(s => s._id === selectedService);
    try {
      await api.post('/bookings', {
        serviceId: selectedService,
        serviceName: serviceObj.name,
        date: new Date(),
        lat: position.lat,
        lng: position.lng,
        address: 'Map Location',
        price: serviceObj.basePrice
      });
      toast.success('Service requested successfully!');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to book service');
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      await api.post(`/bookings/${bookingId}/pay`);
      toast.success('Payment successful!');
      fetchBookings();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
      {/* Left Column: Booking Form & Map */}
      <div className="lg:col-span-7 space-y-6">
        <GlassCard>
          <h2 className="text-2xl font-display font-bold mb-2">Book a Service</h2>
          <p className="text-sm opacity-70 mb-6">Drop a pin on your location to request assistance.</p>

          <div className="h-[350px] w-full rounded-2xl overflow-hidden mb-6 shadow-inner border border-white/10 relative z-0">
            {position ? (
              <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-800/50">
                <div className="animate-pulse opacity-50 text-sm font-medium">Acquiring Location...</div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <select
                className="w-full h-full px-5 py-4 appearance-none rounded-xl bg-slate-800/50 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="" disabled>Choose a service</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.name} - ${s.basePrice}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-sm">
                ▼
              </div>
            </div>
            <button onClick={handleBookService} className="btn-primary py-3 px-8 whitespace-nowrap">
              Request Now
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Bookings History */}
      <div className="lg:col-span-5 space-y-6">
        <GlassCard className="h-full">
          <h2 className="text-xl font-display font-bold mb-6 border-b border-white/10 pb-4">Activity Log</h2>
          {myBookings.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <span className="text-3xl mb-2 block">📝</span>
              <p className="text-sm font-medium">No active bookings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map(booking => (
                <motion.div key={booking._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{booking.service?.name}</h3>
                    <span className={`badge ${booking.status === 'requested' ? 'badge-yellow' : booking.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-end mb-1">
                    <p className="text-xs opacity-60">{new Date(booking.date).toLocaleDateString()}</p>
                    <p className="text-sm font-bold text-indigo-400">${booking.price}</p>
                  </div>

                  {booking.status === 'requested' && (
                    <div className="w-full bg-black/20 rounded-full h-1 mt-3 overflow-hidden">
                      <div className="bg-indigo-500 h-1 rounded-full animate-[pulse_2s_ease-in-out_infinite] w-1/3"></div>
                    </div>
                  )}
                  {booking.status === 'completed' && booking.paymentStatus === 'pending' && (
                    <button onClick={() => handlePayment(booking._id)} className="mt-4 w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-indigo-500/20">
                      Process Payment
                    </button>
                  )}
                  {booking.paymentStatus === 'paid' && (
                    <div className="mt-4 w-full py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-center rounded-xl font-bold text-xs uppercase tracking-wider">
                      Paid Successfully
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default UserDashboard;
