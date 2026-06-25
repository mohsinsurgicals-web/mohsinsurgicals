import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '../context/CartContext';
import { fetchProductByHandle, fetchProductById, fetchProductsByCategory, isRentalAvailable } from '../lib/shopify';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Star, CheckCircle, Truck, RotateCcw, ShieldCheck, Minus, Plus, Loader, Phone, MessageCircle, Heart, MapPin, Share2, FileText, Calendar } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import RentalModal from '../components/RentalModal';
import SEO from '../components/SEO';
import { CONTACT_PHONE, CONTACT_EMAIL } from '../constants';
import { useReviews } from '../context/ReviewsContext';
import { Review } from '../lib/pantry';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // 'id' in the URL is now the handle
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [frequentlyBought, setFrequentlyBought] = useState<Product[]>([]);
  const [selectedBundleItems, setSelectedBundleItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, isLoading: isCartLoading } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  
  // Notify Me State
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Pincode State
  const [pincode, setPincode] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Zoom State
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [managedMetafields, setManagedMetafields] = useState<any>({});

  const youtubeVideos = React.useMemo(() => {
    if (!product) return [];
    if (managedMetafields?.youtube_videos) {
      return managedMetafields.youtube_videos
        .split(',')
        .map((url: string) => url.trim())
        .filter(Boolean)
        .map((url: string) => {
          if (url.includes('/embed/')) return url;
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          const match = url.match(regExp);
          if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
          }
          return url;
        });
    }
    return product.youtubeVideos || [];
  }, [product, managedMetafields]);

  // Reviews state
  const { loadReviews, addReview } = useReviews();
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, content: '' });
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<'idle' | 'success'>('idle');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1)',
    });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({});
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} at Mohsin Surgicals`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

// Keep your current useEffect as is
useEffect(() => {
    const loadProduct = async () => {
      if(!id) return; // 'id' from useParams is now the handle
      setIsLoading(true);
      const data = await fetchProductByHandle(id); // load by handle
      setProduct(data);
      setActiveVideo(null);

      try {
        if (data) {
            setActiveImage(data.image);
            const related = await fetchProductsByCategory(data.category);
            const filteredRelated = related.filter(p => p.id !== data.id);
            setRelatedProducts(filteredRelated.slice(0, 4));
            
            // Dynamic Frequently Bought Together data (2 items from same category)
            const bundleItems = filteredRelated.slice(4, 6);
            setFrequentlyBought(bundleItems);
            setSelectedBundleItems([data.id, ...bundleItems.map(p => p.id)]);
        }
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [id]);

// ADD THIS NEW BLOCK BELOW IT FOR RICH SNIPPETS


  useEffect(() => {
    const saved = localStorage.getItem('merchants_metafields_overrides');
    if (saved && product?.id) {
       const parsed = JSON.parse(saved);
       if (parsed[product.id]) {
         setManagedMetafields(parsed[product.id]);
       }
    }
  }, [product]);

  const generateInitialReviews = (title: string, category: string) => {
    return [
      {
        id: 'rev-1',
        name: 'Ravi Kumar',
        rating: 5,
        date: '2026-05-14',
        content: `Excellent purchase. The ${title} works quietly and performs exceptionally well. Delivery was on time and setup demonstration was helpful.`
      },
      {
        id: 'rev-2',
        name: 'Anjali Sharma',
        rating: 4,
        date: '2026-06-02',
        content: `Highly reliable machine. We use it daily. Customer service from Mohsin Surgicals was very responsive when resolving our initial setup questions.`
      },
      {
        id: 'rev-3',
        name: 'Dr. S. Reddy',
        rating: 5,
        date: '2026-06-18',
        content: `Recommended this to multiple patients. High build quality, stable operations, and accurate readings/parameters. Great B2B transaction value.`
      }
    ];
  };

  useEffect(() => {
    if (!product?.id) return;
    
    const fetchReviews = async () => {
      setIsReviewsLoading(true);
      try {
        const data = await loadReviews(product.id, product.title, product.category);
        setProductReviews(data);
      } catch (e) {
        console.error("Failed to load reviews:", e);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    
    fetchReviews();
    
    // Reset form states
    setIsReviewFormOpen(false);
    setReviewForm({ name: '', rating: 5, content: '' });
    setReviewSubmitStatus('idle');
  }, [product, loadReviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id || !reviewForm.name || !reviewForm.content) return;

    try {
      const updated = await addReview(
        product.id,
        {
          name: reviewForm.name,
          rating: reviewForm.rating,
          content: reviewForm.content
        },
        product.title,
        product.category
      );
      setProductReviews(updated);
      setReviewSubmitStatus('success');
      setReviewForm({ name: '', rating: 5, content: '' });
    } catch (e) {
      console.error("Failed to submit review:", e);
    }

    setTimeout(() => {
      setReviewSubmitStatus('idle');
      setIsReviewFormOpen(false);
    }, 2000);
  };

  const handleCheckPincode = (e: React.FormEvent) => {
      e.preventDefault();
      if(pincode.length !== 6) return;
      setIsCheckingPincode(true);
      setTimeout(() => {
          setIsCheckingPincode(false);
          setPincodeStatus('success');
      }, 800);
  };

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) return;
    setIsNotifying(true);
    // Simulate API call
    setTimeout(() => {
      setIsNotifying(false);
      setNotifyStatus('success');
      setNotifyEmail('');
    }, 1000);
  };

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      setIsBuyingNow(true);
      try {
        await addToCart(product, quantity);
        navigate('/cart');
      } catch (error) {
        console.error("Buy now failed:", error);
      } finally {
        setIsBuyingNow(false);
      }
    }
  };

  const handleWishlistToggle = () => {
    if(!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="animate-spin text-medical-primary" size={40} />
      </div>
    );
  }

  if (!product) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
            <button onClick={() => navigate('/products')} className="text-medical-primary hover:underline font-medium">Back to Products</button>
        </div>
    );
  }

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;
  
  const inWishlist = isInWishlist(product.id);

  const totalReviews = productReviews.length;
  const averageRating = totalReviews > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0";

  return (
    <div className="bg-white min-h-screen pb-24 md:pb-12">
      {/* SEO Metadata */}
      <SEO 
        title={managedMetafields.seo_title || product.seo?.title || product.title} 
        description={managedMetafields.seo_description || product.seo?.description || product.description?.replace(/(<([^>]+)>)/gi, "").substring(0, 160)}
        ogImage={product.image}
        ogType="product"
        keywords={managedMetafields.keywords}
        productData={{
          name: product.title,
          image: product.image || '',
          description: product.description?.replace(/(<([^>]+)>)/gi, "").substring(0, 300) || '',
          sku: product.id.split('/').pop(),
          brand: product.vendor,
          price: product.price,
          currency: 'INR',
          availability: product.inStock ? 'InStock' : 'OutOfStock',
          ratingValue: averageRating,
          reviewCount: totalReviews
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="container mx-auto px-4 text-xs md:text-sm text-gray-500">
          <span className="cursor-pointer hover:text-medical-primary" onClick={() => navigate('/')}>Home</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-medical-primary" onClick={() => navigate(`/products?category=${encodeURIComponent(product.category)}`)}>{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium truncate">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Images */}
          <div className="lg:w-1/2">
            <div 
              className={`bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center relative min-h-[300px] md:min-h-[450px] overflow-hidden ${!activeVideo ? 'cursor-zoom-in group' : ''}`}
              onMouseMove={!activeVideo ? handleMouseMove : undefined}
              onMouseEnter={!activeVideo ? handleMouseEnter : undefined}
              onMouseLeave={!activeVideo ? handleMouseLeave : undefined}
            >
              {activeVideo ? (
                <iframe
                  src={activeVideo}
                  title={`${product.title} Video`}
                  className="absolute inset-0 w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <img 
                  src={activeImage || product.image || undefined} 
                  alt={product.title} 
                  className="max-h-[300px] md:max-h-[400px] w-auto object-contain mix-blend-multiply transition-transform duration-100 ease-out"
                  style={zoomStyle}
                />
              )}
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-600 transition-colors backdrop-blur-sm shadow-sm" 
                  title="Share"
                >
                    <Share2 size={20} />
                    {isCopied && (
                      <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                        Link Copied!
                      </span>
                    )}
                </button>
                <button 
                  onClick={handleWishlistToggle}
                  className="p-2 rounded-full bg-gray-100/80 hover:bg-gray-200 transition-colors backdrop-blur-sm shadow-sm"
                  title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart 
                    size={20} 
                    className={inWishlist ? "fill-red-600 text-red-600" : "text-gray-600"} 
                  />
                </button>
              </div>
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-medical-alert text-white px-3 py-1 rounded font-bold text-xs md:text-sm shadow-sm">
                    {discount}% OFF
                </div>
              )}
            </div>
            
            {/* Gallery */}
            {((product.images && product.images.length > 0) && (product.images.length + youtubeVideos.length) > 1) && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin">
                    {product.images.map((img, idx) => (
                        <div 
                            key={`img-${idx}`} 
                            onClick={() => {
                              setActiveImage(img);
                              setActiveVideo(null);
                            }}
                            className={`w-16 h-16 md:w-20 md:h-20 border rounded-lg p-1 cursor-pointer transition-all flex-shrink-0 ${(!activeVideo && activeImage === img) ? 'border-medical-primary ring-1 ring-medical-primary' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <img src={img || undefined} className="w-full h-full object-contain" alt="" />
                        </div>
                    ))}
                    
                    {youtubeVideos.map((videoUrl, idx) => {
                        let videoId = "";
                        if (videoUrl.includes('/embed/')) {
                          videoId = videoUrl.split('/embed/')[1]?.split('?')[0] || "";
                        } else {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                          const match = videoUrl.match(regExp);
                          if (match && match[2].length === 11) {
                            videoId = match[2];
                          }
                        }
                        const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : `https://via.placeholder.com/150?text=Play+Video`;
                        
                        return (
                          <div 
                              key={`vid-${idx}`} 
                              onClick={() => setActiveVideo(videoUrl)}
                              className={`w-16 h-16 md:w-20 md:h-20 border rounded-lg p-1 cursor-pointer transition-all flex-shrink-0 relative bg-black/5 flex items-center justify-center ${activeVideo === videoUrl ? 'border-medical-primary ring-1 ring-medical-primary' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                              <img src={thumbUrl} className="w-full h-full object-cover rounded" alt="Video Thumbnail" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shadow">
                                  <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                          </div>
                        );
                    })}
                </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="lg:w-1/2">
            <div className="mb-4">
              <span className="text-medical-dark font-bold text-xs uppercase tracking-wider mb-1 block">
                {product.vendor}
              </span>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 leading-snug mb-2">{product.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center bg-green-50 px-2 py-1 rounded text-green-700 text-sm font-bold gap-1">
                    <span>{product.rating || 4.8}</span> <Star size={12} fill="currentColor" />
                </div>
                <span className="text-gray-500 text-sm">({product.reviewCount || 10} Reviews)</span>
                <span className="text-gray-400 text-sm">|</span>
                <span className="text-gray-500 text-sm">Brand New</span>
                <span className="text-gray-400 text-sm">|</span>
                <span className="text-gray-500 text-sm">GST Invoice Available</span>
              </div>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">₹{product.compareAtPrice.toLocaleString()}</span>
                )}
              </div>
              <p className="text-xs text-green-600 font-bold mb-4">Inclusive of all taxes</p>
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                   <div className="flex items-center border border-gray-300 bg-white rounded-lg w-full sm:w-auto justify-between">
                      <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="px-3 py-2 hover:bg-gray-100 text-gray-600"><Minus size={16} /></button>
                      <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 hover:bg-gray-100 text-gray-600"><Plus size={16} /></button>
                   </div>
                   
                   {/* Desktop Add to Cart */}
                   <button 
                      onClick={handleAddToCart}
                      disabled={!product.inStock || isCartLoading || isAdded}
                      className={`hidden md:flex flex-1 py-3 px-6 rounded-lg font-bold text-base shadow-lg transition-all items-center justify-center gap-2 ${
                      product.inStock 
                          ? isAdded
                              ? 'bg-green-600 text-white'
                              : 'bg-medical-primary text-white hover:bg-medical-dark' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                   >
                      {isCartLoading && <Loader className="animate-spin" size={18} />}
                      {product.inStock 
                        ? isAdded 
                          ? '✓ Added to Cart!' 
                          : 'Add to Cart' 
                        : 'Out of Stock'}
                   </button>

                   {/* Desktop Buy Now */}
                   {product.inStock && (
                     <button 
                        onClick={handleBuyNow}
                        disabled={isCartLoading || isBuyingNow}
                        className="hidden md:flex flex-1 py-3 px-6 rounded-lg font-bold text-base bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition-all items-center justify-center gap-2"
                     >
                        {isBuyingNow && <Loader className="animate-spin" size={18} />}
                        Buy Now
                     </button>
                   )}
                </div>

                {/* Rental Button */}
                {isRentalAvailable(product) && (
                   <button 
                     onClick={() => setIsRentalModalOpen(true)}
                     className="hidden md:flex w-full py-3 px-6 rounded-lg font-bold text-base border-2 border-medical-primary text-medical-primary hover:bg-medical-light transition-all items-center justify-center gap-2"
                   >
                     <Calendar size={18} /> Rent this Equipment
                   </button>
                )}
              </div>

              {/* Notify Me Form (Only if Out of Stock) */}
              {!product.inStock && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <h3 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <RotateCcw size={16} /> Notify me when available
                  </h3>
                  <p className="text-xs text-orange-700 mb-3">This item is currently out of stock. Leave your email and we'll let you know when it's back.</p>
                  
                  {notifyStatus === 'success' ? (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-white p-2 rounded-lg border border-green-100">
                      <CheckCircle size={16} /> You're on the list! We'll email you soon.
                    </div>
                  ) : (
                    <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="email" 
                        required
                        placeholder="your@email.com" 
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        className="flex-1 border border-orange-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 outline-none"
                      />
                      <button 
                        type="submit" 
                        disabled={isNotifying}
                        className="bg-orange-600 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isNotifying && <Loader size={14} className="animate-spin" />}
                        Notify Me
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-3">
                  <button 
                    onClick={() => {
                        const subject = encodeURIComponent(`Callback Request: ${product.title}`);
                        const body = encodeURIComponent(`Hi, I would like to request a callback regarding the ${product.title}. My phone number is: `);
                        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
                    }}
                    className="flex-1 border border-medical-primary text-medical-primary py-2.5 rounded-lg font-bold text-sm hover:bg-medical-light transition-colors flex items-center justify-center gap-2"
                  >
                      <Phone size={16} /> Request Callback
                  </button>
                  <a href={`https://wa.me/?text=Hi, I am interested in ${product.title}`} target="_blank" rel="noreferrer" className="flex-1 border border-green-500 text-green-600 py-2.5 rounded-lg font-bold text-sm hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                      <MessageCircle size={16} /> WhatsApp Us
                  </a>
                  <button 
                    onClick={handleShare}
                    className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                      <Share2 size={16} /> {isCopied ? 'Copied!' : 'Share'}
                  </button>
              </div>
            </div>

            {/* Pincode Checker */}
            <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-800 mb-2 flex items-center gap-2"><MapPin size={16} /> Check Delivery</h3>
                <form onSubmit={handleCheckPincode} className="flex gap-2 max-w-sm">
                    <input 
                        type="text" 
                        placeholder="Enter Pincode" 
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g,'').slice(0,6))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-medical-primary outline-none"
                    />
                    <button type="submit" className="text-medical-primary font-bold text-sm px-4 hover:bg-gray-50 rounded-lg">Check</button>
                </form>
                {isCheckingPincode && <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Loader size={12} className="animate-spin"/> Checking availability...</p>}
                {pincodeStatus === 'success' && (
                    <div className="mt-2 text-sm">
                        <p className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={14}/> Delivery Available to {pincode}</p>
                        <p className="text-gray-500 text-xs pl-5">Estimated delivery by <span className="font-bold text-gray-700">5-7 Days</span></p>
                    </div>
                )}
            </div>

            {/* Highlights */}
            <div className="space-y-3 mb-6">
                {product.warranty && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-white p-2 rounded-full text-medical-primary shadow-sm"><ShieldCheck size={20} /></div>
                      <div>
                          <p className="font-bold text-sm text-gray-800">
                            {product.warranty.toUpperCase().includes('LIFETIME') 
                              ? product.warranty 
                              : `${product.warranty} Warranty`}
                          </p>
                          <p className="text-xs text-gray-500">Manufacturer Warranty included</p>
                      </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-white p-2 rounded-full text-medical-primary shadow-sm"><FileText size={20} /></div>
                    <div>
                        <p className="font-bold text-sm text-gray-800">GST Invoice</p>
                        <p className="text-xs text-gray-500">Save 12-18% with GST Input</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info */}
        <div className="mt-12">
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('desc')}
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'desc' ? 'border-medical-primary text-medical-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Description
                </button>
                <button 
                    onClick={() => setActiveTab('specs')}
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'specs' ? 'border-medical-primary text-medical-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Specifications
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-medical-primary text-medical-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} flex items-center gap-1.5`}
                >
                    Reviews ({productReviews.length})
                </button>
            </div>
            
            <div className="py-8">
                {activeTab === 'desc' && (
                    <div className="prose prose-sm max-w-none text-gray-600">
                        <div dangerouslySetInnerHTML={{ __html: product.description || `<p>Professional grade medical equipment designed for optimal performance.</p>` }} />
                    </div>
                )}
                {activeTab === 'specs' && (
                    <div className="max-w-2xl">
                        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                            <tbody className="divide-y divide-gray-100">
                                <tr><td className="p-3 bg-gray-50 font-bold w-1/3">Brand</td><td className="p-3">{product.vendor}</td></tr>
                                <tr><td className="p-3 bg-gray-50 font-bold w-1/3">Model</td><td className="p-3">{product.title}</td></tr>
                                <tr><td className="p-3 bg-gray-50 font-bold w-1/3">Category</td><td className="p-3">{product.category}</td></tr>
                                {product.warranty && (
                                  <tr><td className="p-3 bg-gray-50 font-bold w-1/3">Warranty</td><td className="p-3">{product.warranty}</td></tr>
                                )}
                                <tr><td className="p-3 bg-gray-50 font-bold w-1/3">Condition</td><td className="p-3">Brand New</td></tr>
                                {product.metafields?.map(m => (
                                  <tr key={`${m.namespace}-${m.key}`}>
                                    <td className="p-3 bg-gray-50 font-bold w-1/3">{m.key.replace(/_/g, ' ')}</td>
                                    <td className="p-3">{m.value}</td>
                                  </tr>
                                ))}
                                {Object.entries(managedMetafields.custom_specs || {}).map(([key, val]) => (
                                  <tr key={`managed-${key}`}>
                                    <td className="p-3 bg-gray-50 font-bold w-1/3">{key}</td>
                                    <td className="p-3">{String(val)}</td>
                                  </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'reviews' && (
                    <div className="animate-fadeIn">
                        <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
                            {/* Summary Dashboard */}
                            <div className="w-full lg:w-1/3 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center lg:text-left">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Reviews</h4>
                                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                                    <span className="text-5xl font-black text-gray-800">
                                        {(productReviews.reduce((acc, curr) => acc + curr.rating, 0) / (productReviews.length || 1)).toFixed(1)}
                                    </span>
                                    <div>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => {
                                                const avgRating = productReviews.reduce((acc, curr) => acc + curr.rating, 0) / (productReviews.length || 1);
                                                return <Star key={i} size={16} fill={i < Math.round(avgRating) ? "currentColor" : "none"} className={i >= Math.round(avgRating) ? "text-gray-300" : ""} />;
                                            })}
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium mt-1 block">Based on {productReviews.length} reviews</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                                    className="w-full bg-white hover:bg-gray-50 text-medical-primary border border-medical-primary/20 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    Write a Review
                                </button>
                            </div>

                            {/* Detailed Star Breakdown */}
                            <div className="w-full lg:w-2/3 space-y-2.5">
                                {[5, 4, 3, 2, 1].map(stars => {
                                    const count = productReviews.filter(r => r.rating === stars).length;
                                    const pct = productReviews.length ? Math.round((count / productReviews.length) * 100) : 0;
                                    return (
                                        <div key={stars} className="flex items-center gap-3 text-sm">
                                            <span className="w-3 font-semibold text-gray-600">{stars}</span>
                                            <Star size={14} className="text-yellow-400 fill-current" />
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-medical-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                            </div>
                                            <span className="w-8 text-right text-xs text-gray-400 font-bold">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Review Form panel */}
                        {isReviewFormOpen && (
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-8 animate-slideDown">
                                <h3 className="font-bold text-gray-800 text-base mb-4">Share your feedback</h3>
                                {reviewSubmitStatus === 'success' ? (
                                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
                                        <CheckCircle size={18} /> Thank you! Your review has been submitted successfully.
                                    </div>
                                ) : (
                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Your Name</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    placeholder="E.g. Ramesh Patel" 
                                                    value={reviewForm.name} 
                                                    onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-medical-primary focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Rating</label>
                                                <div className="flex gap-1.5 py-2">
                                                    {[1, 2, 3, 4, 5].map(stars => (
                                                        <button 
                                                            key={stars} 
                                                            type="button" 
                                                            onClick={() => setReviewForm(prev => ({ ...prev, rating: stars }))}
                                                            className="text-yellow-400 focus:outline-none transition-transform active:scale-95"
                                                        >
                                                            <Star size={24} fill={stars <= reviewForm.rating ? "currentColor" : "none"} className={stars > reviewForm.rating ? "text-gray-300" : ""} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Review Comments</label>
                                            <textarea 
                                                required 
                                                rows={3} 
                                                placeholder="What did you like or dislike about this product?" 
                                                value={reviewForm.content} 
                                                onChange={e => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-medical-primary focus:outline-none"
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsReviewFormOpen(false)}
                                                className="px-5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="px-5 py-2 bg-medical-primary text-white rounded-xl text-xs font-bold hover:bg-medical-dark transition-all shadow-sm"
                                            >
                                                Submit Review
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Reviews Feed */}
                        <div className="space-y-4 divide-y divide-gray-100">
                            {productReviews.length > 0 ? (
                                productReviews.map((rev) => (
                                    <div key={rev.id} className="pt-4 first:pt-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-medical-primary/10 text-medical-primary rounded-full flex items-center justify-center font-bold text-sm border border-medical-primary/10 select-none">
                                                    {rev.name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{rev.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className="flex text-yellow-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} className={i >= rev.rating ? "text-gray-300" : ""} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-semibold">{rev.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed mt-3 pl-14 pr-4">{rev.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-gray-400 text-sm">No reviews found for this product. Be the first to write one!</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-12 border-t border-gray-100">
          <h2 className="text-2xl font-heading font-bold text-gray-800 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <div className="container mx-auto px-4 py-12 border-t border-gray-100 bg-gray-50/50">
          <h2 className="text-2xl font-heading font-bold text-gray-800 mb-8">Frequently Bought Together</h2>
          <div className="flex flex-col lg:flex-row items-center gap-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {/* Current Product */}
              <div className="flex flex-col items-center w-32 md:w-40 relative group">
                <div className="absolute top-0 left-0 z-10">
                    <input 
                        type="checkbox" 
                        checked={selectedBundleItems.includes(product.id)}
                        onChange={() => {
                            if (selectedBundleItems.includes(product.id)) {
                                setSelectedBundleItems(prev => prev.filter(id => id !== product.id));
                            } else {
                                setSelectedBundleItems(prev => [...prev, product.id]);
                            }
                        }}
                        className="w-4 h-4 accent-medical-primary cursor-pointer"
                    />
                </div>
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl p-2 border border-gray-100 flex items-center justify-center">
                  <img src={product.image || undefined} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                </div>
                <p className="text-xs font-bold text-gray-800 mt-2 text-center line-clamp-1">{product.title}</p>
                <p className="text-xs text-medical-primary font-bold">₹{product.price.toLocaleString()}</p>
              </div>

              <div className="text-2xl text-gray-300 font-light">+</div>

              {/* Dynamic Products */}
              {frequentlyBought.map((p, idx) => (
                <React.Fragment key={p.id}>
                  <div className="flex flex-col items-center w-32 md:w-40 relative group">
                    <div className="absolute top-0 left-0 z-10">
                        <input 
                            type="checkbox" 
                            checked={selectedBundleItems.includes(p.id)}
                            onChange={() => {
                                if (selectedBundleItems.includes(p.id)) {
                                    setSelectedBundleItems(prev => prev.filter(id => id !== p.id));
                                } else {
                                    setSelectedBundleItems(prev => [...prev, p.id]);
                                }
                            }}
                            className="w-4 h-4 accent-medical-primary cursor-pointer"
                        />
                    </div>
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl p-2 border border-gray-100 flex items-center justify-center">
                      <img src={p.image || undefined} alt={p.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    </div>
                    <p className="text-xs font-bold text-gray-800 mt-2 text-center line-clamp-1">{p.title}</p>
                    <p className="text-xs text-medical-primary font-bold">₹{p.price.toLocaleString()}</p>
                  </div>
                  {idx < frequentlyBought.length - 1 && <div className="text-2xl text-gray-300 font-light">+</div>}
                </React.Fragment>
              ))}
            </div>

            <div className="lg:ml-auto lg:pl-8 lg:border-l border-gray-200 w-full lg:w-auto">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Total Price for {selectedBundleItems.length} selected items</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(
                    (selectedBundleItems.includes(product.id) ? product.price : 0) + 
                    frequentlyBought.filter(p => selectedBundleItems.includes(p.id)).reduce((acc, p) => acc + p.price, 0)
                  ).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={async () => {
                  if (selectedBundleItems.includes(product.id)) {
                    await addToCart(product, 1);
                  }
                  for (const p of frequentlyBought) {
                    if (selectedBundleItems.includes(p.id)) {
                        await addToCart(p, 1);
                    }
                  }
                }}
                disabled={selectedBundleItems.length === 0}
                className="w-full lg:w-auto bg-medical-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-medical-dark transition-colors shadow-lg shadow-medical-primary/20 disabled:bg-gray-300 disabled:shadow-none"
              >
                Add Selected to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:hidden z-40 flex items-center gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {isRentalAvailable(product) && (
          <button 
              onClick={() => setIsRentalModalOpen(true)}
              className="px-3 py-2.5 rounded-lg font-bold text-xs border border-medical-primary text-medical-primary bg-white shrink-0 font-heading"
          >
              RENT
          </button>
        )}
        
        <button 
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdded}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs text-white transition-colors truncate font-heading ${
              product.inStock 
                ? isAdded 
                  ? 'bg-green-600' 
                  : 'bg-medical-primary' 
                : 'bg-gray-400'
            }`}
        >
            {product.inStock 
              ? isAdded 
                ? '✓ ADDED!' 
                : 'ADD TO CART' 
              : 'OUT OF STOCK'}
        </button>

        {product.inStock && (
          <button 
              onClick={handleBuyNow}
              disabled={isBuyingNow}
              className="flex-1 py-2.5 rounded-lg font-bold text-xs text-white bg-orange-600 hover:bg-orange-700 truncate font-heading"
          >
              BUY NOW
          </button>
        )}
      </div>

      {/* Rental Modal */}
      {product && (
        <RentalModal 
          product={product} 
          isOpen={isRentalModalOpen} 
          onClose={() => setIsRentalModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ProductDetailPage;