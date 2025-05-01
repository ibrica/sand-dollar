import React from 'react';
import LogoSvg from '@/assets/logo.svg';

const Dashboard: React.FC = () => {
  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 z-10"></div>
      <div className="absolute inset-0 bg-background-light z-0"></div>
      
      {/* Large logo in the background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 z-5">
        <LogoSvg 
          width={280} 
          height={280} 
          style={{ stroke: '#FFFFFF' }}
        />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center">
          <div className="text-3xl font-bold mb-4 gradient-text">Dashboard Preview</div>
          <p className="text-text-secondary">Your NFT portfolio analytics at a glance</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default Dashboard; 