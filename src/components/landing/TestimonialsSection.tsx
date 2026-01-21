//TestimonalsSection

//TestimonalsSection

import { motion } from 'framer-motion';
import React from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  content: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Riana Madiva",
    role: "CEO Founder",
    rating: 5,
    content: "The increase in product sales is exponential and takes place gradually. It's really a very good job",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Celine Dion",
    role: "Cafe Owner",
    rating: 5,
    content: "Increase product sales and increase the amount of cash that comes in for further development",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "John Melon",
    role: "Marketing Director",
    rating: 5,
    content: "Outstanding service quality and professional approach. The results exceeded our expectations completely",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Sarah Johnson",
    role: "Startup Founder",
    rating: 5,
    content: "Gradual, it's really a very good job. The team understood our vision perfectly and delivered amazing results",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Mike Rodriguez",
    role: "E-commerce Owner",
    rating: 5,
    content: "The transformation of our business has been remarkable. Sales have increased by 300% in just 6 months",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Emily Chen",
    role: "Tech Consultant",
    rating: 5,
    content: "Professional team with innovative solutions. They delivered exactly what we needed and more",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face"
  }
];

const TestimonialCard: React.FC<{ testimonial: Testimonial; isEven: boolean }> = ({ testimonial, isEven }) => (
  <div className={`rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-300 ease-in-out mb-4 hover:scale-105 hover:-rotate-1 hover:shadow-xl hover:z-10 ${
    isEven 
      ? 'bg-[#1800ad] text-white' 
      : 'bg-[#eeebe3] text-gray-800'
  }`}>
    <div className="flex items-center mb-3 sm:mb-4" >
      <img 
        src={testimonial.avatar} 
        alt={testimonial.name} 
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-full mr-3 sm:mr-4 object-cover border-2 border-white/20"
      />
      <div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1">{testimonial.name}</h3>
        <p className="text-xs sm:text-sm opacity-90">{testimonial.role}</p>
      </div>
    </div>
    <div className="flex gap-1 mb-3 sm:mb-4 text-[#FFB800] text-sm sm:text-base">
      {[...Array(testimonial.rating)].map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
    <p className="text-sm sm:text-base leading-relaxed">{testimonial.content}</p>
  </div>
);

export default function TestimonialsSection() {
  // Double the testimonials array for continuous scrolling
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <motion.section
       id="testimonials"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="py-12 sm:py-16 px-4 sm:px-6 md:px-8 bg-white overflow-hidden"
    >
      <style>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        @keyframes scrollDown {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        .animate-scroll-up {
          animation: scrollUp 40s linear infinite;
        }
        
        .animate-scroll-down {
          animation: scrollDown 40s linear infinite;
        }
        
        .animate-scroll-up:hover,
        .animate-scroll-down:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto mb-8 sm:mb-12 flex justify-between items-start md:flex-row flex-col md:items-start items-center md:text-left text-center gap-6 md:gap-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black max-w-lg leading-tight">
          They Satisfied With Our Service
        </h1>
        <div className="md:text-right text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1800ad] mb-2">Testimonials</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xs mx-auto md:mx-0">"Have many related needs, we present a suitable package for you needs"</p>
        </div>
      </div>

      <div className="flex gap-4 md:gap-8 max-w-7xl mx-auto h-[500px] md:h-[600px] overflow-hidden">
        {/* Column 1 - Scroll Up */}
        <div className="flex-1 relative h-full overflow-hidden">
          <div className="animate-scroll-up flex flex-col gap-4">
            {doubledTestimonials.map((testimonial, index) => (
              <TestimonialCard 
                key={`col1-${testimonial.id}-${index}`} 
                testimonial={testimonial}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        </div>

        {/* Column 2 - Scroll Down (Hidden on mobile) */}
        <div className="hidden sm:flex flex-1 relative h-full overflow-hidden">
          <div className="animate-scroll-down flex flex-col gap-4 w-full">
            {doubledTestimonials.slice().reverse().map((testimonial, index) => (
              <TestimonialCard 
                key={`col2-${testimonial.id}-${index}`} 
                testimonial={testimonial}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        </div>

        {/* Column 3 - Scroll Up (Hidden on mobile and tablet) */}
        <div className="hidden lg:flex flex-1 relative h-full overflow-hidden">
          <div className="animate-scroll-up flex flex-col gap-4 w-full">
            {[...doubledTestimonials].slice(3).map((testimonial, index) => (
              <TestimonialCard 
                key={`col3-${testimonial.id}-${index}`} 
                testimonial={testimonial}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}