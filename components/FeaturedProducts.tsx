import React from 'react';
import { ArrowRight, Loader } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Link } from '../context/CartContext';

interface FeaturedProductsProps {
  products: Product[];
  isLoading: boolean;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, isLoading }) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-medical-text">Bestselling Equipment</h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Top-rated medical devices for home use</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-1 text-medical-primary font-medium hover:text-medical-dark">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
           <div className="flex justify-center items-center h-64">
             <Loader className="animate-spin text-medical-primary" size={40} />
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
            <Link to="/products" className="inline-flex items-center gap-1 text-medical-primary font-medium hover:text-medical-dark">
                View All Products <ArrowRight size={16} />
            </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;