import React from 'react';
import { CheckCircle, FileText, Calendar, ChevronRight } from 'lucide-react';
import { BLOG_POSTS } from '../constants';

export const BulkSupplySection: React.FC = () => {
  return (
    <section className="py-16 bg-medical-dark text-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/20">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-heading font-bold">Supplying Hospitals, Clinics & NGOs?</h2>
            <p className="text-blue-50 text-lg">Get access to wholesale pricing, priority support, and GST invoicing for bulk orders.</p>
            <div className="flex flex-wrap gap-4 pt-2 text-sm">
                <div className="flex items-center gap-2"><CheckCircle size={16} className="text-medical-primary" /> Wholesale Pricing</div>
                <div className="flex items-center gap-2"><CheckCircle size={16} className="text-medical-primary" /> Dedicated Account Manager</div>
                <div className="flex items-center gap-2"><CheckCircle size={16} className="text-medical-primary" /> Fast Dispatch</div>
            </div>
          </div>
          <button className="bg-white text-medical-dark px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors whitespace-nowrap shadow-lg">
            Request Quote
          </button>
        </div>
      </div>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 p-12 opacity-10 transform rotate-12">
        <FileText size={400} />
      </div>
    </section>
  );
};

export const BlogSection: React.FC = () => {
  return (
    <section className="py-16 container mx-auto px-4">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-medical-text">Healthcare Buying Guides</h2>
        <a href="#" className="text-sm text-medical-primary hover:underline">View Blog</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post, idx) => (
          <div key={idx} className="group cursor-pointer">
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                 <img src={`https://picsum.photos/seed/${idx + 50}/600/400`} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Calendar size={12} /> {post.date}
                </div>
                <h3 className="font-heading font-semibold text-lg text-gray-800 mb-2 group-hover:text-medical-primary transition-colors">{post.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                <div className="text-medical-primary text-sm font-medium flex items-center gap-1">Read Guide <ChevronRight size={14} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};