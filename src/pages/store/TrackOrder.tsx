import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { formatPrice } from '../../lib/utils';
import { Search, Package, CheckCircle, Truck, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const TrackOrder: React.FC = () => {
  const location = useLocation();
  const [orderNumber, setOrderNumber] = useState(location.state?.orderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const q = query(collection(db, 'orders'), where('orderNumber', '==', orderNumber.trim()), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setOrder({ id: snap.docs[0].id, ...snap.docs[0].data() } as Order);
      } else {
        setError('Order not found. Please check your order number.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while tracking your order.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { status: 'Pending', icon: Clock, label: 'Order Placed' },
    { status: 'Confirmed', icon: CheckCircle, label: 'Confirmed' },
    { status: 'Processing', icon: Package, label: 'Processing' },
    { status: 'Shipped', icon: Truck, label: 'Shipped' },
    { status: 'Delivered', icon: CheckCircle, label: 'Delivered' },
  ];

  const currentStepIdx = steps.findIndex(s => s.status === order?.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif mb-4">Track Your Order</h1>
        <p className="text-stone-500">Enter your order number to see the current status of your delivery.</p>
      </div>

      <form onSubmit={handleTrack} className="max-w-md mx-auto mb-16">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Order Number (e.g. LX-123456)"
            required
            className="w-full pl-6 pr-32 py-5 border border-stone-200 focus:outline-none focus:border-stone-900 shadow-sm"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-stone-900 text-white px-6 text-xs uppercase tracking-widest font-bold hover:bg-stone-800 transition-colors disabled:bg-stone-400"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
        {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
      </form>

      {order && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Status Timeline */}
          <div className="bg-white p-8 md:p-12 border border-stone-100 shadow-xl rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Order Number</p>
                <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Estimated Delivery</p>
                <p className="text-sm font-bold">3-5 Business Days</p>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-0">
              {/* Progress Line */}
              <div className="absolute top-5 left-5 md:left-0 md:right-0 h-full md:h-0.5 bg-stone-100 -z-10 hidden md:block" />
              
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.status} className="flex md:flex-col items-center text-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${isCompleted ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-300'}`}>
                      <step.icon size={18} />
                    </div>
                    <div className="ml-4 md:ml-0 md:mt-4 text-left md:text-center">
                      <p className={`text-[10px] uppercase tracking-widest font-bold ${isCompleted ? 'text-stone-900' : 'text-stone-300'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-[10px] text-stone-400 mt-1">
                          {format(new Date(order.updatedAt), 'MMM dd, HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-stone-50 p-8 rounded-2xl">
              <h3 className="text-xs uppercase tracking-widest font-bold mb-6 flex items-center">
                <MapPin size={16} className="mr-2" /> Delivery Address
              </h3>
              <div className="space-y-1 text-sm text-stone-600">
                <p className="font-bold text-stone-900">{order.customerName}</p>
                <p>{order.address.addressLine}</p>
                <p>{order.address.city}, {order.address.district}</p>
                <p className="pt-2">{order.phone}</p>
              </div>
            </div>
            <div className="bg-stone-50 p-8 rounded-2xl">
              <h3 className="text-xs uppercase tracking-widest font-bold mb-6 flex items-center">
                <Package size={16} className="mr-2" /> Order Items
              </h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-stone-600">{item.name} x {item.quantity}</span>
                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-stone-200 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
