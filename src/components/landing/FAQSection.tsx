//FAQSection.tsx


import { ChevronDown, ChevronUp } from 'lucide-react';
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
}) => (
  <div className="border-b border-gray-100 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full py-4 text-left flex justify-between items-center hover:text-primary transition-colors duration-200"
    >
      <h3 className="text-lg font-medium text-gray-900 pr-4">
        {item.question}
      </h3>
      <div className="flex-shrink-0">
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-primary" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </button>
    {isOpen && (
      <div className="pb-4">
        <p className="text-gray-600 leading-relaxed">
          {item.answer}
        </p>
      </div>
    )}
  </div>
);

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
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - FAQ Content */}
          <div>
            {/* Header */}
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Got Questions?
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our cleaning services.
              </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-2">
              {faqData.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <FAQItem
                    item={item}
                    isOpen={openItems.includes(item.id)}
                    onToggle={() => toggleItem(item.id)}
                  />
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <button className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200">
                Contact Support
              </button>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop&crop=center" 
                alt="Professional cleaning service" 
                className="w-full h-[500px] object-cover rounded-2xl shadow-soft"
              />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-success/10 rounded-full"></div>
            
            {/* Floating Card */}
            <div className="absolute bottom-8 -left-8 bg-white p-6 rounded-xl shadow-large max-w-xs">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                  <span className="text-success text-xl">★</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Trusted Service</p>
                  <p className="text-sm text-gray-600">4.9/5 Rating</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                "Amazing service! My home has never been cleaner. Highly recommend!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 