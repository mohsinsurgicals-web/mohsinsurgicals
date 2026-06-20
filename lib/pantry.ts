const PANTRY_ID = '1094fe7c-cc51-4d37-8342-d7a2f54dafe9';

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  content: string;
}

export interface ReviewSummary {
  rating: number;
  count: number;
}

export interface ReviewsIndex {
  [productId: string]: ReviewSummary;
}

const cleanId = (id: string): string => {
  return id
    .replace(/gid:\/\/shopify\/Product\//g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
};

const generateInitialReviews = (title: string, category: string): Review[] => {
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

export const fetchProductReviews = async (productId: string, title: string, category: string): Promise<Review[]> => {
  const basket = `reviews_${cleanId(productId)}`;
  try {
    const res = await fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${basket}`);
    if (res.status === 404) {
      // Create initial reviews
      const initialReviews = generateInitialReviews(title, category);
      await saveProductReviews(productId, initialReviews);
      return initialReviews;
    }
    if (!res.ok) throw new Error("Pantry GET error");
    const data = await res.json();
    return data.reviews || [];
  } catch (e) {
    console.error("Failed to fetch reviews from Pantry, falling back to local storage cache:", e);
    const local = localStorage.getItem(basket);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return generateInitialReviews(title, category);
  }
};

export const saveProductReviews = async (productId: string, reviews: Review[]) => {
  const basket = `reviews_${cleanId(productId)}`;
  // Save locally first
  localStorage.setItem(basket, JSON.stringify(reviews));
  
  try {
    const res = await fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${basket}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reviews })
    });
    if (!res.ok) throw new Error("Pantry POST error");
    
    // Update summary index
    const total = reviews.length;
    const avg = total > 0 ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)) : 5.0;
    await updateReviewsSummary(productId, { rating: avg, count: total });
  } catch (e) {
    console.error("Failed to save reviews to Pantry:", e);
  }
};

export const fetchAllReviewsSummaries = async (): Promise<ReviewsIndex> => {
  try {
    const res = await fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/reviews_summary`);
    if (res.status === 404) {
      return {};
    }
    if (!res.ok) throw new Error("Pantry GET summary error");
    const data = await res.json();
    return data.summaries || {};
  } catch (e) {
    console.error("Failed to fetch reviews summary from Pantry, loading from localStorage cache:", e);
    const local = localStorage.getItem('reviews_summary_cache');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return {};
  }
};

const updateReviewsSummary = async (productId: string, summary: ReviewSummary) => {
  try {
    const current = await fetchAllReviewsSummaries();
    current[cleanId(productId)] = summary;
    
    localStorage.setItem('reviews_summary_cache', JSON.stringify(current));
    await fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/reviews_summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ summaries: current })
    });
  } catch (e) {
    console.error("Failed to update reviews summary index on Pantry:", e);
  }
};
