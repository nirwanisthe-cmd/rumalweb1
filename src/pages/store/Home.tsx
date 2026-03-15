import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, Banner } from '../../types';
import ProductCard from '../../components/store/ProductCard';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const Home: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch Banners
        const bannersSnap = await getDocs(query(collection(db, 'banners'), where('active', '==', true), orderBy('order', 'asc')));
        setBanners(bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));

        // Fetch New Arrivals
        const newArrivalsSnap = await getDocs(query(collection(db, 'products'), where('status', '==', 'published'), where('newArrival', '==', true), limit(4)));
        setNewArrivals(newArrivalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Fetch Featured
        const featuredSnap = await getDocs(query(collection(db, 'products'), where('status', '==', 'published'), where('featured', '==', true), limit(8)));
        setFeaturedProducts(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        {banners.length > 0 ? (
          <div className="h-full">
            {/* Simple banner display for now, could be a slider */}
            <div className="relative h-full">
              <img 
                src={banners[0].imageDesktop} 
                alt={banners[0].title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-center px-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl text-white"
                >
                  <h1 className="text-5xl md:text-7xl font-serif mb-6">{banners[0].title}</h1>
                  <p className="text-lg md:text-xl mb-8 font-light tracking-wide">{banners[0].subtitle}</p>
                  <Link 
                    to={banners[0].buttonLink || '/shop'} 
                    className="inline-block bg-white text-stone-900 px-10 py-4 uppercase tracking-widest text-xs font-semibold hover:bg-stone-100 transition-colors"
                  >
                    {banners[0].buttonText || 'Shop Collection'}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-stone-200 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-serif mb-6 text-stone-800">New Collection</h1>
              <Link to="/shop" className="inline-block bg-stone-900 text-white px-10 py-4 uppercase tracking-widest text-xs font-semibold">Explore Now</Link>
            </div>
          </div>
        )}
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-stone-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <Truck size={32} className="text-stone-400" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">Islandwide Delivery</h3>
            <p className="text-stone-500 text-sm">Fast and reliable shipping across Sri Lanka</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <RefreshCw size={32} className="text-stone-400" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">Easy Returns</h3>
            <p className="text-stone-500 text-sm">7-day hassle-free return policy</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <ShieldCheck size={32} className="text-stone-400" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">Secure Payment</h3>
            <p className="text-stone-500 text-sm">100% secure payment processing</p>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-2">The Latest</h2>
            <h3 className="text-3xl font-serif">New Arrivals</h3>
          </div>
          <Link to="/shop/new-arrivals" className="text-sm font-medium border-b border-stone-900 pb-1 flex items-center group">
            View All <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/shop/dresses" className="relative group overflow-hidden aspect-[4/5] md:aspect-auto md:h-[600px]">
            <img 
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80" 
              alt="Dresses" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-end p-12">
              <div className="text-white">
                <h3 className="text-4xl font-serif mb-4">Elegant Dresses</h3>
                <span className="text-xs uppercase tracking-widest border-b border-white pb-1">Shop Collection</span>
              </div>
            </div>
          </Link>
          <div className="grid grid-rows-2 gap-8">
            <Link to="/shop/abayas" className="relative group overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80" 
                alt="Abayas" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-3xl font-serif mb-2">Modern Abayas</h3>
                  <span className="text-xs uppercase tracking-widest border-b border-white pb-1">Shop Now</span>
                </div>
              </div>
            </Link>
            <Link to="/shop/modest-wear" className="relative group overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80" 
                alt="Modest Wear" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-3xl font-serif mb-2">Modest Wear</h3>
                  <span className="text-xs uppercase tracking-widest border-b border-white pb-1">Explore</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-4">Curated for You</h2>
            <h3 className="text-4xl font-serif">Featured Collections</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-3xl mx-auto px-4 text-center py-20">
        <h2 className="text-3xl font-serif mb-4">Join the Luxe Club</h2>
        <p className="text-stone-500 mb-8">Subscribe to receive updates, access to exclusive deals, and more.</p>
        <form className="flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-grow px-6 py-4 bg-white border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
            required
          />
          <button className="bg-stone-900 text-white px-10 py-4 uppercase tracking-widest text-xs font-semibold hover:bg-stone-800 transition-colors">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
};

export default Home;
