import { motion } from 'framer-motion';
import { Mail, Phone, Briefcase, CheckCircle, Send, Sparkles, Handshake } from 'lucide-react';
import { useState } from 'react';

interface FormData {
  contactPerson: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
  serviceType: string[];
  serviceLocations: string;
  message: string;
  preferredContactMethod: string;
}

export const B2BSection: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    contactPerson: '',
    email: '',
    phone: '',
    companyName: '',
    website: '',
    serviceType: [],
    serviceLocations: '',
    message: '',
    preferredContactMethod: 'email',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Only allow digits for phone field
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      serviceType: prev.serviceType.includes(type)
        ? prev.serviceType.filter(t => t !== type)
        : [...prev.serviceType, type]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/b2b/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          contactPerson: '',
          email: '',
          phone: '',
          companyName: '',
          website: '',
          serviceType: [],
          serviceLocations: '',
          message: '',
          preferredContactMethod: 'email',
        });
      } else {
        alert('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <section className="py-20 bg-gradient-to-br from-[#1800ad]/5 to-[#eeebe3]/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 shadow-xl"
          >
            <div className="w-20 h-20 bg-[#1800ad] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 text-lg mb-6">
              Your request has been submitted successfully. Our team will review your application and get back to you within 24-48 hours.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="b2b-services" className="py-20 bg-gradient-to-br from-[#1800ad]/5 to-[#eeebe3]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#1800ad] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Handshake className="w-4 h-4" />
            B2B Services
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Partner with <span className="text-[#1800ad]">Sweepro</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Are you a bank, school, corporate, or other business looking for professional cleaning and security services? Partner with Sweepro for reliable facility management solutions.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          {/* Contact Details Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1800ad] rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Contact Details</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1800ad] focus:ring-2 focus:ring-[#1800ad]/20 transition-all"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1800ad] focus:ring-2 focus:ring-[#1800ad]/20 transition-all"
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1800ad] focus:ring-2 focus:ring-[#1800ad]/20 transition-all"
                  placeholder="10-digit phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact</label>
                <select
                  name="preferredContactMethod"
                  value={formData.preferredContactMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1800ad] focus:ring-2 focus:ring-[#1800ad]/20 transition-all"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>

          {/* Company Details Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1800ad] rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Company Details</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1800ad] focus:ring-2 focus:ring-[#1800ad]/20 transition-all"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1800ad] focus:ring-2 focus:ring-[#1800ad]/20 transition-all"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          </div>

          {/* Service Requirements Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1800ad] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Service Requirements</h3>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Service Types Needed *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Daily Cleaning',
                  'Deep Cleaning',
                  'Office Cleaning',
                  'House Keeping',
                  'Security Services',
                  'Move-in/Move-out'
                ].map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleServiceTypeToggle(service)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      formData.serviceType.includes(service)
                        ? 'border-[#1800ad] bg-[#1800ad] text-white'
                        : 'border-gray-300 hover:border-[#1800ad] text-gray-700'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Locations *</label>
              <input
                type="text"
                name="serviceLocations"
                value={formData.serviceLocations}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1800ad] focus:ring-2 focus:ring-[#1800ad]/20 transition-all"
                placeholder="Cities/areas you serve"
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1800ad] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Additional Information</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1800ad] focus:ring-2 focus:ring-[#1800ad]/20 transition-all resize-none"
                placeholder="Tell us about your service requirements or any specific needs..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 sm:gap-3 bg-[#1800ad] text-white font-bold text-base sm:text-lg px-8 sm:px-14 py-4 sm:py-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#ca0013] active:scale-95 border-2 border-[#1800ad] ring-2 ring-[#eeebe3] focus:outline-none focus:ring-4 focus:ring-[#1800ad] min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ letterSpacing: '1px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
              <Send className="w-5 h-5" />
            </button>
          </div>
        </motion.form>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Briefcase,
              title: 'Professional Services',
              description: 'Get reliable cleaning and security services for your business facilities.',
            },
            {
              icon: Handshake,
              title: 'Dedicated Support',
              description: 'Get a dedicated account manager and priority support for all your needs.',
            },
            {
              icon: Sparkles,
              title: 'Competitive Pricing',
              description: 'Enjoy special B2B pricing and volume discounts for your business.',
            },
          ].map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-[#1800ad]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#1800ad]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
