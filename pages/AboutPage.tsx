import React from 'react';
import { Award, Users, Globe, Heart } from 'lucide-react';
import { APP_NAME } from '../constants';
 import aboutImg from './about.png';
const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-medical-light py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-medical-text mb-4">A Legacy of Healthcare Excellence</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {APP_NAME} bridges the gap between top-tier medical technology and compassionate patient care, backed by decades of reliable service.
          </p>
        </div>
      </div>

      {/* Vision Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>

            <img
              src={aboutImg}
              alt="Medical Supplies Exhibition"
              className="rounded-2xl shadow-lg border-4 border-white"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-gray-800">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              With over three decades of trusted service, Mohsin Surgicals has grown into a leading destination for high-quality surgical equipment and medical supplies in Hyderabad. Our legacy is built on reliability, consistency, and a deep understanding of the evolving needs of healthcare providers and patients alike.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to bridge the gap between world-class medical manufacturers and those who depend on them the most. By sourcing authentic, hospital-grade products and offering them at competitive prices, we ensure that quality healthcare tools are accessible without compromise.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Driven by expertise and guided by integrity, we are committed to delivering not just products, but confidence and care. Whether serving hospitals, clinics, or individuals, we strive to empower every customer with dependable solutions that support better health outcomes and improve lives.
            </p>
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-medical-primary">
              <p className="text-sm text-gray-700 italic">
                Mohsin Surgicals operates under Mohsin Enterprises under which all regulatory licenses and banking arrangements are maintained.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-medical-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <Globe size={32} className="mx-auto text-medical-primary" />
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-sm opacity-80">Products Delivered</div>
            </div>
            <div className="space-y-2">
              <Users size={32} className="mx-auto text-medical-primary" />
              <div className="text-3xl font-bold">5000+</div>
              <div className="text-sm opacity-80">Happy Clients</div>
            </div>
            <div className="space-y-2">
              <Award size={32} className="mx-auto text-medical-primary" />
              <div className="text-3xl font-bold">30+</div>
              <div className="text-sm opacity-80">Years Offline Presence</div>
            </div>
            <div className="space-y-2">
              <Heart size={32} className="mx-auto text-medical-primary" />
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm opacity-80">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-heading font-bold text-gray-800 mb-12">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-xl text-medical-text mb-3">Authenticity</h3>
            <p className="text-gray-600">We source directly from trusted manufacturers to guarantee 100% genuine and reliable medical and surgical equipment.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-xl text-medical-text mb-3">Affordability</h3>
            <p className="text-gray-600">By eliminating unnecessary intermediaries, we provide hospital-grade quality at competitive and transparent prices.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-xl text-medical-text mb-3">Customer Focus</h3>
            <p className="text-gray-600">With 30+ years of offline experience, understanding and serving our clients' needs remains our highest priority.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;