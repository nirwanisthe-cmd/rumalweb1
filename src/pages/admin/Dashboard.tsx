import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const usersSnap = await getDocs(collection(db, 'users'));

        const orders = ordersSnap.docs.map(doc => doc.data() as Order);
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

        setStats({
          totalSales,
          totalOrders: ordersSnap.size,
          totalCustomers: usersSnap.size,
          totalProducts: productsSnap.size,
        });

        const recentQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQuery);
        setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <span className="flex items-center text-xs font-bold text-green-500">
            <TrendingUp size={14} className="mr-1" /> {trend}
          </span>
        )}
      </div>
      <p className="text-stone-400 text-xs uppercase tracking-widest font-bold mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-stone-900">{value}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif">Dashboard Overview</h1>
          <p className="text-stone-400 text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-stone-200 px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            Export Report
          </button>
          <button className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors">
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatPrice(stats.totalSales)} 
          icon={TrendingUp} 
          color="bg-emerald-500"
          trend="+12.5%"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          color="bg-indigo-500"
          trend="+5.2%"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          color="bg-amber-500"
          trend="+8.1%"
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={Package} 
          color="bg-stone-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-bold mb-8">Sales Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f5f5f4' }}
                />
                <Bar dataKey="sales" fill="#1c1917" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest">View All</Link>
          </div>
          <div className="space-y-6">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">{order.orderNumber}</p>
                    <p className="text-xs text-stone-400">{order.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-stone-900">{formatPrice(order.total)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                    order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 
                    order.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-center text-stone-400 text-sm py-10">No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
