//HeroSection.tsx

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Simple animated typing effect for blue text
const AnimatedTypingBlueText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = React.useState('');
  const [index, setIndex] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (done) return;
    let timeout: NodeJS.Timeout;
    if (index < text.length) {
      timeout = setTimeout(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 80);
    } else {
      setDone(true);
    }
    return () => clearTimeout(timeout);
  }, [index, text, done]);

  return (
    <span className="block text-white drop-shadow-lg font-extrabold">
      {displayed}
    </span>
  );
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.5, delayChildren: 0.3 },
  },
};

const framerTitle = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.0 } },
};

const imageVariant = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9 } },
};

const subtitleVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const ctaVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

interface HeroSectionProps {
  isAuthenticated?: boolean;
  user?: any;
  onDashboardClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  isAuthenticated = false, 
  user, 
  onDashboardClick 
}) => {
  const navigate = useNavigate();
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative min-h-screen w-full overflow-hidden pt-24 md:pt-16 pb-0 flex flex-col md:flex-row items-start"
      style={{
        background:
          'linear-gradient(135deg, #1800ad 0%, #1e293b 40%, #eeebe3 70%, #ffffff 100%)',
        boxShadow:
          '0 0 120px 0 rgba(24,0,173,0.25), 0 0 220px 0 rgba(238,235,227,0.15)',
      }}
    >
      <motion.div
        className="container mx-auto px-2 sm:px-4 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 w-full h-full relative z-10"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* TEXT SECTION */}
        <div className="flex-1 max-w-full md:max-w-2xl flex flex-col items-center md:items-start justify-center mx-auto pt-2 pb-2 text-center md:text-left min-h-[calc(100vh-340px)] md:min-h-[50vh] md:pl-12">
          <motion.h1
            className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 leading-snug md:leading-[1.15]"
            variants={framerTitle}
          >
            Effortless Home<br className="hidden sm:block" />
            Cleaning,
            <span className="block mt-2">
              <AnimatedTypingBlueText text="Every Day." />
            </span>
          </motion.h1>

          <motion.p
            className="text-white text-base sm:text-lg md:text-2xl mb-6 sm:mb-8 max-w-xl mx-auto md:mx-0"
            variants={subtitleVariant}
          >
            <b>Sweepro Smart Cleaning</b><br />
  
            Happy Living .
          </motion.p>

          <motion.div
            className="w-full flex flex-col sm:flex-row justify-center md:justify-start items-center mt-2 sm:mt-4 gap-3 sm:gap-4"
            variants={ctaVariant}
          >
            {isAuthenticated ? (
              <>
                <button
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-blue-900 text-white font-bold text-base sm:text-lg px-8 sm:px-14 py-4 sm:py-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-red-600 active:scale-95 border-2 border-blue-900 ring-2 ring-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-900 min-w-[180px]"
                  onClick={onDashboardClick}
                  style={{ letterSpacing: '1px' }}
                >
                  Go to Dashboard
                </button>
                <button
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-blue-50 text-blue-900 font-bold text-base sm:text-lg px-8 sm:px-14 py-4 sm:py-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-white active:scale-95 border-2 border-blue-900 ring-2 ring-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-900 min-w-[180px]"
                  onClick={() => navigate('/plans')}
                  style={{ letterSpacing: '1px' }}
                >
                  View Plans
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-blue-900 text-white font-bold text-base sm:text-lg px-8 sm:px-14 py-4 sm:py-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-red-600 active:scale-95 border-2 border-blue-900 ring-2 ring-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-900 min-w-[180px]"
                  onClick={() => navigate('/consultation')}
                  style={{ letterSpacing: '1px' }}
                >
                  Hire Me
                </button>
                <button
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-blue-50 text-blue-900 font-bold text-base sm:text-lg px-8 sm:px-14 py-4 sm:py-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-white active:scale-95 border-2 border-blue-900 ring-2 ring-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-900 min-w-[180px]"
                  onClick={() => navigate('/plans')}
                  style={{ letterSpacing: '1px' }}
                >
                  Hire
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* IMAGE SECTION */}
        <motion.div
          className="flex-1 w-full flex justify-center md:justify-end items-end md:items-center pb-0 relative"
          style={{ minHeight: '0', marginTop: '0' }}
          variants={imageVariant}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[480px] sm:h-[480px] bg-gradient-to-br from-blue-900 via-blue-50 to-red-600 rounded-full blur-3xl opacity-60 z-0"></div>

          <img
            src="/assets/hero.png"
            alt="Cleaning Service"
            className="w-full max-w-[220px] sm:max-w-[420px] md:max-w-[600px] lg:max-w-[700px] object-contain object-bottom relative z-10"
          />

          {/* Floating Feature Cards (Unchanged) */}
          <div
            className="absolute left-0 sm:-left-8 md:-left-32 top-[28%] sm:top-1/4 animate-floating-card"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-3 sm:px-5 py-2">
              <span className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-900">
                <Sparkles size={16} color="#fff" />
              </span>
              <span className="font-semibold text-gray-900 text-xs sm:text-base">Deep Cleaning</span>
            </div>
          </div>

          <div
            className="absolute right-0 sm:right-[-40px] md:right-[-120px] top-1/2 animate-floating-card"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-3 sm:px-5 py-2">
              <span className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-900">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7-7-7-7 7 7 7z"></path></svg>
              </span>
              <span className="font-semibold text-gray-900 text-xs sm:text-base">Eco-Friendly</span>
            </div>
          </div>

          <div
            className="absolute right-0 md:right-[-80px] top-[18%] md:top-[16%] animate-floating-card"
            style={{ animationDelay: '0.8s' }}
          >
            <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-3 sm:px-5 py-2">
              <span className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-900">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 8.5 22 9.3 17 14.2 18.5 21 12 17.8 5.5 21 7 14.2 2 9.3 9 8.5 12 2"></polygon></svg>
              </span>
              <span className="font-semibold text-gray-900 text-xs sm:text-base">Verified Cleaners</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes gradient-sweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-sweep {
          background-size: 200% 200%;
          animation: gradient-sweep 3s ease-in-out infinite;
        }
        @keyframes floating-card {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .animate-floating-card {
          animation: floating-card 3.2s ease-in-out infinite;
        }
      `}</style>
    </motion.section>
  );
};