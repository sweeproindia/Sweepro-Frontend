import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "How does the subscription service work?",
    answer: "Our subscription service offers flexible cleaning schedules - daily, weekly, or monthly visits. You can choose the frequency that works best for your home and budget."
  },
  {
    id: 2,
    question: "Are your cleaning professionals verified?",
    answer: "Yes, absolutely! Every cleaning professional undergoes thorough background checks, identity verification, and reference checks. We also provide insurance coverage."
  },
  {
    id: 3,
    question: "Can I reschedule my cleaning appointment?",
    answer: "You can easily reschedule or cancel your cleaning appointment up to 24 hours before the scheduled time through our mobile app or website."
  },
  {
    id: 4,
    question: "What cleaning supplies do you use?",
    answer: "We use professional-grade, eco-friendly cleaning supplies that are safe for your family and pets. Our products are effective yet gentle on surfaces."
  },
  {
    id: 5,
    question: "Do I need to be home during cleaning?",
    answer: "No, you don't need to be home! Many of our customers provide us with a key or access code. Our professionals are fully insured and trustworthy."
  }
];

const FAQItem: React.FC<{ item: FAQItem; isOpen: boolean; onToggle: () => void }> = ({ 
  item, 
  isOpen, 
  onToggle 
}) => {
  return (
    <motion.div 
      className={`border-b border-[#eeebe3] last:border-b-0 overflow-hidden ${isOpen ? 'bg-[#f8f7f3]' : 'bg-transparent'}`}
      initial={false}
      animate={{ backgroundColor: isOpen ? '#f8f7f3' : 'transparent' }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={onToggle}
        className="w-full py-6 px-4 text-left flex justify-between items-center hover:text-[#1800ad] transition-colors duration-200 group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <h3 className="text-lg font-medium text-gray-900 pr-8 flex-1">
          {item.question}
        </h3>
        <div className="flex-shrink-0 ml-4">
          <div className="relative w-5 h-5">
            {/* Horizontal line of the plus */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={false}
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="w-5 h-0.5 bg-[#1800ad] rounded-full"></div>
            </motion.div>
            
            {/* Vertical line of the plus - becomes second line of X */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={false}
              animate={{ rotate: isOpen ? -45 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="w-5 h-0.5 bg-[#1800ad] rounded-full origin-center"></div>
            </motion.div>
          </div>
        </div>
      </motion.button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`answer-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: {
                  duration: 0.4,
                  ease: [0.04, 0.62, 0.23, 0.98]
                },
                opacity: {
                  duration: 0.25,
                  delay: 0.15
                }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: {
                  duration: 0.3,
                  ease: [0.04, 0.62, 0.23, 0.98]
                },
                opacity: {
                  duration: 0.2
                }
              }
            }}
            className="overflow-hidden"
          >
            <motion.div 
              className="px-4 pb-6"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-gray-600 leading-relaxed pl-2 border-l-2 border-[#1800ad]">
                {item.answer}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([1]); // First item open by default

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <motion.section
      id="faq-section"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - FAQ Content */}
          <div>
            {/* Header */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#1800ad] mb-6">
                Got Questions?
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our cleaning services.
              </p>
            </motion.div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {faqData.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-xl overflow-hidden shadow-soft hover:shadow-gentle transition-shadow duration-300"
                >
                  <FAQItem
                    item={item}
                    isOpen={openItems.includes(item.id)}
                    onToggle={() => toggleItem(item.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative lg:sticky lg:top-24">
            <motion.div 
              className="relative z-10 overflow-hidden rounded-2xl shadow-soft"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop&crop=center" 
                alt="Professional cleaning service" 
                className="w-full h-[600px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </motion.div>
            
            {/* Decorative element */}
            <motion.div 
              className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#1800ad]/10 rounded-full -z-10"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};