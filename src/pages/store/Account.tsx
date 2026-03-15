import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, orderBy } from 'firebase/firestore';
import { User, Order } from '../../types';
import { formatPrice } from '../../lib/utils';
import { ShoppingBag, User as UserIcon, MapPin, LogOut, ChevronRight, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Account: React.FC = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  React.useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        const q = query(collection(db, 'orders'), where('customerId', '==', user.id), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      };
      fetchOrders();
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const newUser: User = {
          id: res.user.uid,
          name,
          email,
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', res.user.uid), newUser);
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-stone-500 text-sm">
            {isLogin ? 'Sign in to access your orders and profile' : 'Join Luxe Boutique for a premium shopping experience'}
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs border border-red-100">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-stone-900 text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-colors">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-stone-500 hover:text-stone-900 underline underline-offset-4"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Sidebar */}
        <aside className="lg:w-64 space-y-8">
          <div>
            <h2 className="text-2xl font-serif mb-1">{user.name}</h2>
            <p className="text-stone-400 text-xs uppercase tracking-widest">{user.email}</p>
          </div>

          <nav className="flex flex-col space-y-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${activeTab === 'orders' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <ShoppingBag size={18} />
              <span>My Orders</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${activeTab === 'profile' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <UserIcon size={18} />
              <span>Profile Details</span>
            </button>
            <button 
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${activeTab === 'addresses' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <MapPin size={18} />
              <span>Addresses</span>
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center space-x-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-grow">
          {activeTab === 'orders' && (
            <div className="space-y-8">
              <h3 className="text-xl font-serif">Order History</h3>
              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-stone-100 p-6 rounded-xl hover:border-stone-200 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                        <div>
                          <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Order Number</p>
                          <p className="text-sm font-bold">{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Date</p>
                          <p className="text-sm">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Status</p>
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${
                            order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Total</p>
                          <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="w-12 h-16 bg-stone-50 flex-shrink-0 rounded overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-stone-50 rounded-2xl">
                  <Package size={48} className="mx-auto text-stone-200 mb-4" />
                  <p className="text-stone-500 italic">You haven't placed any orders yet.</p>
                  <Link to="/shop" className="mt-4 inline-block text-stone-900 underline underline-offset-4 text-sm">Start Shopping</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-8">
              <h3 className="text-xl font-serif">Profile Details</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user.name}
                    className="w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    disabled
                    className="w-full px-4 py-3 border border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    defaultValue={user.phone}
                    className="w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <button className="bg-stone-900 text-white px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-colors">
                  Update Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
