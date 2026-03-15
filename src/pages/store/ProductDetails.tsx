import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetails: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as Product;
          setProduct(data);
          setSelectedSize(data.sizes[0]);
          setSelectedColor(data.colors[0]);
        } else {
          navigate('/shop');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      quantity,
      image: product.featuredImage,
      size: selectedSize,
      color: selectedColor,
    });
  };

  const isOnSale = product.salePrice && product.salePrice < product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative">
            <img 
              src={product.images[activeImage] || product.featuredImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {isOnSale && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 font-bold">
                Sale
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`aspect-square overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-stone-900' : 'border-transparent'}`}
              >
                <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-serif mb-4">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-6">
              {isOnSale ? (
                <>
                  <span className="text-2xl font-semibold text-stone-900">{formatPrice(product.salePrice!)}</span>
                  <span className="text-lg text-stone-400 line-through">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-2xl font-semibold text-stone-900">{formatPrice(product.price)}</span>
              )}
            </div>
            <p className="text-stone-600 leading-relaxed">{product.shortDescription}</p>
          </div>

          {/* Selectors */}
          <div className="space-y-6">
            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold mb-4">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[50px] h-12 border flex items-center justify-center text-xs transition-colors ${selectedSize === size ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:border-stone-900'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold mb-4">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 h-12 border flex items-center justify-center text-xs transition-colors ${selectedColor === color ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:border-stone-900'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold mb-4">Quantity</h3>
              <div className="flex items-center border border-stone-200 w-32">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-12 flex items-center justify-center text-stone-400 hover:text-stone-900"
                >
                  -
                </button>
                <span className="flex-grow text-center text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-12 flex items-center justify-center text-stone-400 hover:text-stone-900"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={handleAddToCart}
              className="flex-grow bg-stone-900 text-white py-5 uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center"
            >
              <ShoppingBag size={18} className="mr-2" /> Add to Cart
            </button>
            <button className="w-full sm:w-16 h-16 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-500 transition-all">
              <Heart size={20} />
            </button>
          </div>

          {/* Details Tabs */}
          <div className="border-t border-stone-200 pt-8 space-y-6">
            <details className="group" open>
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="text-xs uppercase tracking-widest font-bold">Description</span>
                <ChevronRight size={16} className="transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="pt-4 text-stone-500 text-sm leading-relaxed">
                {product.description}
              </div>
            </details>
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="text-xs uppercase tracking-widest font-bold">Material & Care</span>
                <ChevronRight size={16} className="transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="pt-4 text-stone-500 text-sm leading-relaxed space-y-2">
                <p><strong>Material:</strong> {product.material || 'Premium Fabric'}</p>
                <p><strong>Care:</strong> {product.careInstructions || 'Dry clean only'}</p>
              </div>
            </details>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-stone-100">
            <div className="flex flex-col items-center text-center space-y-2">
              <Truck size={20} className="text-stone-400" />
              <span className="text-[10px] uppercase tracking-widest text-stone-500">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <RefreshCw size={20} className="text-stone-400" />
              <span className="text-[10px] uppercase tracking-widest text-stone-500">Easy Returns</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <ShieldCheck size={20} className="text-stone-400" />
              <span className="text-[10px] uppercase tracking-widest text-stone-500">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
