import React from 'react';
import { BrowserRouter as Router, Routes, Route } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import BulkOrderPage from './pages/BulkOrderPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PolicyPage from './pages/PolicyPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ThankYouPage from './pages/ThankYouPage';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ReviewsProvider } from './context/ReviewsContext';

// Integrated AI + WhatsApp Support component
import SupportCenter from './components/SupportCenter';

const ScrollToTopOnMount = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <ReviewsProvider>
        <CartProvider>
          <Router>
            <ScrollToTopOnMount />
            <div className="min-h-screen font-sans text-gray-800 bg-white flex flex-col relative">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/bulk-orders" element={<BulkOrderPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/policy" element={<PolicyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/thank-you" element={<ThankYouPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
            
            {/* Unified Support Experience */}
            <SupportCenter />
            
          </div>
        </Router>
      </CartProvider>
    </ReviewsProvider>
  </AuthProvider>
  );
}

export default App;