//footer.tsx


//Footer.tsx

import { motion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bg-gradient-to-tr from-[#031024] via-[#0C0950] to-[#031024] border-t border-blue-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center group">
              <img src="/assets/logo-black.png" alt="Sweepro Logo" className="h-21 w-40 pr-3 mr-6  object-contain transition-all duration-300 group-hover:scale-110" />
            </Link>
            <p className="text-blue-100 leading-relaxed text-base font-medium">
              Enjoy a sparkling home, every day. Our trusted, background-verified professionals bring peace of mind and a fresh start to your space.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide"> Upcoming Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/#services" className="text-blue-100 hover:text-white transition-colors font-medium">Regular Cleaning</Link>
              </li>
              <li>
                <Link to="/#services" className="text-blue-100 hover:text-white transition-colors font-medium">Deep Cleaning</Link>
              </li>
              <li>
                <Link to="/#services" className="text-blue-100 hover:text-white transition-colors font-medium">Move-in/Move-out</Link>
              </li>
              <li>
                <Link to="/#services" className="text-blue-100 hover:text-white transition-colors font-medium">Post-construction</Link>
              </li>
              <li>
                <Link to="/#services" className="text-blue-100 hover:text-white transition-colors font-medium">Office Cleaning</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-blue-100 hover:text-white transition-colors font-medium">About Us</Link>
              </li>
              <li>
                <Link to="/careers" className="text-blue-100 hover:text-white transition-colors font-medium">Careers</Link>
              </li>
              <li>
                <Link to="/blog" className="text-blue-100 hover:text-white transition-colors font-medium">Blog</Link>
              </li>
              <li>
                <Link to="/press" className="text-blue-100 hover:text-white transition-colors font-medium">Press</Link>
              </li>
              <li>
                <Link to="/partners" className="text-blue-100 hover:text-white transition-colors font-medium">Partners</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-300" />
                <span className="text-blue-100 font-medium">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-300" />
                <span className="text-blue-100 font-medium">support@cleanease.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blue-300 mt-1" />
                <span className="text-blue-100 font-medium">
                  123 Business Park,<br />Mumbai, Maharashtra 400001
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-blue-200 text-sm font-medium">
              © 2024 CleanEase. All rights reserved. | Made with care for your peace of mind.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-blue-200 hover:text-white transition-colors font-medium">Privacy Policy</Link>
              <Link to="/terms" className="text-blue-200 hover:text-white transition-colors font-medium">Terms of Service</Link>
              <Link to="/cookies" className="text-blue-200 hover:text-white transition-colors font-medium">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};