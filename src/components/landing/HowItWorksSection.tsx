//HowItWorksSection.tsx

"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle, CreditCard, Smile, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    icon: UserPlus,
    title: "Select Subscription",
    description: "Choose the perfect plan for your needs - Basic, Standard, or Premium.",
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
  const step5Progress = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);

  const stepProgresses = [step1Progress, step2Progress, step3Progress, step4Progress, step5Progress];

  const [activeStep, setActiveStep] = useState(-1);
  const [allVisible, setAllVisible] = useState(false);
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!allVisible) {
      if (activeStep < steps.length - 1) {
        timerRef.current = setTimeout(() => setActiveStep(activeStep + 1), 2000);
      } else if (activeStep === steps.length - 1) {
        setAllVisible(true);
        timerRef.current = setTimeout(() => {}, 0); // No-op, all cards visible
      } else {
        setActiveStep(0);
      }
    } else {
      timerRef.current = setTimeout(() => {
        setActiveStep(-1);
        setAllVisible(false);
        setCycle(cycle + 1);
      }, 7000);
    }
    return () => clearTimeout(timerRef.current);
  }, [activeStep, allVisible, cycle]);

  return (
    <motion.div
      id="how-it-works"
      className="py-20 relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Getting started is simple. Follow these easy steps to transform your cleaning routine.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 xl:gap-20 px-2 lg:px-0 justify-items-center items-stretch w-full max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative text-center group flex flex-col items-center h-full"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={allVisible || activeStep >= index ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Icon Circle with Sequential Fill and floating effect on the full circle */}
              <div className="relative mb-6">
                <motion.div
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full border-2 mb-4 relative overflow-hidden floating-icon"
                  style={{ borderColor: activeStep === index ? '#2563eb' : '#2563eb', background: 'white' }}
                >
                  <motion.div 
                    className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                    style={{ backgroundColor: 'white' }}
                  >
                    <step.icon className={`h-8 w-8 ${activeStep === index || allVisible ? 'text-blue-600' : 'text-blue-600'} transition-colors duration-300`} />
                  </motion.div>
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
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
