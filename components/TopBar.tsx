import React from 'react';
import { Phone, MessageCircle, Truck, FileText } from 'lucide-react';
import { CONTACT_PHONE } from '../constants';

const TopBar: React.FC = () => {
  return (
    <div className="bg-medical-dark text-white text-xs sm:text-sm py-2 px-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <a href={`tel:${CONTACT_PHONE}`} className="flex items-center gap-1 hover:text-medical-primary transition-colors">
            <Phone size={14} />
            <span>{CONTACT_PHONE}</span>
          </a>
          <a href="https://wa.me/919390349389" className="flex items-center gap-1 hover:text-green-400 transition-colors">
            <MessageCircle size={14} />
            <span>WhatsApp Support</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 hidden sm:flex">
            <Truck size={14} />
            <span>Free Delivery over ₹5000</span>
          </span>
          <span className="flex items-center gap-1">
            <FileText size={14} />
            <span>GST Billing Available</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;