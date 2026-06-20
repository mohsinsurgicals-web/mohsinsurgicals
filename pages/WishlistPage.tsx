import React from 'react';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-6 rounded-full mb-6 shadow-sm">
            <Heart size={48} className="text-gray-300" fill="currentColor" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Items marked with a heart will be saved here for you to purchase later.</p>
        <button 
            onClick={() => navigate('/products')}
            className="bg-medical-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-medical-dark transition-colors"
        >
            Start Browsing
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
            <Heart size={28} className="text-red-600" fill="currentColor" />
            <h1 className="text-3xl font-heading font-bold text-gray-800">My Wishlist</h1>
            <span className="text-gray-500 text-lg">({wishlist.length} items)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div key={product.id} className="relative group">
                {/* Custom Overlay for Wishlist specific actions */}
                <ProductCard product={product} />
                <div className="mt-2 flex gap-2">
                    <button 
                        onClick={() => {
                            addToCart(product);
                            removeFromWishlist(product.id);
                        }}
                        className="flex-1 bg-medical-dark text-white py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingCart size={16} /> Move to Cart
                    </button>
                    <button 
                        onClick={() => removeFromWishlist(product.id)}
                        className="px-3 bg-white border border-gray-200 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-100 transition-colors"
                        title="Remove from Wishlist"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
            <Link to="/products" className="inline-flex items-center gap-2 text-medical-primary font-bold hover:underline">
                Continue Shopping <ArrowRight size={18} />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;