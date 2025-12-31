// FeatureSection.tsx

import { motion } from "framer-motion";
import { Clock, Shield, Users,Package } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Trusted Professionals",
    description: "All our care partners are background-verified, insured, and trained to deliver exceptional service.",
    color: "emerald",
  },
  {
    icon: Clock,
    title: "Consistent & Reliable",
    description: "Enjoy uninterrupted service with well-structured schedules, backup support, and transparent communication.",
    color: "blue",
  },
  {
    icon: Users,
    title: "Designed for Modern Homes",
    description: "From compact apartments to spacious villas, our plans adapt to your home's needs and lifestyle.",
    color: "amber",
  },
  {
    icon: Package,
    title: "Sweepro Kit",
    description: "We equip our team with a curated cleaning kit to ensure effective, hygienic, and consistent results – every single time",
    color: "indigo",
  },
];

const colorClasses = {
  emerald: {
    icon: "text-emerald-600",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    ring: "ring-emerald-200 hover:ring-emerald-300",
  },
  blue: {
    icon: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100",
    ring: "ring-blue-200 hover:ring-blue-300",
  },
  amber: {
    icon: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100",
    ring: "ring-amber-200 hover:ring-amber-300",
  },
  indigo: {
    icon: "text-indigo-600",
    bg: "bg-indigo-50 hover:bg-indigo-100",
    ring: "ring-indigo-200 hover:ring-indigo-300",
  },
};

export default function FeaturesSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      id="services"
      className="relative min-h-[600px] sm:min-h-screen py-10 sm:py-24 overflow-hidden flex items-center"
    >
      <div className="relative max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-20">
          <div className="inline-block mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Essential Homecare
            <span className="block text-blue-600">Made Simple</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-xs sm:max-w-3xl mx-auto leading-relaxed">
            Experience the difference with our trusted professionals and flexible service options
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 w-full">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color];
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col items-center justify-center h-full animate-feature-card"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  minHeight: '180px',
                  height: '100%',
                }}
              >
                <div className={`
                  relative p-4 sm:p-8 rounded-xl border-2 transition-all duration-300 ease-out
                  bg-white shadow-sm
                  ${colors.ring} border-gray-100
                  flex flex-col items-center justify-center h-full w-full
                `} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  {/* Icon centered */}
                  <div className={`
                    w-10 h-10 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-3 sm:mb-6 mx-auto
                    ${colors.bg} ring-2 transition-all duration-300
                    ${colors.ring} floating-feature-bg
                  `}>
                    <Icon className={`w-5 h-5 sm:w-8 sm:h-8 ${colors.icon} transition-transform duration-300 mx-auto`} />
                  </div>
                  {/* Content */}
                  <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-4 leading-tight text-center">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-gray-600 sm:leading-relaxed sm:line-height-7 text-center">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes feature-card-animate {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          50% { opacity: 1; transform: translateY(-8px) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-feature-card {
          animation: feature-card-animate 1.2s cubic-bezier(.4,2,.3,1) both;
        }
        @keyframes floating-feature-bg {
          0% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0); }
        }
        .floating-feature-bg {
          animation: floating-feature-bg 2.5s ease-in-out infinite;
        }
        @keyframes floating-feature-icon {
          0% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0); }
        }
        .floating-feature-icon {
          animation: floating-feature-icon 2.5s ease-in-out infinite;
        }
      `}</style>
    </motion.section>
  );
}