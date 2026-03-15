import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const isOnSale = product.salePrice && product.salePrice < product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      quantity: 1,
      image: product.featuredImage,
      size: product.sizes[0],
      color: product.colors[0],
    });
  };

  return (
    <Link to={`/product/${product.slug}`} className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4">
        <img 
          src={product.featuredImage} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOnSale && (
            <span className="bg-red-500 text-white text-[10px] uppercase tracking-widest px-2 py-1 font-semibold">
              Sale
            </span>
          )}
          {product.newArrival && (
            <span className="bg-stone-900 text-white text-[10px] uppercase tracking-widest px-2 py-1 font-semibold">
              New
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/80 backdrop-blur-sm flex justify-between items-center">
          <button 
            onClick={handleQuickAdd}
            className="flex items-center text-[10px] uppercase tracking-widest font-bold text-stone-900 hover:text-stone-600 transition-colors"
          >
            <ShoppingBag size={14} className="mr-2" /> Quick Add
          </button>
          <button className="text-stone-900 hover:text-red-500 transition-colors">
            <Heart size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm text-stone-800 group-hover:text-stone-600 transition-colors font-medium truncate">
          {product.name}
        </h3>
        <div className="flex items-center space-x-2">
          {isOnSale ? (
            <>
              <span className="text-sm font-semibold text-stone-900">{formatPrice(product.salePrice!)}</span>
              <span className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-stone-900">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
