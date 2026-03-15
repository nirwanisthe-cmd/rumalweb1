import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Lock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-stone-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div>
            <h3 className="text-xl font-serif tracking-widest uppercase mb-6">Luxe</h3>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Curating premium fashion for the modern woman. Elegance, quality, and timeless style in every piece.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-stone-400 hover:text-stone-900 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-stone-400 hover:text-stone-900 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-stone-400 hover:text-stone-900 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/shop" className="text-stone-500 hover:text-stone-900 text-sm transition-colors">All Collections</Link></li>
              <li><Link to="/shop/new-arrivals" className="text-stone-500 hover:text-stone-900 text-sm transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop/bestsellers" className="text-stone-500 hover:text-stone-900 text-sm transition-colors">Bestsellers</Link></li>
              <li><Link to="/shop/plus-size" className="text-stone-500 hover:text-stone-900 text-sm transition-colors">Plus Size</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/track-order" className="text-stone-500 hover:text-stone-900 text-sm transition-colors">Track Order</Link></li>
              <li><Link to="/shipping" className="text-stone-500 hover:text-stone-900 text-sm transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-stone-500 hover:text-stone-900 text-sm transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="text-stone-500 hover:text-stone-900 text-sm transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-stone-400 mt-0.5" />
                <span className="text-stone-500 text-sm">123 Fashion Ave, Colombo 07, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-stone-400" />
                <span className="text-stone-500 text-sm">+94 11 234 5678</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-stone-400" />
                <span className="text-stone-500 text-sm">hello@luxeboutique.lk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-8 flex flex-col md:flex-row justify-between items-center relative">
          <p className="text-stone-400 text-xs mb-4 md:mb-0 flex items-center">
            © 2026 Luxe Boutique. All rights reserved.
            <Link 
              to="/admin/login" 
              className="ml-2 text-stone-100 hover:text-stone-200 transition-colors"
              title="Admin Access"
            >
              <Lock size={10} />
            </Link>
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-stone-400 hover:text-stone-600 text-[10px] uppercase tracking-widest">Privacy Policy</Link>
            <Link to="/terms" className="text-stone-400 hover:text-stone-600 text-[10px] uppercase tracking-widest">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
