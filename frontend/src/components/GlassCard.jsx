import React from 'react';

const GlassCard = ({ children, className = '' }) => {
  return (
    <div className={`glass p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
