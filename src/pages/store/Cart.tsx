import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/utils';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-stone-300">
            <ShoppingBag size={48} />
          </div>
        </div>
        <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
        <p className="text-stone-500 mb-12">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          to="/shop" 
          className="inline-block bg-stone-900 text-white px-12 py-4 uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif mb-12">Shopping Cart ({totalItems})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-6 py-6 border-b border-stone-100 last:border-0">
              <div className="w-24 h-32 flex-shrink-0 bg-stone-100 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-stone-900">{item.name}</h3>
                  <button 
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="text-xs text-stone-500 space-y-1 mb-4">
                  {item.size && <p>Size: {item.size}</p>}
                  {item.color && <p>Color: {item.color}</p>}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center border border-stone-200">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                      className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                      className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-stone-50 p-8 sticky top-32">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Shipping</span>
                <span className="text-stone-900">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-stone-200 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-widest">Total</span>
                <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Link 
              to="/checkout" 
              className="w-full bg-stone-900 text-white py-5 uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center"
            >
              Checkout <ArrowRight size={16} className="ml-2" />
            </Link>
            <p className="text-[10px] text-stone-400 text-center mt-6 uppercase tracking-widest">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
