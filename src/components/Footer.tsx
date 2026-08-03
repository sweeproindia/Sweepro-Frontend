//footer.tsx


//Footer.tsx

import { motion } from 'framer-motion';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bg-gradient-to-tr from-[#1800ad] via-[#12006b] to-[#1800ad] border-t border-[#ca0013]/40 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand Section */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center group">
              <img src="/assets/logo-black.png" alt="Sweepro Logo" className="h-21 w-40 pr-3 mr-6  object-contain transition-all duration-300 group-hover:scale-110" />
            </Link>
            <p className="text-[#eeebe3] leading-relaxed text-base font-medium">
              Enjoy a sparkling home, every day. Our trusted, background-verified professionals bring peace of mind and a fresh start to your space.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://www.instagram.com/sweepro.in" target="_blank" rel="noopener noreferrer" className="text-[#eeebe3]/80 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://wa.me/918143353030" target="_blank" rel="noopener noreferrer" className="text-[#eeebe3]/80 hover:text-white transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide"> Upcoming Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/#services" className="text-[#eeebe3] hover:text-white transition-colors font-medium">Cooking</Link>
              </li>
              <li>
                <Link to="/#services" className="text-[#eeebe3] hover:text-white transition-colors font-medium">Baby Care</Link>
              </li>
              <li>
                <Link to="/#services" className="text-[#eeebe3] hover:text-white transition-colors font-medium">Elder Care</Link>
              </li>
              <li>
                <Link to="/#services" className="text-[#eeebe3] hover:text-white transition-colors font-medium">Deep Cleaning</Link>
              </li>
              <li>
                <Link to="/#services" className="text-[#eeebe3] hover:text-white transition-colors font-medium">Car Wash</Link>
              </li>
               <li>
                <Link to="/#services" className="text-[#eeebe3] hover:text-white transition-colors font-medium">Move-in/Move-out</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-[#eeebe3]/80" />
                <span className="text-[#eeebe3] font-medium">+91 81433 53030</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-[#eeebe3]/80" />
                <span className="text-[#eeebe3] font-medium">support@sweepro.in</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-[#eeebe3]/80 mt-0.5" />
                <span className="text-[#eeebe3] font-medium leading-snug">
                  {/* <span className="block">Flat No. 519, 5th Floor, B-Block</span>
                  <span className="block">Saara Homes Residency, Upperpally (Pill No. 174)</span> */}
                  <span className="block">Hyderabad</span>
                  <span className="block">Telangana – 500048, India</span>
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#eeebe3]/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-[#eeebe3]/80 text-sm font-medium">
              2026 Sweepro, All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-[#eeebe3]/80 hover:text-white transition-colors font-medium">Privacy Policy</Link>
              <Link to="/terms" className="text-[#eeebe3]/80 hover:text-white transition-colors font-medium">Terms of Service</Link>
              <Link to="/cookies" className="text-[#eeebe3]/80 hover:text-white transition-colors font-medium">Cookie Policy</Link>
            </div>
          </div>
        </div>

      </div>
    </motion.footer>
  );
};