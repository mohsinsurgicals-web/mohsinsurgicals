import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart, Stethoscope, LogOut, Home, Grid, ChevronRight, Phone, Loader } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from '../context/CartContext';
import TopBar from './TopBar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { APP_NAME, CATEGORIES } from '../constants';
import { searchProducts } from '../lib/shopify';
import { Product } from '../types';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, wishlist } = useCart();
  const { isAuthenticated, customer, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Sync local search term with URL param
  useEffect(() => {
    const query = searchParams.get('search');
    setSearchTerm(query || '');
  }, [searchParams]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (searchRef.current && !searchRef.current.contains(event.target as Node)) &&
        (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node))
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchProducts(searchTerm);
          setSuggestions(results.slice(0, 6)); // Show top 6 suggestions
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (window.location.pathname === '/search') {
      navigate('/search');
    }
  };

  return (
    <header className="relative lg:sticky lg:top-0 z-50 bg-white shadow-md">
      <TopBar />

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1 text-medical-text hover:text-medical-primary transition-colors" onClick={toggleMenu}>
              <Menu size={28} />
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="text-medical-primary hidden sm:block">
                <Stethoscope size={36} strokeWidth={2} />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-xl md:text-3xl font-heading font-bold text-medical-primary tracking-tight uppercase">MOHSIN</span>
                <span className="text-[1.3rem] font-bold text-gray-600 uppercase tracking-wide">SURGICALS</span>

              </div>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden lg:block flex-1 max-w-xl mx-8 relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Search for Oxygen Concentrators, BiPAP..."
                className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary bg-gray-50 text-sm"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 pr-1">
                {isLoading && <Loader className="animate-spin text-medical-primary" size={16} />}
                {searchTerm && (
                  <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={16} />
                  </button>
                )}
                <button type="submit" className="bg-medical-primary text-white p-1.5 rounded-md hover:bg-medical-dark transition-colors">
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Desktop Suggestions Dropdown */}
            {showSuggestions && (searchTerm.trim().length >= 2) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-[60]">
                {suggestions.length > 0 ? (
                  <div className="py-2">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.handle}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded border p-1">
                          <img src={product.image} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                          <p className="text-xs text-medical-primary font-bold">₹{product.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1 bg-gray-50">
                      <button 
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-center py-2 text-xs font-bold text-medical-primary hover:underline uppercase tracking-wider"
                      >
                        View all results for "{searchTerm}"
                      </button>
                    </div>
                  </div>
                ) : !isLoading && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No products found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 sm:gap-6">

            {isAuthenticated ? (
              <Link to="/account" className="hidden sm:flex flex-col items-center cursor-pointer text-gray-700 hover:text-medical-primary">
                <div className="relative">
                  <User size={22} className="" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-[10px] font-bold mt-0.5">Account</span>
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:flex flex-col items-center cursor-pointer text-gray-700 hover:text-medical-primary">
                <User size={22} />
                <span className="text-[10px] font-bold mt-0.5">Login</span>
              </Link>
            )}

            <Link to="/wishlist" className="flex flex-col items-center cursor-pointer text-gray-700 hover:text-medical-primary relative">
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-medical-alert text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {wishlist.length}
                </span>
              )}
              <span className="text-[10px] font-bold mt-0.5 hidden sm:block">Wishlist</span>
            </Link>

            <Link to="/cart" className="flex flex-col items-center cursor-pointer text-gray-700 hover:text-medical-primary relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-medical-alert text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
              <span className="text-[10px] font-bold mt-0.5 hidden sm:block">Cart</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search (Below header on mobile) */}
        <div ref={mobileSearchRef} className="mt-3 lg:hidden relative">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.trim().length >= 2 && setShowSuggestions(true)}
              placeholder="Search medical equipment..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-medical-primary bg-white text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isLoading && <Loader className="animate-spin text-medical-primary" size={16} />}
              {searchTerm && (
                <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
              <button type="submit" className="text-medical-primary">
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Mobile Suggestions Dropdown */}
          {showSuggestions && (searchTerm.trim().length >= 2) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden z-[60]">
              {suggestions.length > 0 ? (
                <div className="py-1">
                  {suggestions.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.handle}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <div className="w-8 h-8 flex-shrink-0 bg-gray-50 rounded border p-1">
                        <img src={product.image} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{product.title}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                  ))}
                  <button 
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-center py-2.5 text-[10px] font-bold text-medical-primary bg-gray-50"
                  >
                    SEE ALL RESULTS
                  </button>
                </div>
              ) : !isLoading && (
                <div className="p-3 text-center text-xs text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar (Desktop) - High Conversion Categories */}
      <nav className="hidden lg:block border-t border-gray-200 bg-white relative z-40">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-6 text-sm font-bold text-gray-700 py-3 uppercase tracking-wide cursor-pointer">
            <li className="hover:text-medical-primary transition-colors">
              <Link to="/products" className="flex items-center gap-1 cursor-pointer hover:text-medical-primary">
                All Products
              </Link>
            </li>

            {/* Added Product Dropdown */}
            <li className="relative group hover:text-medical-primary">
              <div className="flex items-center gap-1">
                Medical Devices <ChevronDown size={16} />
              </div>
              <ul className="absolute left-0 top-full mt-0 hidden w-64 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 p-2 origin-top-left transition-all group-hover:block z-50 capitalize font-medium text-gray-600">
                {CATEGORIES.map(cat => (
                  <li key={cat.slug || cat.name} className="px-4 py-2 hover:bg-medical-light hover:text-medical-dark transition-colors rounded-md">
                    <Link to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`} className="w-full flex items-center gap-3">
                      {cat.icon}
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li className="hover:text-medical-primary transition-colors"><Link to="/products?category=Hospital%20Furniture">Hospital Furniture</Link></li>
            <li className="hover:text-medical-primary transition-colors"><Link to="/products?category=Patient%20Monitor">Patient Monitors</Link></li>
            <li className="hover:text-medical-primary transition-colors ml-auto font-normal capitalize"><Link to="/about">About Us</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-visibility duration-300 ${isMenuOpen ? 'visible' : 'invisible delay-300'}`}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={toggleMenu}
        />

        <div
          className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-xs bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-5 border-b flex justify-between items-center bg-medical-primary text-white">
            <div className="font-heading font-bold text-lg">
              MOHSIN SURGICALS
            </div>
            <button onClick={toggleMenu} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* User Auth Section */}
            <div className="p-5 bg-gray-50 border-b border-gray-100">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-medical-dark text-white flex items-center justify-center font-bold">
                    {customer?.firstName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">Hi, {customer?.firstName}</p>
                    <button onClick={() => { logout(); toggleMenu(); }} className="text-xs text-red-500 font-medium">Sign Out</button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="block w-full text-center py-2.5 bg-medical-primary text-white rounded-md font-bold text-sm shadow-sm"
                >
                  Login / Register
                </Link>
              )}
            </div>

            {/* Main Navigation */}
            <div className="p-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mt-4 mb-2">Shop By Category</div>

              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                  onClick={toggleMenu}
                  className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-medical-accent hover:text-medical-primary rounded-lg group transition-colors"
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-medical-primary" />
                </Link>
              ))}

              <div className="h-px bg-gray-100 my-4 mx-4"></div>

              <Link to="/bulk-orders" onClick={toggleMenu} className="flex items-center gap-3 px-4 py-3 text-medical-dark font-bold">
                <Grid size={18} /> Bulk / Hospital Orders
              </Link>
              <Link to="/contact" onClick={toggleMenu} className="flex items-center gap-3 px-4 py-3 text-gray-600">
                <Phone size={18} /> Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;