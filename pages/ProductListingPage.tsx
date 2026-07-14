import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import SEO from '../components/SEO';
import { CATEGORIES } from '../constants';
import { fetchAllProducts, searchProducts } from '../lib/shopify';
import { Product } from '../types';
import { Filter, Loader, SearchX, Star, Check, ArrowUpDown, X, SlidersHorizontal } from 'lucide-react';

const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  
  // URL Params State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Local Filter State
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({ min: '', max: '' });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Sorting & Display State
  const [sortBy, setSortBy] = useState('availability');
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  // Sync state with URL params
  useEffect(() => {
    if (categoryParam) {
        setSelectedCategories([categoryParam]);
    } else {
        // If searching, we might want to clear categories or keep them if we allow filtering search results
        // For now, let's keep it simple: URL determines initial state
        if (!selectedCategories.length && !searchParam) setSelectedCategories([]); 
    }
  }, [categoryParam]);

  // Fetch Products
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setProducts([]); 
      try {
        let results: Product[] = [];
        
        if (searchParam) {
           results = await searchProducts(searchParam);
        } else {
           results = await fetchAllProducts();
        }
        
        setProducts(results);
        
        // Extract unique brands from result set
        const brands = Array.from(new Set(results.map(p => p.vendor))).filter(Boolean).sort();
        setAvailableBrands(brands);
        
      } catch (error) {
        console.error("Error loading products", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [searchParam]); 

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // --- Filtering & Sorting Logic ---
  const processedProducts = useMemo(() => {
    let result = products.filter(p => {
        // 1. Categories (Multi-select)
        if (selectedCategories.length > 0) {
           if (!selectedCategories.includes(p.category)) return false;
        }
    
        // 2. Price Range
        const pPrice = p.price;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        if (pPrice < min || pPrice > max) return false;
    
        // 3. Brand
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.vendor)) return false;
    
        // 4. Rating
        if (minRating !== null) {
            const rating = p.rating || 0;
            if (rating < minRating) return false;
        }

        // 5. Out of Stock Filter
        if (!showOutOfStock && !p.inStock) return false;
    
        return true;
      });

      // 6. Sorting
      result.sort((a, b) => {
          // Primary Sort: Stock Status (In stock first)
          if (a.inStock && !b.inStock) return -1;
          if (!a.inStock && b.inStock) return 1;

          // Secondary Sort: Selected Criteria
          switch (sortBy) {
              case 'price-asc':
                  return a.price - b.price;
              case 'price-desc':
                  return b.price - a.price;
              case 'name-asc':
                  return a.title.localeCompare(b.title);
              case 'name-desc':
                  return b.title.localeCompare(a.title);
              case 'availability':
              default:
                  return 0;
          }
      });

      return result;
  }, [products, selectedCategories, priceRange, selectedBrands, minRating, showOutOfStock, sortBy]);

  // --- Handlers ---

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    
    // Update URL if single category, or remove if multiple/none for cleaner URL
    const newParams = new URLSearchParams(searchParams);
    if (newCategories.length === 1) {
        newParams.set('category', newCategories[0]);
    } else {
        newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
        prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.delete('category');
    setSearchParams(newParams);
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSelectedBrands([]);
    setMinRating(null);
    setSortBy('availability');
    setShowOutOfStock(true);
  };

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  const removeActiveFilter = (type: 'category' | 'brand' | 'price', value?: string) => {
      if (type === 'category' && value) {
          handleCategoryToggle(value);
      } else if (type === 'brand' && value) {
          handleBrandToggle(value);
      } else if (type === 'price') {
          setPriceRange({ min: '', max: '' });
      }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <SEO 
        title={categoryParam || "Medical Equipment Store"}
        description={categoryParam 
          ? `Browse our wide range of ${categoryParam} at Mohsin Surgicals. High-quality medical equipment at affordable prices.` 
          : "Shop professional medical equipment including oxygen concentrators, CPAP, BiPAP and more."}
      />
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-medical-text">Medical Equipment Store</h1>
            {searchParam ? (
                <div className="flex items-center gap-2 mt-2">
                    <p className="text-gray-500">Search results for: <span className="font-semibold text-gray-800">"{searchParam}"</span></p>
                    <button onClick={clearSearch} className="text-medical-alert text-sm hover:underline flex items-center gap-1"><SearchX size={14}/> Clear Search</button>
                </div>
            ) : (
                <p className="text-gray-500 mt-2">Browse our wide range of hospital-grade supplies.</p>
            )}
          </div>
          
          <button 
            className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg font-semibold text-gray-700 shadow-sm"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>

        {/* Active Filters Bar */}
        {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange.min || priceRange.max) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm font-semibold text-gray-500 mr-2">Active Filters:</span>
                {selectedCategories.map(cat => (
                    <button key={cat} onClick={() => removeActiveFilter('category', cat)} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-200 transition-colors">
                        {cat} <X size={12} />
                    </button>
                ))}
                {selectedBrands.map(brand => (
                    <button key={brand} onClick={() => removeActiveFilter('brand', brand)} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-purple-200 transition-colors">
                        {brand} <X size={12} />
                    </button>
                ))}
                {(priceRange.min || priceRange.max) && (
                    <button onClick={() => removeActiveFilter('price')} className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-green-200 transition-colors">
                        ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'} <X size={12} />
                    </button>
                )}
                <button onClick={clearAllFilters} className="text-xs text-gray-400 underline hover:text-red-500 ml-2">Clear All</button>
            </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* Mobile Filter Overlay */}
          {isMobileFiltersOpen && (
             <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setIsMobileFiltersOpen(false)} />
          )}

          {/* Sidebar Filters */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-white p-6 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-1/4 lg:shadow-none lg:bg-transparent lg:p-0 lg:z-auto
            ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-6 h-full overflow-y-auto lg:h-auto space-y-8">
              <div className="flex items-center justify-between font-bold text-medical-dark border-b border-gray-100 pb-4 lg:hidden">
                <div className="flex items-center gap-2"><Filter size={20} /> Filters</div>
                <button onClick={() => setIsMobileFiltersOpen(false)}><X size={24} className="text-gray-400"/></button>
              </div>

              <div className="hidden lg:flex items-center justify-between font-bold text-medical-dark border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2"><Filter size={20} /> Filters</div>
                <button onClick={clearAllFilters} className="text-xs text-gray-400 hover:text-red-500 font-normal">Reset All</button>
              </div>
              
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-sm text-gray-800 mb-3">Categories</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.slug || cat.name} className="flex items-center gap-2 cursor-pointer group hover:text-medical-primary">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat.slug || cat.name) ? 'bg-medical-primary border-medical-primary' : 'border-gray-300 bg-white'}`}>
                          {selectedCategories.includes(cat.slug || cat.name) && <Check size={12} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedCategories.includes(cat.slug || cat.name)} 
                        onChange={() => handleCategoryToggle(cat.slug || cat.name)}
                      />
                      <span className={`text-sm ${selectedCategories.includes(cat.slug || cat.name) ? 'font-medium text-medical-primary text-gray-800' : 'text-gray-600'}`}>
                        {cat.name} <span className="text-gray-400 text-xs">({categoryCounts[cat.slug || cat.name] || 0})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-semibold text-sm text-gray-800 mb-3">Price (₹)</h3>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        placeholder="Min" 
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-medical-primary"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        type="number" 
                        placeholder="Max" 
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-medical-primary"
                    />
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                 <h3 className="font-semibold text-sm text-gray-800 mb-3">Brands</h3>
                 <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                    {availableBrands.length > 0 ? availableBrands.map(brand => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedBrands.includes(brand) ? 'bg-medical-primary border-medical-primary' : 'border-gray-300 bg-white'}`}>
                                 {selectedBrands.includes(brand) && <Check size={12} className="text-white" />}
                             </div>
                             <input 
                                type="checkbox" 
                                className="hidden"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => handleBrandToggle(brand)}
                             />
                             <span className={`text-sm ${selectedBrands.includes(brand) ? 'text-medical-dark font-medium' : 'text-gray-600'}`}>{brand}</span>
                        </label>
                    )) : (
                        <p className="text-xs text-gray-400 italic">No brands available</p>
                    )}
                 </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold text-sm text-gray-800 mb-3">Rating</h3>
                <div className="space-y-2">
                    {[4, 3, 2].map((stars) => (
                        <div 
                            key={stars} 
                            onClick={() => setMinRating(prev => prev === stars ? null : stars)}
                            className={`flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors ${minRating === stars ? 'bg-blue-50 border border-blue-100' : ''}`}
                        >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${minRating === stars ? 'border-medical-primary' : 'border-gray-300'}`}>
                                {minRating === stars && <div className="w-2 h-2 bg-medical-primary rounded-full"></div>}
                            </div>
                            <div className="flex items-center gap-1 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < stars ? "currentColor" : "none"} className={i >= stars ? "text-gray-300" : ""} />
                                ))}
                            </div>
                            <span className="text-xs text-gray-600">& Up</span>
                        </div>
                    ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            
            {/* Sorting and Results Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500 font-medium">
                    {!isLoading && (
                        <>Showing <span className="text-gray-900 font-bold">{processedProducts.length}</span> results</>
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {/* Stock Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={showOutOfStock}
                                onChange={(e) => setShowOutOfStock(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-medical-primary"></div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Show Out of Stock</span>
                    </label>

                    {/* Sorting Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                        <div className="relative">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg focus:ring-medical-primary focus:border-medical-primary block w-full pl-3 pr-8 py-2 focus:outline-none cursor-pointer"
                            >
                                <option value="availability">Availability</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Alphabetical: A-Z</option>
                                <option value="name-desc">Alphabetical: Z-A</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <ArrowUpDown size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : processedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl text-center shadow-sm h-full flex flex-col items-center justify-center">
                <SearchX size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your filters or clearing your search.</p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-6 px-6 py-2 bg-medical-light text-medical-primary font-bold rounded-lg hover:bg-medical-primary hover:text-white transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
            
            {!isLoading && processedProducts.length > 0 && (
                <div className="mt-8 text-center text-xs text-gray-400">
                    Showing {processedProducts.length} results
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
