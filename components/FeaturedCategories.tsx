import React from 'react';
import { CATEGORIES } from '../constants';

const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-16 container mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-medical-text">Shop by Category</h2>
        <p className="text-gray-500 mt-2">Find the right equipment for your needs</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat, idx) => (
          <div key={idx} className="group cursor-pointer">
            <div className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col items-center gap-4 shadow-soft transition-all duration-300 group-hover:shadow-lg group-hover:border-medical-primary/30 group-hover:-translate-y-1">
              <div className="text-gray-400 group-hover:text-medical-primary transition-colors bg-gray-50 group-hover:bg-medical-light p-4 rounded-full">
                {cat.icon}
              </div>
              <h3 className="font-medium text-gray-700 text-center text-sm group-hover:text-medical-dark leading-tight">{cat.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;