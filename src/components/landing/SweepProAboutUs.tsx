//SweepProAboutUs.tsx

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Images */}
          <div className="relative pt-16"> {/* Added padding top to images */}
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

            {/* Top left office image with floating and fade-down animation */}
            <div 
              className={`absolute top-12 -left-8 transition-all duration-1000 delay-500 ${fadeInClass} animate-fade-down animate-floating-up`}
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

            {/* Bottom right team image with floating and fade-down animation */}
            <div 
              className={`absolute -bottom-8 -right-8 transition-all duration-1000 delay-700 ${fadeInClass} animate-fade-down animate-floating-down`}
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
          <div className="space-y-8 pt-12"> {/* Added padding top to content */}
            {/* About Us Badge */}
            <div className={`transition-all duration-1000 delay-200 ${fadeInClass}`}>
              <Link to="/about">
                <span className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg cursor-pointer hover:bg-blue-700 transition tracking-wide">
                  About Us
                </span>
              </Link>
            </div>

            {/* Main Title */}
            <div className={`transition-all duration-1000 delay-400 ${fadeInClass}`}>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                <span className="text-gray-900">Revolutionizing</span>
                <br />
                <span className="text-blue-600">Home Cleaning</span>
                <br />
                <span className="text-gray-900">Services</span>
              </h1>
            </div>

            {/* Description - Single paragraph, simple and sweet */}
            <div className={`transition-all duration-1000 delay-600 ${fadeInClass}`}>
              <p className="text-lg text-gray-700 leading-relaxed">
                Founded with a vision to transform the home cleaning industry, <span className="font-semibold text-blue-600">SweepPro</span> combines <span className="text-blue-600 font-semibold">innovative technology</span> with <span className="text-blue-600 font-semibold">exceptional service</span> to deliver unparalleled cleaning experiences. Our team of <span className="text-blue-600 font-semibold">verified professional cleaners</span> uses eco-friendly practices to ensure your home receives the highest standard of care, making every space a sanctuary of cleanliness and comfort.
              </p>
            </div>

            {/* Feature checkmarks with sequential animation */}
            <div className={`transition-all duration-1000 delay-800 ${fadeInClass} mt-8 space-y-4`}>
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center ${checkmarks[index] ? 'checkmark-animate' : 'opacity-0'}`}
                    style={{ transitionDelay: `${index * 0.3 + 0.8}s` }}>
                    <svg 
                      className="w-4 h-4 text-white" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="3" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className={`text-gray-900 font-semibold text-base transition-opacity duration-500 ${checkmarks[index] ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: `${index * 0.3 + 0.8}s` }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SweepProAboutUs;