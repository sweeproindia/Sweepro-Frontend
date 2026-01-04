//SweepProAboutUs.tsx

// SweepProAboutUs.tsx

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SweepProAboutUs: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [checkmarks, setCheckmarks] = useState([false, false, false]);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Animate checkmarks one by one
    const checkmarkTimers = [
      setTimeout(() => setCheckmarks([true, false, false]), 800),
      setTimeout(() => setCheckmarks([true, true, false]), 1200),
      setTimeout(() => setCheckmarks([true, true, true]), 1600),
    ];

    // Inject CSS animations
    const styles = `
      @keyframes floating {
        0%, 100% { 
          transform: translateY(0px); 
        }
        50% { 
          transform: translateY(-15px); 
        }
      }

      @keyframes checkmarkAppear {
        0% {
          opacity: 0;
          transform: scale(0) rotate(-45deg);
        }
        50% {
          transform: scale(1.2) rotate(0deg);
        }
        100% {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
      }

      .checkmark-animate {
        animation: checkmarkAppear 0.5s ease-out forwards;
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      clearTimeout(timer);
      checkmarkTimers.forEach(t => clearTimeout(t));
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  const fadeInClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';

  const features = [
    'Verified Professionals',
    'Eco-Friendly Products',
    '100% Satisfaction'
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="min-h-screen p-8 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Images */}
          <div className="relative pt-16">
            {/* Main image container */}
            <div className={`transition-all duration-1000 delay-300 ${fadeInClass} animate-fade-in`}>
              <div className="relative bg-gray-200 rounded-3xl shadow-2xl overflow-hidden">
                <img 
                  src="/assets/about-2.jpg" 
                  alt="Professional cleaner in uniform"
                  className="w-full h-[600px] object-cover"
                />
              </div>
            </div>

            {/* Top left office image */}
            <div 
              className={`absolute top-12 -left-8 transition-all duration-1000 delay-500 ${fadeInClass}`}
              style={{ animation: 'floating 3s ease-in-out infinite, fadeDown 1.2s cubic-bezier(0.4,0,0.2,1) forwards' }}
            >
              <div className="w-52 h-36 bg-white rounded-2xl shadow-2xl border-4 border-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="/assets/about-1.jpg" 
                  alt="Office cleaning team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bottom right team image */}
            <div 
              className={`absolute -bottom-8 -right-8 transition-all duration-1000 delay-700 ${fadeInClass}`}
              style={{ animation: 'floating 3s ease-in-out infinite 1.5s, fadeDown 1.2s cubic-bezier(0.4,0,0.2,1) forwards 0.5s' }}
            >
              <div className="w-56 h-40 bg-white rounded-2xl shadow-2xl border-4 border-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="/assets/image-2.jpg" 
                  alt="Professional cleaning team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8 pt-12">
            {/* About Us Badge */}
            <div className={`transition-all duration-1000 delay-200 ${fadeInClass}`}>
              
                <span className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg cursor-pointer hover:bg-blue-700 transition tracking-wide">
                  About Us
                </span>
             
            </div>

            {/* Main Title */}
            <div className={`transition-all duration-1000 delay-400 ${fadeInClass}`}>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                <span className="text-gray-900">Professional Home Care,</span>
                <br />
                <span className="text-blue-600">Built on Hygiene & Trust</span>
              </h1>
            </div>

            {/* Description Section (Updated with your image text) */}
            <div className={`transition-all duration-1000 delay-600 ${fadeInClass}`}>
              <p className="text-lg text-gray-700 leading-relaxed space-y-4">
                <span className="block mb-4">
                  <strong className="text-blue-600">SWEEPRO</strong> — a modern home care service with a traditional touch, built for reliability, hygiene, and professionalism in everyday housekeeping.
                </span>

                <span className="block mb-4">
                  We provide trained and verified care partners with structured cleaning plans and an essential cleaning kit to ensure consistent quality in every service. From kitchen to bathroom care, every Sweepro visit is efficient, safe, and professionally managed.
                </span>

                <span className="block mb-4">
                  Each plan is thoughtfully designed to deliver consistent care, reliable cleaning, and lasting comfort — because hygiene and quality belong in every household.
                </span>

                <span className="block">
                  At Sweepro, we believe every clean home tells a happy story — one that begins with Sweepro Care. We’re here to make that care simple, affordable, and reliable.
                </span>
              </p>
            </div>

            {/* Feature checkmarks */}
      
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default SweepProAboutUs;
