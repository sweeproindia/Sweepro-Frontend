//HeroSection.tsx

import heroImg from '@/assets/image.png';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden pt-24 md:pt-16 pb-0 flex flex-col md:flex-row items-start"
      style={{
        background: 'linear-gradient(135deg, #184FA1 0%, #1e293b 40%, #60a5fa 70%, #ffffff 100%)',
        boxShadow: '0 0 120px 0 rgba(24,79,161,0.25), 0 0 220px 0 rgba(96,165,250,0.15)'
      }}
    >
      {/* Removed grid background for cleaner look */}

      <motion.div
        className="container mx-auto px-2 sm:px-4 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 w-full h-full relative z-10"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* TEXT */}
        <div
          className="flex-1 max-w-full md:max-w-2xl flex flex-col items-center md:items-start justify-center mx-auto pt-2 pb-2 text-center md:text-left min-h-[calc(100vh-340px)] md:min-h-[50vh] md:pl-12"
        >
          <motion.h1
            className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 leading-snug md:leading-[1.15]"
            variants={framerTitle}
          >
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-300 drop-shadow-[0_4px_24px_rgba(255,206,84,0.7)] mb-2 tracking-tight animate-gradient-sweep bg-gradient-to-r from-yellow-300 via-white to-yellow-400 bg-clip-text text-transparent">SweepPro</span>
            <span className="block">Clean Tools. Clean Homes.</span>
            <span className="block">Spotless Results.</span>
          </motion.h1>

          <motion.p
            className="text-[#cbe6fa] text-sm sm:text-base md:text-xl mb-4 sm:mb-8 max-w-xs sm:max-w-xl mx-auto md:mx-0"
            variants={subtitleVariant}
          >
            Quality you can trust , service you can rely on.          
</motion.p>

          <motion.div
            className="w-full flex flex-col sm:flex-row justify-center md:justify-start items-center mt-4 sm:mt-6 gap-3 sm:gap-4"
            variants={ctaVariant}
          >
            <button
              className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#184FA1] via-[#60a5fa] to-[#1856b6] text-white font-bold text-base sm:text-lg px-8 sm:px-14 py-4 sm:py-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-400/40 active:scale-95 border-2 border-white ring-2 ring-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 animate-gradient-sweep min-w-[140px] sm:min-w-[180px]"
              onClick={() => navigate('/be-hire')}
              style={{ letterSpacing: '1px' }}
            >
              <User className="w-6 h-6 sm:w-7 sm:h-7 mr-1 sm:mr-2" />
              Be Hire
            </button>
            <span className="w-4 sm:w-6"></span>
            <button
              className="flex items-center justify-center gap-2 sm:gap-3 bg-white text-blue-700 font-bold text-base sm:text-lg px-8 sm:px-14 py-4 sm:py-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-400/40 active:scale-95 border-2 border-white ring-2 ring-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 min-w-[140px] sm:min-w-[180px]"
              onClick={() => navigate('/get-hire')}
              style={{ letterSpacing: '1px' }}
            >
              <User className="w-6 h-6 sm:w-7 sm:h-7 mr-1 sm:mr-2 text-blue-700" />
              Get Hire
            </button>
          </motion.div>
        </div>

        {/* IMAGE */}
        <motion.div
          className="flex-1 w-full flex justify-center md:justify-end items-end md:items-center pb-0 relative"
          style={{ minHeight: '0', marginTop: '0' }}
          variants={imageVariant}
        >
          {/* Glow effect behind heroImg */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[480px] sm:h-[480px] bg-gradient-to-br from-blue-300 via-blue-100 to-purple-200 rounded-full blur-3xl opacity-60 z-0"></div>
          <img
            src={heroImg}
            alt="Security Guard"
            className="w-full max-w-[220px] sm:max-w-[420px] md:max-w-[600px] lg:max-w-[700px] object-contain object-bottom relative z-10"
            style={{ marginBottom: '0', marginTop: '0' }}
          />
          {/* Floating feature cards positioned around the model, not overlapping */}
          <div className="absolute left-0 sm:-left-8 md:-left-32 top-[28%] sm:top-1/4 animate-floating-card" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full shadow-lg px-2 sm:px-5 py-1 sm:py-2">
              <span className="w-6 h-6 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20l7-7-7-7 13 7-7 7 7-7"></path></svg>
              </span>
              <span className="font-semibold text-gray-900 text-[10px] sm:text-base">Illustration</span>
            </div>
          </div>
          <div className="absolute right-0 sm:right-[-40px] md:right-[-120px] top-1/2 animate-floating-card" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full shadow-lg px-2 sm:px-5 py-1 sm:py-2">
              <span className="w-6 h-6 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7-7-7-7 7 7 7z"></path></svg>
              </span>
              <span className="font-semibold text-gray text-[10px] sm:text-base">Graphic Design</span>
            </div>
          </div>
          <div className="absolute right-0 md:right-[-80px] top-[18%] md:top-[16%] animate-floating-card" style={{animationDelay: '0.8s'}}>
            <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full shadow-lg px-2 sm:px-5 py-1 sm:py-2">
              <span className="w-6 h-6 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 8.5 22 9.3 17 14.2 18.5 21 12 17.8 5.5 21 7 14.2 2 9.3 9 8.5 12 2"></polygon></svg>
              </span>
              <span className="font-semibold text-gray-900 text-[10px] sm:text-base">Creative Branding</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes floating-cleaning-item {
          0% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
          100% { transform: translateY(0); }
        }
        .floating-cleaning-item {
          animation: floating-cleaning-item 3.5s ease-in-out infinite;
        }
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
    </section>
  );
};
