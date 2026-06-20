import React from 'react';
import { ArrowRight, Box } from 'lucide-react';
import { Link } from '../context/CartContext';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-medical-light overflow-hidden">
      <div className="container mx-auto px-4 py-12 lg:py-24 flex flex-col-reverse lg:flex-row items-center gap-12">
        
        {/* Text Content */}
        <div className="flex-1 space-y-6 text-center lg:text-left z-10">
          <div className="inline-block px-3 py-1 bg-white border border-medical-primary/30 rounded-full text-medical-dark text-xs font-semibold tracking-wide uppercase mb-2 shadow-sm">
            Hospital Grade • Home Comfort
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-medical-text leading-tight">
            Trusted Medical Equipment for <span className="text-medical-primary">Home & Hospitals</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
            Quality healthcare devices delivered safely to your doorstep. From oxygen concentrators to daily living aids, we support your care journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Link to="/products" className="px-8 py-4 bg-medical-primary text-white font-semibold rounded-lg shadow-lg shadow-medical-primary/30 hover:bg-medical-dark transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
              Shop Now <ArrowRight size={20} />
            </Link>
            <Link to="/bulk-orders" className="px-8 py-4 bg-white text-medical-dark border border-medical-dark/20 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <Box size={20} /> Bulk Orders
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 pt-2">
            * Free shipping on orders above ₹5000. GST Invoice available.
          </p>
        </div>

        {/* Image Content */}
        <div className="flex-1 relative">
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
             {/* Using a placeholder that looks clinical */}
             <div className="bg-gradient-to-br from-medical-primary/20 to-blue-100 w-full h-[300px] lg:h-[450px] flex items-center justify-center text-medical-dark/30 font-bold text-2xl">
                <img 
                    src="https://picsum.photos/800/600?grayscale" 
                    alt="Medical Equipment Setup" 
                    className="w-full h-full object-cover mix-blend-multiply opacity-80"
                />
             </div>
             {/* Overlay Badge */}
             <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border-l-4 border-medical-success max-w-xs hidden sm:block">
               <div className="flex items-center gap-3">
                 <div className="bg-green-100 p-2 rounded-full text-medical-success">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 </div>
                 <div>
                   <p className="font-bold text-medical-text text-sm">ISO Certified</p>
                   <p className="text-xs text-gray-500">100% Genuine Products</p>
                 </div>
               </div>
             </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-medical-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;