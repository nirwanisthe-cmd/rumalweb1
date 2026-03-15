import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, Category } from '../../types';
import ProductCard from '../../components/store/ProductCard';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Shop: React.FC = () => {
  const { category: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug || null);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, 'categories'));
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'), where('status', '==', 'published'));

        if (selectedCategory) {
          // In a real app, you'd find the category ID by slug
          const cat = categories.find(c => c.slug === selectedCategory);
          if (cat) {
            q = query(q, where('categoryId', '==', cat.id));
          }
        }

        const snap = await getDocs(q);
        let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Client-side sorting for simplicity in this demo
        if (sortBy === 'price-low') results.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        if (sortBy === 'price-high') results.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        if (sortBy === 'newest') results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setProducts(results);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0 || !selectedCategory) {
      fetchProducts();
    }
  }, [selectedCategory, sortBy, categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-serif">
            {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name : 'Shop All'}
          </h1>
          <p className="text-stone-500 text-sm mt-1">{products.length} Products</p>
        </div>

        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center text-xs uppercase tracking-widest font-semibold text-stone-900 border-b border-stone-900 pb-1"
          >
            <SlidersHorizontal size={16} className="mr-2" /> Filters
          </button>
          
          <div className="relative group">
            <button className="flex items-center text-xs uppercase tracking-widest font-semibold text-stone-900 border-b border-stone-900 pb-1">
              Sort By: {sortBy.replace('-', ' ')} <ChevronDown size={14} className="ml-2" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button onClick={() => setSortBy('newest')} className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-stone-50">Newest</button>
              <button onClick={() => setSortBy('price-low')} className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-stone-50">Price: Low to High</button>
              <button onClick={() => setSortBy('price-high')} className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-stone-50">Price: High to Low</button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[3/4] bg-stone-200" />
              <div className="h-4 bg-stone-200 w-3/4" />
              <div className="h-4 bg-stone-200 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-stone-500 italic">No products found matching your criteria.</p>
          <button 
            onClick={() => setSelectedCategory(null)}
            className="mt-4 text-stone-900 underline underline-offset-4 text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-[70] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-xl font-serif">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-12">
                {/* Categories */}
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6">Categories</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className={`block text-sm transition-colors ${!selectedCategory ? 'text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                    >
                      All Products
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`block text-sm transition-colors ${selectedCategory === cat.slug ? 'text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6">Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button key={size} className="border border-stone-200 py-2 text-xs hover:border-stone-900 transition-colors">
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6">Price Range</h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 text-sm text-stone-600">
                      <input type="checkbox" className="accent-stone-900" />
                      <span>Under LKR 5,000</span>
                    </label>
                    <label className="flex items-center space-x-3 text-sm text-stone-600">
                      <input type="checkbox" className="accent-stone-900" />
                      <span>LKR 5,000 - LKR 10,000</span>
                    </label>
                    <label className="flex items-center space-x-3 text-sm text-stone-600">
                      <input type="checkbox" className="accent-stone-900" />
                      <span>Over LKR 10,000</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-stone-100">
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-stone-900 text-white py-4 uppercase tracking-widest text-xs font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
