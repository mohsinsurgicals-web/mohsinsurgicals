import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, ArrowRight, ArrowLeft, Truck, ExternalLink } from 'lucide-react';
import { useNavigate } from '../context/CartContext';
import { APP_NAME } from '../constants';

type CheckoutStep = 'info' | 'payment';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, checkoutUrl, updateBuyerIdentity } = useCart();
  const { customer, isAuthenticated, addNewAddress } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<CheckoutStep>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  
  // Form State
  const [contactInfo, setContactInfo] = useState({
    email: customer?.email || '',
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    address: customer?.defaultAddress?.address1 || '',
    city: customer?.defaultAddress?.city || '',
    province: customer?.defaultAddress?.province || 'Telangana',
    zip: customer?.defaultAddress?.zip || '',
    phone: customer?.phone || customer?.defaultAddress?.phone || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInfo(true);
    try {
      // 1. Sync address with Shopify Cart
      await updateBuyerIdentity(contactInfo);
      
      // 2. Persist address to user's customer profile if authenticated and not already saved
      if (isAuthenticated && addNewAddress) {
        const addressExists = customer?.addresses?.some(
          addr => 
            addr.address1.toLowerCase().trim() === contactInfo.address.toLowerCase().trim() &&
            addr.city.toLowerCase().trim() === contactInfo.city.toLowerCase().trim() &&
            addr.zip.trim() === contactInfo.zip.trim()
        );
        
        if (!addressExists) {
          try {
            await addNewAddress({
              address1: contactInfo.address,
              city: contactInfo.city,
              zip: contactInfo.zip,
              country: "India",
              firstName: contactInfo.firstName,
              lastName: contactInfo.lastName,
              phone: contactInfo.phone,
              province: contactInfo.province
            });
          } catch (addrErr) {
            console.warn("Failed to persist address to Shopify customer profile:", addrErr);
          }
        }
      }
      
      setStep('payment');
      window.scrollTo(0, 0);
    } catch (error: any) {
      alert(`Failed to update shipping details: ${error.message || error}`);
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    
    if (checkoutUrl) {
        // Redirect to Real Shopify Checkout
        window.location.href = checkoutUrl;
    } else {
        alert("Checkout session not found. Please try refreshing the page.");
        setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Checkout Header */}
      <div className="bg-white border-b border-gray-200 py-4 mb-8 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-heading font-bold text-medical-primary uppercase tracking-wide hidden sm:block">{APP_NAME}</span>
                <span className="text-gray-300 text-2xl hidden sm:block">|</span>
                <span className="text-lg text-gray-800 font-medium">Checkout</span>
            </div>
            
            {/* Stepper */}
            <div className="flex items-center gap-2 md:gap-4 text-sm font-medium">
                <div className={`flex items-center gap-2 ${step === 'info' ? 'text-medical-dark' : 'text-green-600'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'info' ? 'bg-medical-dark text-white' : 'bg-green-100 text-green-600'}`}>
                        {step === 'info' ? '1' : <ArrowRight size={14}/>}
                    </div>
                    <span className="hidden sm:inline">Shipping Info</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-200"></div>
                <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-medical-dark' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-medical-dark text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    <span className="hidden sm:inline">Secure Payment</span>
                </div>
            </div>

            <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded border border-green-100">
                <Lock size={12} /> Secure
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
            
          {/* Left Column: Forms */}
          <div className="lg:w-2/3">
             {step === 'info' ? (
                /* ================= STEP 1: INFORMATION ================= */
                <form id="info-form" onSubmit={handleInfoSubmit} className="animate-fadeIn">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Truck className="text-blue-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm text-blue-800 font-semibold">Enter your shipping details.</p>
                            <p className="text-xs text-blue-600">This information will be passed to our secure payment partner.</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h2>
                        {!isAuthenticated && (
                            <div className="bg-gray-50 text-gray-600 p-3 rounded-lg text-sm mb-4 flex justify-between items-center">
                                <span>Already have an account?</span>
                                <button type="button" onClick={() => navigate('/login')} className="font-bold underline text-medical-primary">Log in</button>
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    required 
                                    value={contactInfo.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" 
                                    placeholder="your@email.com" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Shipping Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                                <input type="text" name="firstName" required value={contactInfo.firstName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                                <input type="text" name="lastName" required value={contactInfo.lastName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                                <input type="text" name="address" required value={contactInfo.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" placeholder="Street address, P.O. box, etc." />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                                <input type="text" name="city" required value={contactInfo.city} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">State / Province</label>
                                <select 
                                    name="province" 
                                    required 
                                    value={contactInfo.province} 
                                    onChange={(e) => setContactInfo(prev => ({ ...prev, province: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50 text-sm"
                                >
                                    {INDIAN_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">PIN Code</label>
                                <input type="text" name="zip" required value={contactInfo.zip} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                                <input type="tel" name="phone" required value={contactInfo.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" placeholder="+91" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <button type="button" onClick={() => navigate('/cart')} className="flex items-center gap-2 text-medical-primary font-medium hover:underline">
                            <ArrowLeft size={16} /> Return to Cart
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmittingInfo}
                            className="bg-medical-dark text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-medical-dark/20 hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isSubmittingInfo ? 'Saving Shipping Info...' : 'Review Order'} 
                            {!isSubmittingInfo && <ArrowRight size={18} />}
                        </button>
                    </div>
                </form>
             ) : (
                /* ================= STEP 2: REDIRECT TO SHOPIFY ================= */
                <div className="animate-fadeIn">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6 text-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Pay?</h2>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">
                            You will be redirected to Shopify's secure checkout page to complete your purchase using Credit Card, UPI, or Net Banking.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto mb-8 border border-gray-200">
                             <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500">Shipping to:</span>
                                <button type="button" onClick={() => setStep('info')} className="text-medical-primary font-bold text-xs hover:underline">Edit</button>
                             </div>
                             <p className="font-bold text-gray-800">{contactInfo.firstName} {contactInfo.lastName}</p>
                             <p className="text-gray-600 text-sm">{contactInfo.address}, {contactInfo.city}, {contactInfo.province} - {contactInfo.zip}</p>
                             <p className="text-gray-600 text-sm mt-1">{contactInfo.email}</p>
                        </div>

                        <button 
                            onClick={handleProceedToPayment} 
                            disabled={isProcessing}
                            className="bg-medical-success text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-600 transition-all flex items-center justify-center gap-3 w-full max-w-md mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Redirecting...' : `Proceed to Secure Payment`} 
                            {!isProcessing && <ExternalLink size={20} />}
                        </button>
                        
                        <p className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
                            <Lock size={10} /> 256-bit SSL Encrypted Transaction
                        </p>
                    </div>

                    <div className="text-center">
                        <button type="button" onClick={() => setStep('info')} className="text-gray-500 font-medium hover:text-gray-800 flex items-center justify-center gap-2 mx-auto">
                            <ArrowLeft size={16} /> Back to Shipping Info
                        </button>
                    </div>
                </div>
             )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-1/3">
             <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 sticky top-24">
                <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6">
                    {cart.map(item => (
                        <div key={item.lineItemId} className="flex gap-4">
                            <div className="relative w-16 h-16 bg-white rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <img src={item.image || undefined} alt={item.title} className="max-w-full max-h-full p-1" />
                                <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">{item.quantity}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{item.title}</h4>
                                <p className="text-xs text-gray-500">{item.specs}</p>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                                ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-300 pt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-xs text-gray-500">Calculated at next step</span>
                    </div>
                </div>

                <div className="border-t border-gray-300 pt-4 mt-4 flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-800">Total</span>
                    <span className="font-bold text-xl text-gray-900">₹{cartTotal.toLocaleString()}</span>
                </div>
                
                <div className="mt-6 bg-white p-3 rounded border border-gray-200 flex items-center gap-3">
                    <Truck size={20} className="text-medical-primary" />
                    <p className="text-xs text-gray-500 leading-tight">
                        <span className="font-bold text-gray-800">Fast Delivery:</span> All orders are processed within 24 hours.
                    </p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;