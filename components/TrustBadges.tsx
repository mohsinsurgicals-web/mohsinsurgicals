import React from 'react';
import { ShieldCheck, Truck, Clock, Award } from 'lucide-react';

const badges = [
  { icon: <Award size={32} />, title: "ISO Certified", desc: "100% Genuine Devices" },
  { icon: <ShieldCheck size={32} />, title: "Doctor Recommended", desc: "Trusted by Professionals" },
  { icon: <Truck size={32} />, title: "Fast Delivery", desc: "Secure Shipping India-wide" },
  { icon: <Clock size={32} />, title: "24/7 Support", desc: "Expert Assistance Available" },
];

const TrustBadges: React.FC = () => {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-4 rounded-lg hover:bg-medical-light/50 transition-colors">
              <div className="text-medical-primary bg-medical-light p-3 rounded-full">
                {badge.icon}
              </div>
              <div>
                <h3 className="font-heading font-semibold text-medical-text">{badge.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;