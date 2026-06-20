import React from 'react';
import { ShoppingCart, Eye, Heart, Star, AlertCircle, Calendar } from 'lucide-react';
import { Product } from '../types';
import { isRentalAvailable } from '../lib/shopify';
import { useCart } from '../context/CartContext';
import { useNavigate } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const navigate = useNavigate();

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock) {
        addToCart(product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleNavigate = () => {
  navigate(`/products/${product.handle}`); // descriptive URL
};

  return (
    <div 
      onClick={handleNavigate}
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full cursor-pointer relative ${!product.inStock ? 'opacity-80 bg-gray-50' : ''}`}
    >
      {/* Wishlist Button (Always Visible) */}
      <button 
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
      >
        <Heart 
            size={18} 
            className={inWishlist ? "fill-red-600 text-red-600" : "text-gray-400 hover:text-red-600"} 
        />
      </button>

      <div className="relative p-4 bg-gray-50 h-56 flex items-center justify-center overflow-hidden">
        <img 
          src={product.image || undefined} 
          alt={product.title} 
          className={`max-h-full max-w-full object-contain mix-blend-multiply  transition-transform duration-500 ${!product.inStock ? 'grayscale opacity-60' : ''}`}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-10">
            {!product.inStock ? (
                <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                  <AlertCircle size={10} /> OUT OF STOCK
                </span>
            ) : (
                <>
                  {discount > 0 && (
                      <span className="bg-medical-alert text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      {discount}% OFF
                      </span>
                  )}
                  {isRentalAvailable(product) && (
                    <span className="bg-medical-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                      <Calendar size={10} /> RENTAL AVAILABLE
                    </span>
                  )}
                </>
            )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-gray-500 mb-1">{product.vendor}</div>
        <h3 className={`font-heading font-medium text-gray-800 text-sm md:text-base line-clamp-2 hover:text-medical-primary cursor-pointer mb-2 ${!product.inStock ? 'text-gray-500' : ''}`}>
          {product.title}
        </h3>
        
        {/* Rating Row */}
        {product.rating && (
            <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center bg-green-50 px-2 py-0.5 rounded text-green-700 text-[11px] font-bold gap-1">
                    <span>{product.rating}</span> <Star size={12} fill="currentColor" />
                </div>
                <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
            </div>
        )}

        {/* Specs snippet */}
        <p className="text-xs text-gray-400 mb-3 bg-gray-50 px-2 py-1 rounded inline-block self-start">
            {product.specs}
        </p>

        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
                {product.compareAtPrice && (
                    <span className="text-xs text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString()}</span>
                )}
                <span className={`font-bold text-lg ${!product.inStock ? 'text-gray-400' : 'text-medical-dark'}`}>₹{product.price.toLocaleString()}</span>
            </div>
            
            <div className="relative group/btn">
                <button 
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`p-2 rounded-lg transition-colors z-10 ${
                        product.inStock 
                        ? 'bg-medical-light text-medical-dark hover:bg-medical-primary hover:text-white' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <ShoppingCart size={20} />
                </button>
                {!product.inStock && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Item is currently out of stock
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;