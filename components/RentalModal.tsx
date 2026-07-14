import React, { useState } from 'react';
import { X, Send, Calendar, Clock, User, Phone, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { CONTACT_EMAIL } from '../constants';

interface RentalModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const RentalModal: React.FC<RentalModalProps> = ({ product, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    duration: '1 month',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Construct mailto link as a fallback/simple notification method
    const subject = encodeURIComponent(`Rental Inquiry: ${product.title}`);
    const body = encodeURIComponent(
      `Rental Inquiry Details:\n\n` +
      `Product: ${product.title}\n` +
      `Price: ₹${product.price}\n\n` +
      `Customer Name: ${formData.name}\n` +
      `Phone: ${formData.phone}\n` +
      `Email: ${formData.email}\n` +
      `Requested Duration: ${formData.duration}\n` +
      `Message: ${formData.message}`
    );

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Open mailto link
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      
      // Close after a delay if success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ name: '', phone: '', email: '', duration: '1 month', message: '' });
      }, 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-medical-primary p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar size={24} /> Rental Inquiry
            </h2>
            <p className="text-blue-100 text-sm mt-1">Request a rental quote for {product.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Request Sent!</h3>
              <p className="text-gray-600 mb-6">We've received your rental inquiry. Our team will contact you shortly.</p>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-medical-primary text-white font-bold rounded-xl hover:bg-medical-dark transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <User size={12} /> Full Name
                  </label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-medical-primary transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Phone size={12} /> Phone Number
                  </label>
                  <input 
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-medical-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-medical-primary transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Clock size={12} /> Rental Duration
                </label>
                <select 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-medical-primary transition-all text-sm appearance-none"
                >
                  <option value="1 week">1 Week</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="1 month">1 Month</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months+">6 Months+</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <MessageSquare size={12} /> Additional Message
                </label>
                <textarea 
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Any specific requirements?"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-medical-primary transition-all text-sm resize-none"
                ></textarea>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-medical-primary text-white font-bold rounded-xl shadow-lg hover:bg-medical-dark transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={18} /> Send Rental Inquiry
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-3">
                  By submitting, you agree to be contacted by Mohsin Surgicals regarding your rental request.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalModal;
