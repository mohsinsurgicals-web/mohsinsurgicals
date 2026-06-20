import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, Printer, Package } from 'lucide-react';
import { Link, useNavigate } from '../context/CartContext';
import { useCart } from '../context/CartContext';

const OrderSuccessPage: React.FC = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const orderId = Math.floor(100000 + Math.random() * 900000); // Random Order ID

  useEffect(() => {
    // Clear cart on mount
    clearCart();
    
    // Confetti effect could go here
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-soft border border-gray-100 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce">
            <CheckCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-heading font-bold text-gray-800 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">Thank you for shopping with Mohsin Medicals.</p>
        
        <div className="bg-medical-light/30 rounded-lg p-4 border border-medical-primary/10 mb-8">
            <p className="text-sm text-gray-500 mb-1">Order Number</p>
            <p className="text-xl font-bold text-medical-dark tracking-wide">#{orderId}</p>
        </div>

        <div className="space-y-4 text-sm text-gray-600 mb-8 text-left bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
                <Package className="shrink-0 mt-0.5" size={16} />
                <p>We've sent a confirmation email with order details and tracking information.</p>
            </div>
            <div className="flex items-start gap-3">
                <Printer className="shrink-0 mt-0.5" size={16} />
                <p>You can print the invoice from your account dashboard once the order is shipped.</p>
            </div>
        </div>

        <div className="flex flex-col gap-3">
            <Link 
                to="/products" 
                className="w-full bg-medical-primary text-white py-3 rounded-lg font-bold hover:bg-medical-dark transition-colors flex items-center justify-center gap-2"
            >
                Continue Shopping <ArrowRight size={18} />
            </Link>
            <Link 
                to="/account" 
                className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
                View My Orders
            </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;