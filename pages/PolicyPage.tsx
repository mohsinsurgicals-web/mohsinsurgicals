import React from 'react';
import { useSearchParams } from '../context/CartContext';

const PolicyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'privacy';

  const renderContent = () => {
    switch (type) {
      case 'terms':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="mb-4">Welcome to Mohsin Surgicals. By accessing our website, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
            <h3 className="text-xl font-bold mt-6 mb-3">1. Use License</h3>
            <p className="mb-4">Permission is granted to temporarily download one copy of the materials (information or software) on Mohsin Surgicals website for personal, non-commercial transitory viewing only.</p>
            <h3 className="text-xl font-bold mt-6 mb-3">2. Disclaimer</h3>
            <p className="mb-4">The materials on Mohsin Surgicals website are provided on an 'as is' basis. Mohsin Surgicals makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </>
        );
      case 'returns':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Return & Refund Policy</h1>
            <p className="mb-4">We want you to be completely satisfied with your purchase. If you are not satisfied with your purchase, you may return it within 7 days of the delivery date.</p>
            <h3 className="text-xl font-bold mt-6 mb-3">Eligibility</h3>
            <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>To be eligible for a return, your item must be unused and in the same condition that you received it.</li>
                <li>It must also be in the original packaging.</li>
                <li>Hygiene products (like masks, cannula) cannot be returned if opened.</li>
            </ul>
            <h3 className="text-xl font-bold mt-6 mb-3">Refunds</h3>
            <p className="mb-4">Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.</p>
          </>
        );
      default: // Privacy
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4">Your privacy is important to us. It is Mohsin Surgicals's policy to respect your privacy regarding any information we may collect from you across our website.</p>
            <h3 className="text-xl font-bold mt-6 mb-3">Information We Collect</h3>
            <p className="mb-4">We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
            <h3 className="text-xl font-bold mt-6 mb-3">How We Use Information</h3>
            <p className="mb-4">We use your information to process orders, improve our products, and send you promotional emails if you have opted in. We do not share your personal identifying information with third-parties, except when required by law.</p>
          </>
        );
    }
  };

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="sticky top-24 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Legal Info</h3>
                <ul className="space-y-3">
                    <li><a href="?type=privacy" className={`block hover:text-medical-primary ${type === 'privacy' ? 'text-medical-primary font-medium' : 'text-gray-600'}`}>Privacy Policy</a></li>
                    <li><a href="?type=terms" className={`block hover:text-medical-primary ${type === 'terms' ? 'text-medical-primary font-medium' : 'text-gray-600'}`}>Terms of Service</a></li>
                    <li><a href="?type=returns" className={`block hover:text-medical-primary ${type === 'returns' ? 'text-medical-primary font-medium' : 'text-gray-600'}`}>Returns & Refunds</a></li>
                </ul>
            </div>
          </div>
          
          {/* Content */}
          <div className="md:w-3/4 text-gray-700 leading-relaxed">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;