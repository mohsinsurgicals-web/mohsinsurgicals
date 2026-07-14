import React, { useEffect, useState } from 'react';
import { CheckCircle, Heart, Phone, ArrowRight, ShoppingBag, Star, Shield, Truck } from 'lucide-react';
import { CONTACT_PHONE } from '../constants';
import { Link } from '../context/CartContext';

const ThankYouPage: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; delay: number; size: number }[]>([]);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setVisible(true), 100);

    // Generate confetti particles
    const colors = ['#008080', '#28A745', '#E0F7FA', '#005f5f', '#F0FFFF', '#00BFA5'];
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      size: Math.random() * 8 + 6,
    }));
    setConfetti(particles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light via-white to-medical-accent flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-medical-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-medical-success/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Confetti */}
      {confetti.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-full animate-bounce pointer-events-none opacity-70"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${2 + p.delay}s`,
          }}
        />
      ))}

      {/* Main card */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl border border-medical-primary/10 max-w-lg w-full overflow-hidden transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Top teal banner */}
        <div className="bg-gradient-to-r from-medical-primary to-medical-dark px-8 pt-10 pb-16 text-center relative">
          {/* Decorative circles */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg viewBox="0 0 500 50" preserveAspectRatio="none" className="w-full h-10">
              <path d="M0,50 C150,0 350,0 500,50 L500,50 L0,50 Z" fill="white" />
            </svg>
          </div>

          {/* Bouncing check icon */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white/30 animate-[bounce_2s_ease-in-out_infinite]">
            <CheckCircle className="text-medical-primary" size={50} strokeWidth={2} />
          </div>

          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2 drop-shadow">
            Thank You! 🎉
          </h1>
          <p className="text-medical-light/90 text-sm font-medium">
            Your message has been received
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-8 -mt-2">
          {/* Appreciation message */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-base leading-relaxed">
              We truly appreciate you reaching out to{' '}
              <span className="font-semibold text-medical-primary">Mohsin Surgicals</span>.
              Our team will get back to you within{' '}
              <span className="font-semibold text-medical-dark">24 hours</span>.
            </p>
          </div>

          {/* Promise badges */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: <Shield size={20} />, label: 'Quality Assured' },
              { icon: <Truck size={20} />, label: 'Fast Delivery' },
              { icon: <Star size={20} />, label: 'Expert Support' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 bg-medical-light/40 rounded-xl p-3 border border-medical-primary/10 text-center"
              >
                <span className="text-medical-primary">{icon}</span>
                <span className="text-xs font-semibold text-medical-dark">{label}</span>
              </div>
            ))}
          </div>

          {/* Contact card */}
          <div className="bg-gradient-to-r from-medical-primary/5 to-medical-dark/5 rounded-2xl p-5 border border-medical-primary/15 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-medical-primary rounded-full flex items-center justify-center shrink-0 shadow-md">
              <Phone size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Need urgent help? Call us directly</p>
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
                className="text-medical-primary font-bold text-lg hover:text-medical-dark transition-colors"
              >
                {CONTACT_PHONE}
              </a>
            </div>
          </div>

          {/* Heart note */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
            <Heart size={14} className="text-red-400 fill-red-400" />
            <span>Your health is our priority</span>
            <Heart size={14} className="text-red-400 fill-red-400" />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/products"
              className="w-full bg-medical-primary text-white py-3.5 rounded-xl font-bold hover:bg-medical-dark transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <ShoppingBag size={18} />
              Browse Our Products
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/"
              className="w-full bg-white border-2 border-medical-primary/30 text-medical-primary py-3.5 rounded-xl font-semibold hover:bg-medical-light/50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Tagline below card */}
      <p className="mt-6 text-medical-dark/60 text-sm font-medium text-center">
        Mohsin Surgicals — Trusted Medical Equipment since years
      </p>
    </div>
  );
};

export default ThankYouPage;
