import React, { useState } from 'react';
import { FileText, Send, Building, CheckCircle, Loader, UploadCloud, Trash2 } from 'lucide-react';
import { Link } from '../context/CartContext';
import { CONTACT_PHONE, CONTACT_EMAIL } from '../constants';

const BulkOrderPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string; size: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit. Please choose a smaller file.");
      e.target.value = '';
      return;
    }

    // Validate type (PDF, doc, docx, xls, xlsx, images)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only PDF, Word, Excel, and Images (JPEG, PNG) are allowed.");
      e.target.value = '';
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setAttachedFile({
      name: file.name,
      size: `${sizeInMB} MB`
    });
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    const fileInput = document.getElementById('rfp-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const org = formData.get('org') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;
      const details = formData.get('details') as string;

      setIsSending(true);

      const subject = encodeURIComponent(`Bulk Order Inquiry: ${org}`);
      let fileAttachmentNotice = '';
      if (attachedFile) {
        fileAttachmentNotice = `[Attached Document: ${attachedFile.name} (${attachedFile.size}) - PLEASE REMEMBER TO MANUALLY ATTACH THIS FILE TO YOUR EMAIL INBOX BEFORE SENDING]\n\n`;
      }

      const body = encodeURIComponent(
        `Bulk Order Inquiry Details:\n\n` +
        `Name: ${name}\n` +
        `Organization: ${org}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n\n` +
        fileAttachmentNotice +
        `Requirements:\n${details}`
      );

      // Simulate API delay
      setTimeout(() => {
          setIsSending(false);
          setIsSubmitted(true);
          window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
          if (attachedFile) {
            alert(`Drafted email query for ${org}.\n\nIMPORTANT: Since the enquiry opens in your local mail client, please remember to manually attach your file: "${attachedFile.name}" before sending.`);
          }
      }, 1000);
  };

  return (
    <div className="bg-medical-light/30 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[500px]">
            
          {/* Info Side */}
          <div className="bg-medical-dark text-white p-8 md:w-1/3 flex flex-col justify-between">
            <div>
                <Building className="mb-4 text-medical-primary" size={48} />
                <h1 className="text-3xl font-heading font-bold mb-4">Institutional Sales</h1>
                <p className="text-blue-100 mb-6">
                    Partner with us for hospital projects, clinic setups, and bulk procurement. We offer special B2B pricing and credit terms.
                </p>
                <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2 opacity-90"><div className="w-1.5 h-1.5 bg-medical-primary rounded-full"></div> GST Invoicing</li>
                    <li className="flex items-center gap-2 opacity-90"><div className="w-1.5 h-1.5 bg-medical-primary rounded-full"></div> Priority Shipping</li>
                    <li className="flex items-center gap-2 opacity-90"><div className="w-1.5 h-1.5 bg-medical-primary rounded-full"></div> Installation Support</li>
                </ul>
            </div>
            <div className="mt-8 text-sm opacity-75">
                Questions? Call {CONTACT_PHONE}
            </div>
          </div>

          {/* Form Side */}
          <div className="p-8 md:w-2/3 relative">
            {isSubmitted ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 animate-fadeIn bg-white">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Quote Request Received!</h2>
                    <p className="text-gray-600 mb-6">We have received your bulk order inquiry. Our institutional sales manager will contact you at the provided number within 24 hours.</p>
                    <Link to="/" className="text-medical-primary font-bold hover:underline">Return to Home</Link>
                </div>
            ) : (
                <>
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Request a Quote</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                                <input type="text" name="name" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" placeholder="Dr. John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Organization Name</label>
                                <input type="text" name="org" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" placeholder="City Hospital" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                                <input type="email" name="email" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" placeholder="admin@hospital.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                                <input type="tel" name="phone" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50" placeholder="+91 98765 43210" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Requirement Details</label>
                            <textarea name="details" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-medical-primary focus:outline-none bg-gray-50 h-32" placeholder="List products and estimated quantities..."></textarea>
                        </div>

                        {/* File Upload Field */}
                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Upload RFP / Equipment List (Optional)</label>
                            {!attachedFile ? (
                                <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100/50 hover:border-medical-primary transition-all cursor-pointer">
                                    <input 
                                        id="rfp-file-input"
                                        type="file" 
                                        name="rfpFile"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    />
                                    <UploadCloud className="text-gray-400 mb-2" size={28} />
                                    <p className="text-xs font-semibold text-gray-600">Drag & drop or click to upload</p>
                                    <p className="text-[10px] text-gray-400 mt-1">PDF, Word, Excel, or images (Max 10MB)</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-medical-light/20 border border-medical-primary/20 rounded-lg animate-fadeIn">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg text-medical-primary shadow-sm border border-medical-primary/10">
                                            <FileText size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-800 truncate">{attachedFile.name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{attachedFile.size}</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleRemoveFile} 
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={isSending} className="bg-medical-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-medical-dark transition-colors w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                             {isSending ? <Loader className="animate-spin" size={18} /> : <><Send size={18} /> Submit Enquiry</>}
                        </button>
                    </form>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderPage;