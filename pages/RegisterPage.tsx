import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from '../context/CartContext';
import { Mail, Lock, User, Loader, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { APP_NAME } from '../constants';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✅ added
  const [error, setError] = useState('');
  const { register, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/account');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, firstName, lastName);
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-medical-light/30 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-heading font-bold text-medical-text">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join {APP_NAME} for faster checkouts</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            required 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50 transition-colors"
                            placeholder="John"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            required 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50 transition-colors"
                            placeholder="Doe"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50 transition-colors"
                        placeholder="john@example.com"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input 
                        type={showPassword ? "text" : "password"}
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50 transition-colors"
                        placeholder="Minimum 6 characters"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-medical-primary text-white font-bold py-3 rounded-lg hover:bg-medical-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-medical-primary/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader className="animate-spin" size={20} /> : 'Create Account'}
            </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-medical-primary font-bold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
