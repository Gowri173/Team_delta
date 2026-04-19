import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiSmartphone, FiBriefcase, FiCheckCircle, FiX, FiShield, FiLock, FiArchive, FiDownload, FiStar } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const PaymentModal = ({ isOpen, onClose, booking, onSuccess, mode = 'payment' }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMethod('');
      if (mode === 'history') {
        fetchPaymentHistory();
      }
    }
  }, [isOpen, mode]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments/history');
      setPaymentHistory(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleProcess = async (e) => {
    e?.preventDefault();
    setStep(3); // Processing
    try {
      await api.post(`/bookings/${booking._id}/pay`, {
        paymentMethod: 'card',
        cardNumber: '4242424242424242',
        expiryDate: '12/25',
        cvv: '123'
      });
      // The backend has a 1.5s delay built-in which acts as our processing simulation delay
      setStep(4); // Success
    } catch (err) {
      toast.error('Payment Failed');
      setStep(2);
    }
  };

  const handleDone = () => {
    onSuccess();
    onClose();
  };

  const generateTxnId = () => 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();

  const methods = [
    { id: 'card', name: 'Credit / Debit Card', icon: <FiCreditCard className="text-xl" />, description: 'Visa, Mastercard, RuPay' },
    { id: 'upi', name: 'UPI / QR Code', icon: <FiSmartphone className="text-xl" />, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'wallet', name: 'Digital Wallet', icon: <FiBriefcase className="text-xl" />, description: 'Paytm, Mobikwik, Ola Money' },
    { id: 'netbanking', name: 'Net Banking', icon: <FiShield className="text-xl" />, description: 'All major banks supported' }
  ];

  const renderPaymentHistory = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <FiArchive className="text-indigo-400 text-xl" />
        <h3 className="text-lg font-bold text-white">Payment History</h3>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading payment history...</p>
        </div>
      ) : paymentHistory.length === 0 ? (
        <div className="text-center py-8">
          <FiArchive className="text-slate-600 text-4xl mx-auto mb-4" />
          <p className="text-slate-400">No payment history found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {paymentHistory.map((payment, index) => (
            <motion.div
              key={`payment-${payment._id || index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="text-sm" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{payment.service || 'Service Payment'}</p>
                    <p className="text-slate-400 text-sm">{payment.date || new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">₹{payment.amount}</p>
                  <p className="text-slate-500 text-xs">{payment.transactionId || generateTxnId()}</p>
                </div>
              </div>
              {payment.captain && (
                <div className="flex items-center gap-2 mt-2">
                  <FiStar className="text-yellow-400 text-sm" />
                  <span className="text-slate-400 text-sm">Captain: {payment.captain}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
        >
          <FiDownload className="text-sm" />
          Download
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  );

  if (mode === 'history') {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className="p-6">
              {renderPaymentHistory()}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step !== 3 ? onClose : undefined}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <FiShield className="text-indigo-400" /> Secure Checkout
            </h3>
            {step !== 3 && step !== 4 && (
              <button onClick={onClose} className="p-2 opacity-60 hover:opacity-100 hover:bg-white/5 rounded-full transition-colors cursor-pointer">
                <FiX />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 relative min-h-[350px]">
            {/* Step 1: Select Method */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20">
                    <p className="text-sm opacity-60 mb-1">Total to Pay</p>
                    <p className="text-4xl font-display font-bold text-gradient">₹{booking.price}</p>
                    <p className="text-xs text-slate-400 mt-1">Including GST</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {methods.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setMethod(m.id); setStep(2); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group cursor-pointer"
                    >
                      <div className="p-3 rounded-lg bg-slate-800 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                        {m.icon}
                      </div>
                      <div className="text-left flex-1">
                        <span className="font-medium block">{m.name}</span>
                        <span className="text-xs opacity-60">{m.description}</span>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">→</span>
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setStep(5)}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View Payment History
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Form */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setStep(1)} className="text-sm opacity-60 hover:opacity-100 hover:text-indigo-400 cursor-pointer">← Back</button>
                  <span className="text-sm font-medium opacity-80">Enter Details</span>
                </div>

                <form onSubmit={handleProcess} className="space-y-4">
                  {method === 'card' && (
                    <>
                      <div>
                        <label className="block text-xs opacity-60 mb-2 uppercase tracking-wider">Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" className="w-full px-4 py-3 font-mono text-sm bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs opacity-60 mb-2 uppercase tracking-wider">Expiry</label>
                          <input type="text" placeholder="MM/YY" maxLength="5" className="w-full px-4 py-3 font-mono text-sm bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
                        </div>
                        <div>
                          <label className="block text-xs opacity-60 mb-2 uppercase tracking-wider">CVV</label>
                          <input type="password" placeholder="•••" maxLength="4" className="w-full px-4 py-3 font-mono text-sm bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs opacity-60 mb-2 uppercase tracking-wider">Cardholder Name</label>
                        <input type="text" placeholder="John Doe" className="w-full px-4 py-3 text-sm bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
                      </div>
                    </>
                  )}
                  {method === 'upi' && (
                    <div>
                      <label className="block text-xs opacity-60 mb-2 uppercase tracking-wider">UPI ID</label>
                      <input type="text" placeholder="username@upi" className="w-full px-4 py-3 text-sm bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
                      <p className="text-xs text-slate-500 mt-1">Enter your UPI ID or scan QR code</p>
                    </div>
                  )}
                  {method === 'wallet' && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-center">
                      <FiBriefcase className="text-indigo-400 text-2xl mx-auto mb-2" />
                      <p className="text-sm text-indigo-300 mb-2">Link your default digital wallet</p>
                      <p className="text-xs text-slate-400">Paytm, Mobikwik, Ola Money supported</p>
                    </div>
                  )}
                  {method === 'netbanking' && (
                    <div>
                      <label className="block text-xs opacity-60 mb-2 uppercase tracking-wider">Select Bank</label>
                      <select className="w-full px-4 py-3 text-sm bg-slate-800 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required>
                        <option value="">Choose your bank</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="other">Other Banks</option>
                      </select>
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 cursor-pointer mt-6">
                    <FiLock className="text-sm" /> Pay ₹{booking.price}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 space-y-6">
                <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="text-center">
                  <h4 className="font-display font-bold text-lg mb-1">Processing Payment</h4>
                  <p className="text-sm opacity-60 animate-pulse">Contacting secure gateway...</p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                  className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(74,222,128,0.3)]"
                >
                  <FiCheckCircle className="text-4xl" />
                </motion.div>
                <h4 className="font-display font-bold text-2xl mb-2">Payment Successful!</h4>
                <p className="text-slate-400 text-sm mb-8">Your transaction has been securely processed.</p>

                <div className="w-full bg-slate-800/50 rounded-xl p-4 mb-8 text-left border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs opacity-60">Amount Paid</span>
                    <span className="font-bold text-green-400">₹{booking.price}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs opacity-60">Transaction ID</span>
                    <span className="font-mono text-xs opacity-80">{generateTxnId()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-60">Date & Time</span>
                    <span className="text-xs opacity-80">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <button onClick={handleDone} className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 py-3 rounded-xl font-bold transition-colors cursor-pointer">
                  Done
                </button>
              </motion.div>
            )}

            {/* Step 5: Payment History */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setStep(1)} className="text-sm opacity-60 hover:opacity-100 hover:text-indigo-400 cursor-pointer">← Back</button>
                  <FiArchive className="text-indigo-400 text-xl" />
                  <span className="text-sm font-medium opacity-80">Payment History</span>
                </div>
                {renderPaymentHistory()}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;

