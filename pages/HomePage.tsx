import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, ShieldCheck, Truck, Clock, Award, ChevronRight } from 'lucide-react';
import { fetchAllProducts, fetchProductsByCategory } from '../lib/shopify';
import { Product } from '../types';
import { APP_NAME, CATEGORIES, BRANDS } from '../constants';
import { Link, useNavigate } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import SEO from '../components/SEO';

const HomePage: React.FC = () => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [Oxygencons, setOxygencons] = useState<Product[]>([]);
  const [bipaps, setBipaps] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const all = await fetchAllProducts();
      // Filter logic can be improved with real data tags
      const inStock = all.filter(p => p.inStock);
      setPopularProducts(inStock.slice(0, 4));
      setNewArrivals(inStock.slice(4, 8));
      const oxygen = await fetchProductsByCategory("Oxygen Concentrator");
      setOxygencons(oxygen.filter(p => p.inStock).slice(0, 4));
      const bipap = await fetchProductsByCategory("BiPAP machine");
      setBipaps(bipap.filter(p => p.inStock).slice(0, 4));
      setIsLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="bg-gray-50">
      <SEO 
        title="Home"
        description="Buy Oxygen Concentrators, BiPAP, CPAP, and Hospital Furniture online at Mohsin Surgicals. Authentic products, expert support, and fast delivery across India."
      />
      {/* Short Hero Banner */}
      <section className="bg-gradient-to-r from-medical-dark to-medical-primary text-white py-12 md:py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left space-y-4 max-w-xl">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wider uppercase backdrop-blur-sm border border-white/30">
              Trusted by 500+ Hospitals
            </span>
            <h1 className="text-3xl md:text-5xl font-heading font-bold leading-tight">
              Medical Equipment <br /> for Home & Hospital
            </h1>
            <p className="text-blue-50 text-base md:text-lg">
              Authorized dealer for Philips, ResMed, BMC, Oxymed & more. Get hospital-grade equipment delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <Link to="/products?category=Oxygen%20Concentrator" className="bg-white text-medical-dark px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-100 transition-colors">
                Buy Oxygen Machines
              </Link>
              <Link to="/products?category=BiPAP" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                View BiPAP / CPAP
              </Link>
            </div>
          </div>
          <div className="hidden md:block w-80 h-64 bg-white overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl relative group">
            <img
              src="https://images.unsplash.com/photo-1513224502586-d1e602410265?auto=format&fit=crop&w=800&q=80"
              alt="Medical Equipment"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlay gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 p-3 rounded-lg text-medical-dark text-center shadow-lg backdrop-blur-sm border border-white/50">
              <p className="font-bold text-sm">Need help choosing?</p>
              <p className="text-xs font-medium">Call our Expert: +91 93903 49389</p>
            </div>
          </div>
        </div>
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Popular Categories Grid */}
      <section className="py-12 container mx-auto px-4 -mt-8 relative z-20">
        <h2 className="text-xl font-bold text-gray-800 mb-6 hidden md:block">
          Popular Medical Equipment
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.slice(0, 12).map((cat, idx) => (
            <div
              key={idx}
              onClick={() =>
                navigate(`/products?category=${encodeURIComponent(cat.slug || cat.name)}`)
              }
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-medical-primary transition-all cursor-pointer flex flex-col items-center text-center gap-3 group">

              {/* Category Image/Icon Container */}
              <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100 group-hover:bg-medical-light group-hover:border-medical-primary transition-all overflow-hidden">
                {cat.image ? (
                  // If image property exists, render actual image
                  <img
                    src={cat.image || undefined}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 "
                  />
                ) : (
                  // Otherwise fall back to icon
                  <div className="text-gray-400 group-hover:text-medical-primary transition-colors scale-125">
                    {cat.icon}
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-700 text-sm md:text-base group-hover:text-medical-dark">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </section>



      {/* Product Feed: Trending */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-800">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            popularProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Banner Strip */}
      <section className="bg-medical-dark py-8 px-4 text-white text-center">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
          <div className="text-lg font-bold">⚡ Limited Offer: Get Extra 5% OFF on Prepaid Orders</div>
          <div className="bg-white/20 px-4 py-1 rounded text-sm font-mono tracking-wider border border-white/30">Use Code: PREPAID5</div>
        </div>
      </section>

      {/* Product Feed: New Arrivals */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-800">New Arrivals</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Banner Strip */}
      <section className="bg-medical-dark py-8 px-4 text-white text-center">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
          <div className="text-lg font-bold">⚡ High Quality Machines</div>
          <div className="bg-white/20 px-4 py-1 rounded text-sm font-mono tracking-wider border border-white/30">From Philips, ResMed, BMC & More</div>
        </div>
      </section>

      {/* Product Feed: New Arrivals */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-800">Popular Oxygen Concentrators</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            Oxygencons.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
      {/* Banner Strip */}
      <section className="bg-medical-dark py-8 px-4 text-white text-center">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
          <div className="text-lg font-bold">⚡ Breathe Easy with Our BiPAP Machines</div>
          <div className="bg-white/20 px-4 py-1 rounded text-sm font-mono tracking-wider border border-white/30">Shop Now for Best Prices</div>
        </div>
      </section>
      {/* Popular BiPAP Machines */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-800">Popular BiPAP Machines</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            bipaps.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>



      {/* Why Choose Us */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-heading font-bold text-center text-gray-800 mb-10">Why Buy From Mohsin Surgicals?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-4 border border-gray-50 rounded-xl hover:shadow-soft transition-shadow">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Award size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Genuine Products</h3>
                <p className="text-gray-500 text-sm mt-1">We source directly from manufacturers like Philips, ResMed & BMC to ensure 100% authenticity.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border border-gray-50 rounded-xl hover:shadow-soft transition-shadow">
              <div className="bg-green-50 p-3 rounded-full text-green-600"><Truck size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Fast Dispatch</h3>
                <p className="text-gray-500 text-sm mt-1">Orders placed before 2 PM are dispatched the same day with secure packaging.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border border-gray-50 rounded-xl hover:shadow-soft transition-shadow">
              <div className="bg-purple-50 p-3 rounded-full text-purple-600"><ShieldCheck size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Biomedical Support</h3>
                <p className="text-gray-500 text-sm mt-1">Our team of engineers helps you with video installation and troubleshooting.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;