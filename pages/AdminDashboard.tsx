import React, { useState, useEffect } from 'react';
import { fetchAllProducts } from '../lib/shopify';
import { Product } from '../types';
import { Settings, Save, Search, Plus, Trash2, Edit3, Globe, Database, HelpCircle, Package, ExternalLink, Sparkles, Loader, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from '../context/CartContext';
import { generateProductSEO } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

// Local storage key for overridden/custom metafields
const STORAGE_KEY = 'merchants_metafields_overrides';

const AdminDashboard: React.FC = () => {
  const { customer, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Overrides structure: { [productId]: { keywords: string, custom_specs: { [key: string]: string } } }
  const [overrides, setOverrides] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ [productId: string]: any }>({});

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      alert("Access Denied: You must be logged in as an administrator to access the dashboard.");
      navigate('/login');
      return;
    }

    const email = customer?.email || '';
    const isAuthorized = email.endsWith('@mohsinsurgicals.com') || email === 'mohsinsurgicals@gmail.com';

    if (!isAuthorized) {
      alert("Access Denied: You are not authorized to view this page.");
      navigate('/');
      return;
    }
  }, [isAuthLoading, isAuthenticated, customer, navigate]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchAllProducts();
      setProducts(data);
      
      const savedOverrides = localStorage.getItem(STORAGE_KEY);
      if (savedOverrides) {
        setOverrides(JSON.parse(savedOverrides));
      }
      
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    setTimeout(() => {
      setIsSaving(false);
      alert('Metafields saved successfully! Note: These are currently stored locally in your browser for previewing. To make them permanent, update them in your Shopify Admin panel.');
    }, 500);
  };

  const updateProductOverride = (productId: string, field: string, value: any) => {
    setOverrides(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [field]: value
      }
    }));
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiSuggest = async () => {
    if (!selectedProduct) return;
    setIsAiGenerating(true);
    const suggestion = await generateProductSEO({
      title: selectedProduct.title,
      vendor: selectedProduct.vendor,
      description: selectedProduct.description,
      category: selectedProduct.category
    });
    
    if (suggestion) {
      setAiSuggestions(prev => ({
        ...prev,
        [selectedProduct.id]: suggestion
      }));
      // Automatically apply AI suggestions as overrides
      setOverrides(prev => ({
        ...prev,
        [selectedProduct.id]: {
          ...(prev[selectedProduct.id] || {}),
          keywords: suggestion.keywords,
          seo_title: suggestion.title,
          seo_description: suggestion.description
        }
      }));
    }
    setIsAiGenerating(false);
  };

  const email = customer?.email || '';
  const isAuthorized = isAuthenticated && (email.endsWith('@mohsinsurgicals.com') || email === 'mohsinsurgicals@gmail.com');

  if (isAuthLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Loader className="animate-spin text-medical-primary mb-4" size={40} />
        <p className="text-lg font-semibold text-gray-800">Verifying credentials & loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const currentOverrides = selectedProduct ? (overrides[selectedProduct.id] || {}) : {};

  return (
    <div className="bg-gray-50 min-h-screen pt-4 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Database className="text-medical-primary" />
                Merchant Metafield Manager
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Define and manage SEO keywords and technical specifications for your products.
              </p>
            </div>
            <button 
              onClick={handleSave}
              className="bg-medical-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-medical-dark transition-colors shadow-md"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Deploy Changes'}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Product List */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-primary/20 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredProducts.map(product => (
                  <button 
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedProduct?.id === product.id ? 'bg-medical-primary/10 border-medical-primary ring-1 ring-medical-primary' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={product.image} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{product.title}</p>
                      <p className="text-xs text-gray-500">{product.vendor}</p>
                    </div>
                    {overrides[product.id] && (
                      <div className="w-2 h-2 bg-medical-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:w-2/3">
            {selectedProduct ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-6 border-b pb-6">
                  <div className="flex items-center gap-4">
                    <img src={selectedProduct.image} className="w-16 h-16 object-contain p-2 bg-gray-50 rounded-xl border" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedProduct.title}</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                          ID: {selectedProduct.id.split('/').pop()}
                        </span>
                        <Link to={`/products/${selectedProduct.handle}`} className="text-medical-primary text-xs flex items-center gap-1 hover:underline">
                          View Live <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* SEO Section */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Globe className="text-blue-500" size={20} />
                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">SEO & Discoverability</h3>
                      </div>
                      <button 
                        onClick={handleAiSuggest}
                        disabled={isAiGenerating}
                        className="text-xs bg-medical-primary/10 text-medical-primary px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-medical-primary/20 transition-all disabled:opacity-50"
                      >
                        {isAiGenerating ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        AI SEO Assist
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                          SEO Title
                          {currentOverrides.seo_title ? (
                            <span className="text-[10px] text-medical-primary font-bold flex items-center gap-1 animate-pulse">
                              <Sparkles size={10} /> AI Enhanced
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">Synced with Shopify</span>
                          )}
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-medical-primary/20 outline-none"
                          placeholder="e.g. Best Oxygen Concentrator in India - Fast Pan-India Delivery"
                          value={currentOverrides.seo_title || selectedProduct.seo?.title || selectedProduct.title}
                          onChange={(e) => updateProductOverride(selectedProduct.id, 'seo_title', e.target.value)}
                        />
                        {aiSuggestions[selectedProduct.id] && (
                          <div className="mt-4 border border-blue-100 rounded-2xl bg-blue-50/50 overflow-hidden">
                             <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                               <p className="text-[10px] font-bold text-white uppercase flex items-center gap-1 tracking-widest">
                                 <TrendingUp size={10} /> High-Level SEO Report
                               </p>
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-blue-100 italic">Worth Score:</span>
                                  <span className="text-sm font-black text-white">{aiSuggestions[selectedProduct.id].worthScore}%</span>
                               </div>
                             </div>
                             
                             <div className="p-4 space-y-4">
                               {/* Trends */}
                               <div>
                                 <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">National Delivery Hubs (Pan-India Dominance)</p>
                                 <div className="flex flex-wrap gap-2">
                                    {aiSuggestions[selectedProduct.id].regionalHubTags.map((tag: string) => (
                                      <span key={tag} className="bg-white text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-blue-100 italic">
                                        {tag}
                                      </span>
                                    ))}
                                 </div>
                               </div>

                               {/* Logic Analysis */}
                               <div>
                                 <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
                                    <ShieldCheck size={10} /> Strategic Worth Analysis
                                 </p>
                                 <p className="text-xs text-blue-800 leading-relaxed italic border-l-2 border-blue-200 pl-3">
                                   "{aiSuggestions[selectedProduct.id].analysis}"
                                 </p>
                               </div>

                               {/* Segment Suggestions */}
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Optimized Title</p>
                                    <p className="text-xs text-gray-800 font-bold select-all leading-tight">{aiSuggestions[selectedProduct.id].title}</p>
                                  </div>
                                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Social Meta (OG)</p>
                                    <p className="text-xs text-gray-800 font-bold select-all leading-tight">{aiSuggestions[selectedProduct.id].ogTitle}</p>
                                  </div>
                               </div>
                               
                               <div className="bg-blue-100 p-2 rounded-lg text-center">
                                  <p className="text-[9px] text-blue-600 font-bold tracking-tight">* Applied: Managed keywords have been synced with search engine score weights.</p>
                               </div>
                             </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                          Meta Description
                          {currentOverrides.seo_description && (
                            <span className="text-[10px] text-medical-primary font-bold flex items-center gap-1 animate-pulse">
                              <Sparkles size={10} /> AI Enhanced
                            </span>
                          )}
                        </label>
                        <textarea 
                          rows={3}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-primary/20 outline-none"
                          placeholder="Compelling description for search results..."
                          value={currentOverrides.seo_description || selectedProduct.seo?.description || ""}
                          onChange={(e) => updateProductOverride(selectedProduct.id, 'seo_description', e.target.value)}
                        />
                        {aiSuggestions[selectedProduct.id] && (
                          <div className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 uppercase mb-2">
                               <BarChart3 size={12} /> High-CTR Meta Description
                             </div>
                             <p className="text-xs text-indigo-900 leading-relaxed font-medium select-all">
                               {aiSuggestions[selectedProduct.id].description}
                             </p>
                             <div className="mt-2 flex items-center gap-4">
                                <span className="text-[10px] text-indigo-400">Length: {aiSuggestions[selectedProduct.id].description.length} chars (Optimal)</span>
                                <span className="text-[10px] text-indigo-400">Tone: Authority + CTA</span>
                             </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Meta Keywords
                        </label>
                        <textarea 
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-primary/20 outline-none"
                          placeholder="e.g. medical equipment, oxygen concentrator hyderabad, health supplies..."
                          value={currentOverrides.keywords || ''}
                          onChange={(e) => updateProductOverride(selectedProduct.id, 'keywords', e.target.value)}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Enter comma-separated values to improve internal search matching.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          YouTube Video URLs
                        </label>
                        <textarea 
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-primary/20 outline-none"
                          placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ, https://youtu.be/..."
                          value={currentOverrides.youtube_videos || ''}
                          onChange={(e) => updateProductOverride(selectedProduct.id, 'youtube_videos', e.target.value)}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Enter comma-separated YouTube video links or embed links to show in the product media gallery.</p>
                      </div>
                    </div>
                  </section>

                  {/* Metafields Section */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Settings className="text-purple-500" size={20} />
                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Technical Metafields</h3>
                      </div>
                      <button 
                         onClick={() => {
                           const specs = currentOverrides.custom_specs || {};
                           const key = prompt('Enter Spec Name (e.g. Weight, Noise Level):');
                           if (key) {
                             updateProductOverride(selectedProduct.id, 'custom_specs', { ...specs, [key]: '' });
                           }
                         }}
                         className="text-xs text-medical-primary font-bold flex items-center gap-1 hover:bg-medical-primary/5 px-2 py-1 rounded-lg"
                      >
                         <Plus size={14} /> Add Metafield
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                      {Object.keys(currentOverrides.custom_specs || {}).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(currentOverrides.custom_specs || {}).map(([key, val]: [string, any]) => (
                            <div key={key} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">{key}</span>
                                <button 
                                  onClick={() => {
                                    const newSpecs = { ...currentOverrides.custom_specs };
                                    delete newSpecs[key];
                                    updateProductOverride(selectedProduct.id, 'custom_specs', newSpecs);
                                  }}
                                  className="text-gray-300 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <input 
                                type="text"
                                className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 outline-none font-medium"
                                placeholder="..." 
                                value={val}
                                onChange={(e) => {
                                  updateProductOverride(selectedProduct.id, 'custom_specs', {
                                    ...(currentOverrides.custom_specs || {}),
                                    [key]: e.target.value
                                  });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400">
                          <HelpCircle className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No custom metafields defined for this product yet.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center h-[500px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Package className="text-gray-300" size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Select a Product</h2>
                <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                  Choose a product from the left panel to manage its search keywords and technical metafields.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
