import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import GlassCard from '../components/GlassCard';
import TrackingMap from '../components/TrackingMap';
import RatingModal from '../components/RatingModal';
import PaymentModal from '../components/PaymentModal';
import ProfileModal from '../components/ProfileModal';
import api from '../services/api';
import { toast } from 'react-toastify';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiStar, FiNavigation, FiCheckCircle, FiEye, FiCreditCard, FiUser } from 'react-icons/fi';
import { io } from 'socket.io-client';

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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Now');
  const [position, setPosition] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedBookingForTracking, setSelectedBookingForTracking] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

    const socket = io('https://team-delta-uzst.onrender.com');
    socket.emit('join', user._id);

    socket.on('booking-status-updated', (updatedBooking) => {
      setMyBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));

      toast.info(`Booking status updated to ${updatedBooking.status}`);
    });

    socket.on('payment-successful', (data) => {
      setMyBookings(prev => prev.map(b => b._id === data.booking._id ? data.booking : b));
      toast.success('Payment completed successfully!');
    });

    socket.on('captain-location-updated', (data) => {
      // The tracking map handles its own fetching, but we can re-fetch bookings just in case
      // Or just let the TrackingMap component handle the real-time movement
    });

    return () => socket.disconnect();
  }, [user, navigate]);

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/bookings/mybookings');
      setMyBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
        timeSlot: selectedTimeSlot,
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

  const handlePaymentClick = (booking) => {
    setSelectedBookingForPayment(booking);
    setIsPaymentModalOpen(true);
  };

  const handleTrackingClick = (booking) => {
    setSelectedBookingForTracking(booking);
    setIsTrackingModalOpen(true);
  };

  const handleRatingClick = (booking) => {
    setSelectedBookingForRating(booking);
    setIsRatingModalOpen(true);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'requested':
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', text: 'Requested' };
      case 'accepted':
        return { color: 'text-blue-400', bgColor: 'bg-blue-500/10', text: 'Captain Assigned' };
      case 'in_progress':
        return { color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', text: 'In Progress' };
      case 'completed':
        return { color: 'text-green-400', bgColor: 'bg-green-500/10', text: 'Completed' };
      case 'cancelled':
        return { color: 'text-red-400', bgColor: 'bg-red-500/10', text: 'Cancelled' };
      default:
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/10', text: status };
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 pt-32 pb-12 relative z-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold">Welcome, {user?.name}</h1>
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
        >
          <FiUser className="text-indigo-400" /> My Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Booking Form & Map */}
        <div id="book-service" className="lg:col-span-7 space-y-6">
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
                    <option key={s._id} value={s._id}>{s.name} - ₹{s.basePrice}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-sm">
                  ▼
                </div>
              </div>

              <div className="relative flex-1 sm:max-w-[200px]">
                <select
                  className="w-full h-full px-5 py-4 appearance-none rounded-xl bg-slate-800/50 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                >
                  <option value="Now">Now</option>
                  <option value="Morning (9AM-12PM)">Morning (9AM-12PM)</option>
                  <option value="Afternoon (12PM-4PM)">Afternoon (12PM-4PM)</option>
                  <option value="Evening (4PM-8PM)">Evening (4PM-8PM)</option>
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
        <div id="activity-log" className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-display font-bold mb-6 border-b border-white/10 pb-4">Activity Log</h2>
          <GlassCard className="lg:col-span-2 max-h-[600px] overflow-y-auto">

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white/5 p-5 rounded-2xl border border-white/5 animate-pulse">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-6 bg-white/10 rounded w-1/3"></div>
                      <div className="h-6 bg-white/10 rounded-full w-24"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-5 bg-white/10 rounded w-16"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 bg-white/10 rounded-xl flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : myBookings.length === 0 ? (
              <div className="text-center py-12 opacity-50">
                <span className="text-3xl mb-2 block">📝</span>
                <p className="text-sm font-medium">No active bookings.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map(booking => {
                  const statusInfo = getStatusInfo(booking.status);
                  return (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg">{booking.service?.name || booking.service}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <FiMapPin className="text-xs" />
                          <span>{booking.location?.address || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <FiClock className="text-xs" />
                          <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                          {booking.timeSlot && (
                            <span className="ml-2 px-2 py-0.5 bg-white/5 rounded-md text-xs">{booking.timeSlot}</span>
                          )}
                        </div>
                        {booking.captain && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <FiNavigation className="text-xs" />
                            <span>{booking.captain.name}</span>
                            <div className="flex items-center gap-1">
                              <FiStar className="text-yellow-400 text-xs" />
                              <span className="text-xs">{booking.captain.rating}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-bold text-indigo-400">₹{booking.price}</p>
                        {booking.estimatedArrival && booking.status === 'accepted' && (
                          <p className="text-xs text-slate-400">
                            ETA: {new Date(booking.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {(booking.status === 'accepted' || booking.status === 'in_progress') && (
                          <button
                            onClick={() => handleTrackingClick(booking)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl font-medium text-sm transition-colors border border-blue-500/20"
                          >
                            <FiNavigation className="text-xs" />
                            Track
                          </button>
                        )}

                        {booking.status === 'completed' && !booking.rating && (
                          <button
                            onClick={() => handleRatingClick(booking)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-xl font-medium text-sm transition-colors border border-yellow-500/20"
                          >
                            <FiStar className="text-xs" />
                            Rate
                          </button>
                        )}

                        {booking.status === 'completed' && booking.paymentStatus === 'pending' && (
                          <button
                            onClick={() => handlePaymentClick(booking)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl font-medium text-sm transition-colors border border-indigo-500/20"
                          >
                            <FiCreditCard className="text-xs" />
                            Pay
                          </button>
                        )}

                        {booking.status === 'completed' && booking.rating && (
                          <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/10 text-green-400 rounded-xl font-medium text-sm border border-green-500/20">
                            <FiCheckCircle className="text-xs" />
                            Rated
                          </div>
                        )}

                        {booking.paymentStatus === 'paid' && (
                          <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/10 text-green-400 rounded-xl font-medium text-sm border border-green-500/20">
                            <FiCheckCircle className="text-xs" />
                            Paid
                          </div>
                        )}
                      </div>

                      {booking.status === 'requested' && (
                        <div className="w-full bg-black/20 rounded-full h-1 mt-3 overflow-hidden">
                          <div className="bg-indigo-500 h-1 rounded-full animate-[pulse_2s_ease-in-out_infinite] w-1/3"></div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Modals */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          booking={selectedBookingForPayment}
          onSuccess={fetchBookings}
        />

        {isTrackingModalOpen && (
          <TrackingMap
            bookingId={selectedBookingForTracking?._id}
            onClose={() => setIsTrackingModalOpen(false)}
          />
        )}

        <RatingModal
          booking={selectedBookingForRating}
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onRatingSubmitted={fetchBookings}
        />

        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
