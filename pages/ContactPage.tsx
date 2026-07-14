import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_PHONE } from '../constants';

const ContactPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const firstName = (form.elements[0] as HTMLInputElement).value;
      const lastName = (form.elements[1] as HTMLInputElement).value;
      const email = (form.elements[2] as HTMLInputElement).value;
      const subject_val = (form.elements[3] as HTMLSelectElement).value;
      const message = (form.elements[4] as HTMLTextAreaElement).value;

      setIsSending(true);

      const subject = encodeURIComponent(`${subject_val}: From ${firstName} ${lastName}`);
      const body = encodeURIComponent(
        `Contact Form Submission:\n\n` +
        `Name: ${firstName} ${lastName}\n` +
        `Email: ${email}\n` +
        `Subject: ${subject_val}\n\n` +
        `Message:\n${message}`
      );

      // Simulate API delay
      setTimeout(() => {
          setIsSending(false);
          setIsSubmitted(true);
          window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-heading font-bold text-medical-text">Contact Support</h1>
            <p className="text-gray-600 mt-2">Have a question about a product or your order? We're here to help.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="bg-medical-light p-3 rounded-full text-medical-primary"><Phone size={24} /></div>
                    <div>
                        <h3 className="font-bold text-gray-800">Phone</h3>
                        <p className="text-sm text-gray-500 mb-1">Mon-Sat 10am to 10pm</p>
                        <a href={`tel:${CONTACT_PHONE}`} className="text-medical-dark font-medium hover:underline">{CONTACT_PHONE}</a>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="bg-medical-light p-3 rounded-full text-medical-primary"><Mail size={24} /></div>
                    <div>
                        <h3 className="font-bold text-gray-800">Email</h3>
                        <p className="text-sm text-gray-500 mb-1">Online Support</p>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-medical-dark font-medium hover:underline">{CONTACT_EMAIL}</a>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="bg-medical-light p-3 rounded-full text-medical-primary"><MapPin size={24} /></div>
                    <div>
                        <h3 className="font-bold text-gray-800">Main Store</h3>
                        <p className="text-sm text-gray-600">
                            5-8-107/1, Nampally Station Rd,<br/>Mahesh Nagar, Abids,<br/>Hyderabad, Telangana 500001
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {isSubmitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fadeIn">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h2>
                        <p className="text-gray-600 max-w-md mb-6">Thank you for contacting us. A member of our support team will respond to your inquiry within 24 hours.</p>
                        <button 
                            onClick={() => setIsSubmitted(false)} 
                            className="text-medical-primary font-bold hover:underline"
                        >
                            Send another message
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Send us a message</h2>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-medical-primary bg-gray-50" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-medical-primary bg-gray-50" required />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-medical-primary bg-gray-50" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-medical-primary bg-gray-50">
                                    <option>Order Status</option>
                                    <option>Product Inquiry</option>
                                    <option>Returns & Refunds</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-medical-primary bg-gray-50" placeholder="How can we help you today?" required></textarea>
                            </div>

                            <button type="submit" disabled={isSending} className="bg-medical-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-medical-dark transition-colors flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSending ? <Loader className="animate-spin" size={18} /> : <><Send size={18} /> Send Message</>}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
        
        <div className="mt-12 text-center max-w-2xl mx-auto">
            <p className="text-xs text-gray-500 italic">
                Mohsin Surgicals operates under Mohsin Enterprises under which all regulatory licenses and banking arrangements are maintained.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;