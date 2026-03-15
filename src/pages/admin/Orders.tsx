import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { formatPrice } from '../../lib/utils';
import { Search, Filter, Eye, MoreVertical, X, Printer, Truck, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { orderStatus: status, updatedAt: new Date().toISOString() });
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, orderStatus: status as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif">Orders</h1>
        <div className="flex space-x-3">
          <button className="bg-white border border-stone-200 px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..."
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-600 flex items-center">
            <Filter size={18} className="mr-2" /> Status
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Order ID</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Customer</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Date</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Total</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Status</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-stone-900">{order.orderNumber}</span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-stone-900">{order.customerName}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">{order.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-stone-600">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-stone-900">{formatPrice(order.total)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${
                    order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 
                    order.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                    order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-serif">Order {selectedOrder.orderNumber}</h2>
                <p className="text-stone-400 text-xs mt-1">Placed on {format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy at HH:mm')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Order Items */}
              <div className="md:col-span-2 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400">Items</h3>
                  <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center p-4 space-x-4">
                        <div className="w-12 h-16 bg-stone-100 rounded overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-stone-900">{item.name}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest">Qty: {item.quantity} | Size: {item.size}</p>
                        </div>
                        <p className="text-sm font-bold text-stone-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-6 bg-stone-50 rounded-xl">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest font-bold text-stone-400">Current Status</p>
                    <p className="text-lg font-bold text-stone-900">{selectedOrder.orderStatus}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedOrder.orderStatus === 'Pending' && (
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'Confirmed')}
                        className="bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
                      >
                        Confirm Order
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'Confirmed' && (
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'Shipped')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
                      >
                        Mark as Shipped
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'Shipped' && (
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'Delivered')}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Info */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-4">Customer</h3>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-900">{selectedOrder.customerName}</p>
                    <p className="text-sm text-stone-600">{selectedOrder.email}</p>
                    <p className="text-sm text-stone-600">{selectedOrder.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-4">Shipping Address</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-stone-600">{selectedOrder.address.addressLine}</p>
                    <p className="text-sm text-stone-600">{selectedOrder.address.city}, {selectedOrder.address.district}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-4">Payment Info</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-stone-600">Method: <span className="font-bold text-stone-900">{selectedOrder.paymentMethod}</span></p>
                    <p className="text-sm text-stone-600">Status: <span className="font-bold text-stone-900">{selectedOrder.paymentStatus}</span></p>
                  </div>
                </div>

                <div className="pt-8 border-t border-stone-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-stone-400">Subtotal</span>
                    <span className="text-stone-900 font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-stone-400">Delivery</span>
                    <span className="text-stone-900 font-medium">{formatPrice(selectedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
