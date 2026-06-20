import React, { useState, useEffect } from 'react';
import { Star, Quote, Loader } from 'lucide-react';
import { TESTIMONIALS as fallbackTestimonials } from '../constants';
import { Testimonial } from '../types';

const PANTRY_ID = '1094fe7c-cc51-4d37-8342-d7a2f54dafe9';

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const res = await fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/testimonials`);
        if (res.status === 404) {
          // Initialize basket
          await fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/testimonials`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ testimonials: fallbackTestimonials })
          });
          setTestimonials(fallbackTestimonials);
        } else if (!res.ok) {
          throw new Error("Pantry error");
        } else {
          const data = await res.json();
          setTestimonials(data.testimonials || fallbackTestimonials);
        }
      } catch (e) {
        console.error("Failed to load testimonials, using fallback:", e);
        setTestimonials(fallbackTestimonials);
      } finally {
        setIsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  return (
    <section className="py-16 bg-blue-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-medical-text">Trusted by Caregivers</h2>
          <p className="text-gray-500 mt-2">See what our customers have to say</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[100px]">
            <Loader className="animate-spin text-medical-primary" size={24} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white p-8 rounded-xl shadow-soft relative border border-gray-100">
                <Quote className="absolute top-6 right-6 text-medical-primary/20" size={40} />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={`${i < t.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6 text-sm leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-medical-light rounded-full flex items-center justify-center font-bold text-medical-primary">
                      {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-medical-text text-sm">{t.name}</h4>
                    <span className="text-xs text-medical-primary font-medium uppercase tracking-wide">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;