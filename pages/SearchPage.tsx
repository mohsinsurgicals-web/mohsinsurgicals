import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { CATEGORIES } from '../constants';
import { searchProducts } from '../lib/shopify';
import { Product } from '../types';
import { Loader, SearchX, ArrowUpDown, Search } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setProducts([]);
      setSuggestedCategories([]);

      try {
        const results = await searchProducts(query);
        setProducts(results);

        if (results.length === 0) {
          const lowerQuery = query.toLowerCase();
          const suggestions = CATEGORIES.filter(cat => 
            cat.name.toLowerCase().includes(lowerQuery) || 
            (cat.slug && cat.slug.toLowerCase().includes(lowerQuery))
          ).map(cat => cat.slug || cat.name);
          setSuggestedCategories(suggestions);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const sortedProducts = useMemo(() => {
    const result = [...products];
    switch (sortBy) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return result.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return result.sort((a, b) => a.title.localeCompare(b.title));
      case 'relevance':
      default:
        return result;
    }
  }, [products, sortBy]);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-medical-text flex items-center gap-3">
            <Search className="text-medical-primary" /> Search Results
          </h1>
          <p className="text-gray-500 mt-2">
            {query ? (
              <>Showing results for <span className="font-bold text-gray-900">"{query}"</span></>
            ) : (
              "Enter a search term to find products."
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm text-gray-500 font-medium">
                Found <span className="text-gray-900 font-bold">{sortedProducts.length}</span> products
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-medical-primary"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">A-Z</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100">
            <SearchX size={64} className="mx-auto text-gray-200 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No exact matches found</h2>
            
            {suggestedCategories.length > 0 && (
              <div className="mb-8">
                <p className="text-gray-500 mb-6">Try browsing these related categories:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {suggestedCategories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
                      className="px-6 py-3 bg-medical-light text-medical-primary font-bold rounded-xl border border-medical-primary hover:bg-medical-primary hover:text-white transition-all shadow-sm"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/products')}
                className="px-8 py-3 bg-medical-primary text-white font-bold rounded-xl hover:bg-medical-dark transition-all shadow-md"
              >
                Browse All Products
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
