import React from 'react';
import LogoSvg from '@/assets/logo.svg';

export const Hero = () => {
  return (
    <section className="py-20 px-4">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
            <h1 className="text-5xl font-bold mb-6">
              <span className="gradient-text">Sand Dollar</span>
              <br />
              Yield-Generating NFTs on Sui
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              Create, manage, and trade NFTs that generate yield. Unlock the potential of your digital assets with Sand Dollar.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn btn-primary">Get Started</button>
              <button className="btn btn-outline">Learn More</button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
              {/* Dashboard preview with the Sand Dollar logo */}
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
              
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-4 gradient-text">Dashboard Preview</div>
                  <p className="text-text-secondary">Your NFT portfolio analytics at a glance</p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}; 