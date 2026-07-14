import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from '../context/CartContext';
import { LogOut, Package, User, ShoppingBag, Loader, ArrowRight, MapPin, Plus, Trash2, X } from 'lucide-react';
import { Address } from '../types';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

const AccountPage: React.FC = () => {
  const { customer, logout, isAuthenticated, isLoading, addNewAddress, removeAddress } = useAuth();
  const navigate = useNavigate();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
      firstName: '', lastName: '', address1: '', city: '', province: 'Telangana', zip: '', country: 'India', phone: ''
  });

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleAddAddress = async (e: React.FormEvent) => {
      e.preventDefault();
      await addNewAddress(newAddress);
      setShowAddAddress(false);
      setNewAddress({ firstName: '', lastName: '', address1: '', city: '', zip: '', country: 'India', phone: '' });
  };

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-medical-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-800">My Account</h1>
                <p className="text-gray-500">Welcome back, {customer.firstName}!</p>
            </div>
            <button 
                onClick={logout}
                className="flex items-center gap-2 text-red-500 border border-red-200 bg-white px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
            >
                <LogOut size={16} /> Logout
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile & Addresses */}
            <div className="lg:col-span-1 space-y-8">
                {/* Profile Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-medical-light p-3 rounded-full text-medical-primary">
                            <User size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Profile Details</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <span className="text-xs text-gray-400 uppercase tracking-wide">Name</span>
                            <p className="font-medium text-gray-800">{customer.firstName} {customer.lastName}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 uppercase tracking-wide">Email</span>
                            <p className="font-medium text-gray-800 break-all">{customer.email}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 uppercase tracking-wide">Phone</span>
                            <p className="font-medium text-gray-800">{customer.phone || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                {/* Address Book */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-medical-light p-3 rounded-full text-medical-primary">
                                <MapPin size={24} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Addresses</h2>
                        </div>
                        <button onClick={() => setShowAddAddress(true)} className="text-medical-primary hover:bg-medical-light p-2 rounded-full"><Plus size={20} /></button>
                    </div>

                    {showAddAddress ? (
                        <form onSubmit={handleAddAddress} className="space-y-3 bg-gray-50 p-4 rounded-lg animate-fadeIn">
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-sm">New Address</h3>
                                <button type="button" onClick={() => setShowAddAddress(false)}><X size={16} className="text-gray-400"/></button>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <input placeholder="First Name" required className="p-2 border rounded text-sm w-full" value={newAddress.firstName} onChange={e => setNewAddress({...newAddress, firstName: e.target.value})} />
                                <input placeholder="Last Name" required className="p-2 border rounded text-sm w-full" value={newAddress.lastName} onChange={e => setNewAddress({...newAddress, lastName: e.target.value})} />
                             </div>
                             <input placeholder="Address Line 1" required className="p-2 border rounded text-sm w-full" value={newAddress.address1} onChange={e => setNewAddress({...newAddress, address1: e.target.value})} />
                             <div className="grid grid-cols-2 gap-2">
                                <input placeholder="City" required className="p-2 border rounded text-sm w-full" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                <select 
                                    required 
                                    className="p-2 border border-gray-200 rounded text-sm w-full bg-white text-gray-700 focus:outline-none focus:border-medical-primary" 
                                    value={newAddress.province} 
                                    onChange={e => setNewAddress({...newAddress, province: e.target.value})}
                                >
                                    {INDIAN_STATES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                             </div>
                             <input placeholder="ZIP / Pin Code" required className="p-2 border rounded text-sm w-full" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                             <button type="submit" className="w-full bg-medical-dark text-white py-2 rounded text-sm font-bold">Save Address</button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {customer.addresses && customer.addresses.length > 0 ? customer.addresses.map(addr => (
                                <div key={addr.id} className="border border-gray-100 rounded p-3 relative group">
                                    <p className="font-bold text-sm text-gray-800">{addr.firstName} {addr.lastName}</p>
                                    <p className="text-sm text-gray-600">{addr.address1}</p>
                                    <p className="text-sm text-gray-600">{addr.city}, {addr.province ? `${addr.province}, ` : ''}{addr.zip}</p>
                                    <p className="text-sm text-gray-600">{addr.country}</p>
                                    <button 
                                        onClick={() => removeAddress(addr.id)}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )) : <p className="text-sm text-gray-400 italic">No addresses saved.</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Order History */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-medical-light p-3 rounded-full text-medical-primary">
                            <Package size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Order History</h2>
                    </div>

                    {customer.orders && customer.orders.length > 0 ? (
                        <div className="space-y-4">
                            {customer.orders.map((order) => (
                                <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:border-medical-primary/50 transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 pb-4 border-b border-gray-50">
                                        <div>
                                            <span className="text-xs text-gray-400 font-bold uppercase">Order</span>
                                            <p className="font-bold text-medical-dark">#{order.orderNumber}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 font-bold uppercase">Date</span>
                                            <p className="text-sm text-gray-700">{new Date(order.processedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 font-bold uppercase">Total</span>
                                            <p className="font-bold text-gray-800">₹{parseFloat(order.totalPrice.amount).toLocaleString()}</p>
                                        </div>
                                        <div>
                                             <a href={order.statusUrl || '#'} className="text-sm text-medical-primary hover:underline font-medium">
                                                 View Status
                                             </a>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {order.lineItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{item.title}</span>
                                                <span className="text-gray-400">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center">
                            <ShoppingBag size={48} className="text-gray-200 mb-4" />
                            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                            <Link to="/products" className="bg-medical-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-medical-dark transition-colors flex items-center gap-2">
                                Start Shopping <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;