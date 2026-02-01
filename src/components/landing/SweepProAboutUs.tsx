import { motion, easeInOut } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeInOut,
    },
  },
};

const floatingVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: easeInOut,
    },
  },
};

const  SweepProAboutUs: React.FC = () => {

  const features = [
    'Verified Professionals',
    'Eco-Friendly Products',
    '100% Satisfaction'
  ];

  return (
    <motion.section
      id="about-us"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="min-h-screen p-8 relative overflow-hidden bg-gradient-to-b from-white via-[#eeebe3]/60 to-white"
    >
      <div className="max-w-6xl mx-auto relative z-10 p-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Images */}
          <div className="relative pt-16">
            {/* Main image container */}
            <motion.div
              variants={itemVariants}
              className="relative bg-gray-200 rounded-3xl shadow-2xl shadow-[#1800ad]/50 overflow-hidden"
            >
              <img 
                src="/assets/sweepro-washing.png" 
                alt="Professional cleaner in uniform"
                className="w-full h-[600px] object-fit"
              />
            </motion.div>

            {/* Top left office image */}
            <motion.div
              variants={floatingVariants}
              animate={{ y: [0, -15, 0] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-12 -left-8"
            >
              <div className="w-52 h-36 bg-white rounded-2xl shadow-2xl shadow-[#1800ad]/100 border-4 border-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="/assets/sweepro-kitchen.png" 
                  alt="Office cleaning team"
                  className="w-full h-full object-fit"
                />
              </div>
            </motion.div>

            {/* Bottom right team image */}
            <motion.div
              variants={floatingVariants}
              animate={{ y: [0, -15, 0] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1.5
              }}
              className="absolute -bottom-8 -right-8"
            >
              <div className="w-56 h-40 bg-white rounded-2xl shadow-2xl shadow-[#1800ad]/80 border-4 border-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="/assets/sweepro-clothes.png" 
                  alt="Professional cleaning team"
                  className="w-full h-full object-fit"
                />
              </div>
            </motion.div>
          </div>

          {/* Right side - Content */}
          <motion.div 
            variants={containerVariants}
            className="space-y-8 pt-12"
          >
            {/* About Us Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-block bg-[#eeebe3] text-[#1800ad] px-6 py-3 rounded-full text-sm font-semibold tracking-wide">
                About Us
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                <span className="text-gray-900">Professional Home Care,</span>
                <br />
                <span className="text-[#1800ad]">Built on Hygiene & Trust</span>
              </h1>
            </motion.div>

            {/* Description Section */}
            <motion.div variants={itemVariants}>
              <p className="text-lg text-gray-700 leading-relaxed space-y-4">
                <span className="block mb-4">
                  <strong className="text-[#1800ad]">SWEEPRO</strong>, a modern home care service with a traditional touch, built for reliability, hygiene, and professionalism in everyday housekeeping.
                </span>

                <span className="block mb-4">
                  We provide trained and verified care partners with structured cleaning plans and an essential cleaning kit to ensure consistent quality in every service. From kitchen to bathroom care, every Sweepro visit is efficient, safe, and professionally managed.
                </span>

                <span className="block mb-4">
                  Each plan is thoughtfully designed to deliver consistent care, reliable cleaning, and lasting comfort because hygiene and quality belong in every household.
                </span>

                <span className="block">
                  At Sweepro, we believe every clean home tells a happy story one that begins with Sweepro Care. We're here to make that care simple, affordable, and reliable.
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default SweepProAboutUs;
