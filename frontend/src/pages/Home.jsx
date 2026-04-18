import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      
      <main className="container mx-auto px-6 pt-16 pb-24 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <span className="badge badge-blue mb-6 inline-block">Premium Home Services</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            Your Home, <br />
            <span className="text-gradient">Expertly Handled.</span>
          </h1>
          <p className="text-lg md:text-xl opacity-70 mb-10 max-w-2xl mx-auto font-light">
            Connect with top-rated professionals for cleaning, plumbing, and repairs in real-time. Smooth, fast, and reliable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Book a Service
            </Link>
            <Link to="/register?role=captain" className="px-8 py-4 rounded-2xl font-medium border border-slate-700 hover:bg-slate-800 transition-all">
              Become a Captain
            </Link>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="mt-32 max-w-6xl mx-auto text-left">
          <h3 className="font-display text-3xl font-bold mb-10 text-center">Popular Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Plumbing', desc: 'Expert pipe repairs and installations.', icon: '💧' },
              { title: 'Cleaning', desc: 'Deep cleaning for your entire home.', icon: '✨' },
              { title: 'Electrical', desc: 'Safe and certified electrical work.', icon: '⚡' }
            ].map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <GlassCard className="hover:border-indigo-500/50 transition-all cursor-pointer group">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform origin-left">{service.icon}</div>
                  <h4 className="text-2xl font-display font-bold mb-2">{service.title}</h4>
                  <p className="opacity-70 text-sm leading-relaxed">{service.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
