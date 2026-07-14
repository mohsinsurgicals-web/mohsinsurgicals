import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Review, 
  ReviewsIndex, 
  ReviewSummary, 
  fetchAllReviewsSummaries, 
  fetchProductReviews, 
  saveProductReviews 
} from '../lib/pantry';

interface ReviewsContextType {
  reviewsIndex: ReviewsIndex;
  getReviewsSummary: (productId: string, fallbackRating: number, fallbackCount: number) => ReviewSummary;
  addReview: (productId: string, review: Omit<Review, 'id' | 'date'>, title: string, category: string) => Promise<Review[]>;
  loadReviews: (productId: string, title: string, category: string) => Promise<Review[]>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

const cleanId = (id: string): string => {
  return id
    .replace(/gid:\/\/shopify\/Product\//g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
};

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviewsIndex, setReviewsIndex] = useState<ReviewsIndex>({});

  // Fetch summaries on mount to populate search, cards, and home page ratings
  useEffect(() => {
    const loadSummaries = async () => {
      try {
        const summaries = await fetchAllReviewsSummaries();
        setReviewsIndex(summaries);
      } catch (e) {
        console.error("Failed to load review summaries index:", e);
      }
    };
    loadSummaries();
  }, []);

  const getReviewsSummary = (productId: string, fallbackRating: number, fallbackCount: number): ReviewSummary => {
    const cleaned = cleanId(productId);
    if (reviewsIndex[cleaned]) {
      return reviewsIndex[cleaned];
    }
    return { rating: fallbackRating, count: fallbackCount };
  };

  const loadReviews = async (productId: string, title: string, category: string): Promise<Review[]> => {
    return await fetchProductReviews(productId, title, category);
  };

  const addReview = async (
    productId: string, 
    review: Omit<Review, 'id' | 'date'>, 
    title: string, 
    category: string
  ): Promise<Review[]> => {
    const currentReviews = await fetchProductReviews(productId, title, category);
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [newReview, ...currentReviews];
    
    // Save to Pantry and localStorage cache
    await saveProductReviews(productId, updated);
    
    // Update local state summaries
    const total = updated.length;
    const avg = parseFloat((updated.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1));
    const cleaned = cleanId(productId);
    
    setReviewsIndex(prev => ({
      ...prev,
      [cleaned]: { rating: avg, count: total }
    }));

    return updated;
  };

  return (
    <ReviewsContext.Provider value={{ reviewsIndex, getReviewsSummary, addReview, loadReviews }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};
