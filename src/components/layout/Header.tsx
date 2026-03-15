import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Heart, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="bg-stone-900 text-white text-[10px] uppercase tracking-[0.2em] py-2 text-center">
        Free shipping on orders over LKR 10,000
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-stone-600"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-serif tracking-widest uppercase">Luxe</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            <Link to="/shop" className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors">Shop All</Link>
            <Link to="/shop/new-arrivals" className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors">New Arrivals</Link>
            <Link to="/shop/dresses" className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors">Dresses</Link>
            <Link to="/shop/abayas" className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors">Abayas</Link>
            <Link to="/about" className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors">Our Story</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-stone-600 hover:text-stone-900 transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            <Link to="/account" className="p-2 text-stone-600 hover:text-stone-900 transition-colors">
              <User size={20} />
            </Link>
            <Link to="/wishlist" className="p-2 text-stone-600 hover:text-stone-900 transition-colors hidden sm:block">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="p-2 text-stone-600 hover:text-stone-900 transition-colors relative">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-full max-w-xs bg-white z-[70] shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-xl font-serif tracking-widest uppercase">Luxe</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <nav className="flex flex-col space-y-6">
                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-lg uppercase tracking-widest text-stone-900">Shop All</Link>
                <Link to="/shop/new-arrivals" onClick={() => setIsMenuOpen(false)} className="text-lg uppercase tracking-widest text-stone-900">New Arrivals</Link>
                <Link to="/shop/dresses" onClick={() => setIsMenuOpen(false)} className="text-lg uppercase tracking-widest text-stone-900">Dresses</Link>
                <Link to="/shop/abayas" onClick={() => setIsMenuOpen(false)} className="text-lg uppercase tracking-widest text-stone-900">Abayas</Link>
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-lg uppercase tracking-widest text-stone-900">Our Story</Link>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-lg uppercase tracking-widest text-stone-900">Contact</Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
