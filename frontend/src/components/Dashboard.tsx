import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="relative w-full min-h-[300px] rounded-2xl overflow-hidden bg-gradient-to-br from-background via-background-light to-primary/20">
      {/* Background starfish logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className="text-text"
        >
          <path
            d="M200 50 L300 150 L250 300 L150 300 L100 150 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard Preview
        </h2>
        <p className="mt-2 text-text-secondary text-lg">
          Your NFT portfolio analytics at a glance
        </p>

        {/* Add your dashboard content here */}
        <div className="mt-8">
          {/* Dashboard widgets will go here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 