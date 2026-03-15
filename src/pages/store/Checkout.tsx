import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    paymentMethod: 'COD',
  });

  const deliveryFee = subtotal > 10000 ? 0 : 500;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderNumber = `LX-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderData = {
        orderNumber,
        customerId: user?.id || 'guest',
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: {
          addressLine: formData.address,
          city: formData.city,
          district: formData.district,
        },
        items,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      navigate('/track-order', { state: { orderNumber } });
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center text-xs uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 mb-12 transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" /> Back to Cart
      </button>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Checkout Form */}
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-serif mb-8">Contact Information</h2>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email Address"
                required
                className="w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input 
                type="tel" 
                placeholder="Phone Number"
                required
                className="w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif mb-8">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input 
                type="text" 
                placeholder="First Name"
                required
                className="px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Last Name"
                required
                className="px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Street Address"
                required
                className="w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="City"
                  required
                  className="px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <select 
                  className="px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900 bg-white"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                >
                  <option value="">Select District</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  {/* Add more districts */}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif mb-8">Payment Method</h2>
            <div className="space-y-4">
              <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${formData.paymentMethod === 'COD' ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="accent-stone-900 mr-4"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  />
                  <span className="text-sm font-medium">Cash on Delivery</span>
                </div>
              </label>
              <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${formData.paymentMethod === 'Bank Transfer' ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="accent-stone-900 mr-4"
                    checked={formData.paymentMethod === 'Bank Transfer'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'Bank Transfer' })}
                  />
                  <span className="text-sm font-medium">Bank Transfer</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-stone-50 p-8 sticky top-32">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-8">Your Order</h2>
            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
                  <div className="w-16 h-20 bg-stone-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-xs font-medium text-stone-900">{item.name}</h4>
                    <p className="text-[10px] text-stone-500 mt-1">Qty: {item.quantity} | Size: {item.size}</p>
                    <p className="text-xs font-bold mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 py-6 border-y border-stone-200 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Delivery Fee</span>
                <span className="text-stone-900">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-bold uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold">{formatPrice(total)}</span>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white py-5 uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-colors disabled:bg-stone-400"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            <div className="mt-6 flex items-center justify-center text-stone-400 text-[10px] uppercase tracking-widest">
              <ShieldCheck size={14} className="mr-2" /> 100% Secure Checkout
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
