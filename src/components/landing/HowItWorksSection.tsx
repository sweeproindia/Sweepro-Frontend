//HowItWorksSection.tsx

"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle, CreditCard, Smile, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    icon: UserPlus,
    title: "Select Subscription",
    description: "Choose the perfect plan for your needs - Sweepro-Touch or Sweepro-Lux.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Pay safely through Razorpay with multiple payment options.",
  },
  {
    icon: CheckCircle,
    title: "Professional Service",
    description: "Our verified cleaners arrive on time and deliver excellent results.",
  },
  {
    icon: Smile,
    title: "Relax & Enjoy",
    description: "Come home to a spotless house and enjoy your free time.",
  },
];

export const HowItWorksSection = () => {
  const { scrollYProgress } = useScroll();
  
  // Create scroll-based transforms for sequential circle filling
  const step1Progress = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const step2Progress = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  const step3Progress = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const step4Progress = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);

  const stepProgresses = [step1Progress, step2Progress, step3Progress, step4Progress];

  const [isVisible, setIsVisible] = useState(false);

  return (
    <motion.div
      id="how-it-works"
      className="py-20 relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      onViewportEnter={() => setIsVisible(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1800ad] mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started is simple. Follow these easy steps to transform your daily cleaning routine.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 xl:gap-20 px-2 lg:px-0 justify-items-center items-stretch w-full max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative text-center group flex flex-col items-center h-full"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Icon Circle with floating effect */}
              <div className="relative mb-6">
                <motion.div
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full border-2 mb-4 relative overflow-hidden floating-icon"
                  style={{ borderColor: '#1800ad', background: '#eeebe3' }}
                >
                  <motion.div 
                    className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                    style={{ backgroundColor: '#eeebe3' }}
                  >
                    <step.icon className="h-8 w-8 text-[#1800ad] transition-colors duration-300" />
                  </motion.div>
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-[#1800ad] mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes floating {
          0% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0); }
        }
        .floating-icon {
          animation: floating 2.5s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
};
