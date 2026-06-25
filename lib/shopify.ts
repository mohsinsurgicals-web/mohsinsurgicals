import Client from 'shopify-buy';
import { Product, Customer, Order, Address } from '../types';

// ==========================================
// CONFIGURATION
// ==========================================
const SHOPIFY_DOMAIN = 'ptya1n-k0.myshopify.com'; 
const SHOPIFY_ACCESS_TOKEN = 'c1fb47a74eaec2fbafa70becac08f52b';
const API_VERSION = '2024-07';

// ==========================================
// CLIENT INITIALIZATION
// ==========================================
export const client = Client.buildClient({
  domain: SHOPIFY_DOMAIN,
  storefrontAccessToken: SHOPIFY_ACCESS_TOKEN,
  apiVersion: API_VERSION
});

// Helper for raw GraphQL queries
const shopifyFetch = async <T>(query: string, variables: any = {}): Promise<T> => {
  try {
    const endpoint = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    
    if (json.errors) {
      const errorMessage = json.errors.map((e: any) => e.message).join(', ');
      throw new Error(errorMessage);
    }
    
    return json.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// CART WRAPPERS (Replaces Checkout API)
// ==========================================

const CART_FRAGMENT = `
  id
  checkoutUrl
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            image {
              url
            }
            product {
              id
              title
              vendor
            }
          }
        }
      }
    }
  }
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
`;

export const createShopifyCart = async (customerToken?: string) => {
  const query = `
    mutation cartCreate($buyerIdentity: CartBuyerIdentityInput) {
      cartCreate(input: { buyerIdentity: $buyerIdentity }) {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;

  const variables = {
    buyerIdentity: customerToken
      ? { customerAccessToken: customerToken }
      : null
  };

  const data: any = await shopifyFetch(query, variables);
  return data.cartCreate.cart;
};


export const fetchShopifyCart = async (cartId: string) => {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        ${CART_FRAGMENT}
      }
    }
  `;
  const data: any = await shopifyFetch(query, { cartId });
  return data.cart;
};

export const attachCustomerToCart = async (cartId: string) => {
  const token = localStorage.getItem("shopify_customer_token");

  if (!token) return null;

  const query = `
    mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                    }
                    image {
                      url
                    }
                    product {
                      id
                      title
                      vendor
                      handle
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    cartId,
    buyerIdentity: {
      customerAccessToken: token,
    },
  };

  const data: any = await shopifyFetch(query, variables);
  return data.cartBuyerIdentityUpdate.cart;
};

const formatPhoneToE164 = (phone: string): string => {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    cleaned = '+' + cleaned;
  }
  return cleaned;
};

export const updateCartBuyerIdentity = async (
  cartId: string,
  buyerInfo: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zip: string;
    province?: string;
  }
) => {
  const token = localStorage.getItem("shopify_customer_token");

  const query = `
    mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const formattedPhone = formatPhoneToE164(buyerInfo.phone);

  const deliveryAddress = {
    address1: buyerInfo.address,
    city: buyerInfo.city,
    zip: buyerInfo.zip,
    country: "India",
    firstName: buyerInfo.firstName,
    lastName: buyerInfo.lastName,
    phone: formattedPhone || undefined,
    province: buyerInfo.province || undefined
  };

  const buyerIdentity: any = {
    email: buyerInfo.email,
    phone: formattedPhone || undefined,
    countryCode: "IN",
    deliveryAddressPreferences: [
      {
        deliveryAddress
      }
    ]
  };

  if (token) {
    buyerIdentity.customerAccessToken = token;
  }

  const variables = {
    cartId,
    buyerIdentity
  };

  let data: any = await shopifyFetch(query, variables);
  let result = data.cartBuyerIdentityUpdate;

  // Fallback: If phone validation failed, try again without the phone field
  const phoneError = result.userErrors?.find((err: any) => 
    err.field?.some((f: string) => f.toLowerCase() === 'phone')
  );

  if (phoneError && formattedPhone) {
    console.warn("Retrying buyer identity update without phone due to validation error:", phoneError.message);
    
    const fallbackBuyerIdentity = { ...buyerIdentity };
    delete fallbackBuyerIdentity.phone;
    if (fallbackBuyerIdentity.deliveryAddressPreferences?.[0]?.deliveryAddress) {
      const addr = { ...fallbackBuyerIdentity.deliveryAddressPreferences[0].deliveryAddress };
      delete addr.phone;
      fallbackBuyerIdentity.deliveryAddressPreferences = [{ deliveryAddress: addr }];
    }

    data = await shopifyFetch(query, { cartId, buyerIdentity: fallbackBuyerIdentity });
    result = data.cartBuyerIdentityUpdate;
  }

  if (result.userErrors && result.userErrors.length > 0) {
    const errorMsg = result.userErrors.map((e: any) => e.message).join(', ');
    throw new Error(errorMsg);
  }

  return result.cart;
};

export const addItemToCart = async (cartId: string, lines: {merchandiseId: string, quantity: number}[]) => {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
      }
    }
  `;
  const data: any = await shopifyFetch(query, { cartId, lines });
  return data.cartLinesAdd.cart;
};

export const updateLineItemInCart = async (cartId: string, lines: {id: string, quantity: number}[]) => {
  const query = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
      }
    }
  `;
  const data: any = await shopifyFetch(query, { cartId, lines });
  return data.cartLinesUpdate.cart;
};

export const removeLineItemFromCart = async (cartId: string, lineIds: string[]) => {
  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FRAGMENT}
        }
      }
    }
  `;
  const data: any = await shopifyFetch(query, { cartId, lineIds });
  return data.cartLinesRemove.cart;
};

// ==========================================
// DATA NORMALIZATION & AUTO-CATEGORIZATION
// ==========================================

// keys match the 'slug' or 'name' used in UI constants
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Oxygen Concentrator": ["oxygen", "concentrator", "portable", "dedakj", "philips", "evox", "5l", "10l", "flow", "oxy med"],
  "BiPAP": ["bipap", "bi-level", "resmed", "bmc", "dreamstation", "airsense", "lumis", "bilevel"],
  "CPAP": ["cpap", "auto cpap", "apnea", "sleep", "airsense", "resmart"],
  "Patient Monitor": ["monitor", "multipara", "vital", "ecg", "pulse", "oximeter", "heart rate", "bpl"],
  "ECG Machine": ["ecg", "ekg", "electrocardiogram", "cardiograph"],
  "BP Monitor": ["bp", "blood pressure", "sphygmomanometer", "hypertension"],
  "Glucometer": ["glucometer", "glucose", "blood sugar", "diabetes", "accu-chek"],
  "Nebulizer": ["nebulizer", "compressor", "mesh", "inhaler", "omron"],
  "Suction Machine": ["suction", "aspirator", "vacuum", "phlegm"],
  "Syringe Pump": ["syringe pump", "infusion pump", "perfusor"],
  "Defibrillator": ["defibrillator", "aed", "shock"],
  "Sterilizer": ["sterilizer", "autoclave", "disinfection"],
  "Thermometer": ["thermometer", "infrared", "digital", "temperature", "gun"],
  "Hospital Furniture": ["bed", "mattress", "table", "trolley", "stretcher", "fowler", "ward", "overbed"],
  "Wheelchair": ["wheelchair", "karma", "walker", "commode"],
  "Orthopedic": ["support", "brace", "belt", "splint", "knee", "back", "cervical", "ortho"],
  "Masks & Accessories": ["mask", "tubing", "cannula", "filter", "full face", "nasal"]
};

const normalizeCategoryKey = (value: string): string =>
  (value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

const CATEGORY_ALIASES: Record<string, string[]> = {
  "Oxygen Concentrator": ["oxygenconcentrator", "oxygenconcentrators", "oxygen", "concentrator", "generator", "oxy", "oc"],
  "BiPAP": ["bipap", "bipapmachine", "bilevel", "bi-level", "vpap"],
  "CPAP": ["cpap", "cpapmachine", "autocpap", "apnea", "sleep apnea", "resmart"],
  "Patient Monitor": ["patientmonitor", "patientmonitors", "monitor", "multiparamonitor", "multipara", "vital signs", "ecg"],
  "ECG Machine": ["ecg", "ekg", "electrocardiogram", "ecgmachines"],
  "BP Monitor": ["bpmonitor", "bloodpressuremonitor", "bp", "bloodpressure"],
  "Glucometer": ["glucometer", "glucosemonitor", "bloodsugar"],
  "Nebulizer": ["nebulizer", "nebulizers", "nebuliser", "nebulizar"],
  "Suction Machine": ["suctionmachine", "suctionmachines", "aspirator", "vacuum"],
  "Syringe Pump": ["syringepump", "infusionpump"],
  "Defibrillator": ["defibrillator", "aed"],
  "Sterilizer": ["sterilizer", "autoclave"],
  "Thermometer": ["thermometer", "thermometers", "stethascope", "stethscope"],
  "Hospital Furniture": ["hospitalfurniture", "hospitalbed", "hospitalbeds", "bed", "fowler", "medical bed"],
  "Wheelchair": ["wheelchair", "wheelchairs", "wheel chair", "walker", "mobility"],
  "Orthopedic": ["orthopedic", "ortho", "support", "brace"],
  "Masks & Accessories": ["masksandaccessories", "mask", "masks", "cpapmask", "bipapmask", "tubing", "cannula"]
};

const SYNONYMS: Record<string, string[]> = {
  "oxygen": ["concentrator", "generator", "oxy", "oc"],
  "bipap": ["bi-level", "vpap", "bilevel"],
  "cpap": ["apnea", "sleep apnea", "resmart"],
  "monitor": ["multipara", "vital signs", "ecg"],
  "wheelchair": ["wheel chair", "walker", "mobility"],
  "bed": ["hospital bed", "fowler", "medical bed"],
  "concentrator": ["concentralor", "concentrater", "concenrator"],
  "nebulizer": ["nebuliser", "nebulizar"],
  "stethoscope": ["stethascope", "stethscope"],
};

const expandSearchQuery = (query: string): string => {
  const terms = query.toLowerCase().split(/\s+/);
  const expandedTerms = new Set<string>(terms);

  terms.forEach(term => {
    if (SYNONYMS[term]) {
      SYNONYMS[term].forEach(syn => expandedTerms.add(syn));
    }
    // Check if term is a key in CATEGORY_ALIASES
    for (const [cat, aliases] of Object.entries(CATEGORY_ALIASES)) {
      if (cat.toLowerCase().includes(term) || aliases.some(a => a.includes(term))) {
        aliases.forEach(a => expandedTerms.add(a));
      }
    }
  });

  return Array.from(expandedTerms).join(' OR ');
};

const getCategoryFromAliases = (rawValues: string[]): string | undefined => {
  const normalizedValues = rawValues
    .filter(Boolean)
    .map(v => normalizeCategoryKey(v));

  for (const [category, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some(alias => normalizedValues.includes(alias))) {
      return category;
    }
  }

  return undefined;
};

const inferCategory = (title: string, tags: string[], productType: string, collections: { title?: string; handle?: string }[] = []): string => {
  const collectionValues = collections.flatMap(c => [c?.title || '', c?.handle || '']);
  const fromCollections = getCategoryFromAliases(collectionValues);
  if (fromCollections) return fromCollections;

  const fromProductTypeAlias = getCategoryFromAliases([productType]);
  if (fromProductTypeAlias) return fromProductTypeAlias;

  // 1. Check direct match with keyword keys
  if (CATEGORY_KEYWORDS[productType]) return productType;

  // 2. Search keywords
  const searchString = `${title} ${productType} ${tags.join(' ')}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => searchString.includes(k.toLowerCase()))) {
      return category;
    }
  }

  // 3. Fallback logic
  if (searchString.includes("oxygen")) return "Oxygen Concentrator";
  if (searchString.includes("bipap")) return "BiPAP";
  if (searchString.includes("cpap")) return "CPAP";
  if (searchString.includes("monitor")) return "Patient Monitor";

  return productType || "General";
};

const generateRating = (id: string) => {
  // Deterministic rating based on ID hash for consistent UI
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const normalized = Math.abs(hash % 15) / 10 + 3.5;
  return parseFloat(normalized.toFixed(1));
};

const extractWarranty = (tags: string[], description: string): string | undefined => {
  // 1. Check tags for warranty:X or lifetime warranty tags
  const warrantyTag = tags.find(tag => {
    const t = tag.toLowerCase();
    return t.startsWith('warranty:') || t === 'lifetime warranty';
  });

  if (warrantyTag) {
    if (warrantyTag.toLowerCase() === 'lifetime warranty') return "Lifetime";
    const val = warrantyTag.split(':')[1].trim();
    return val.charAt(0).toUpperCase() + val.slice(1);
  }

  // 2. Parse description for common warranty patterns
  const descriptionLower = (description || "").toLowerCase();
  
  // Check for lifetime warranty
  if (descriptionLower.includes('lifetime warranty')) {
    const extracted = "Lifetime";
    return extracted.charAt(0).toUpperCase() + extracted.slice(1);
  }

  // Pattern 1: "X Year Warranty" or "X Month Warranty"
  const pattern1 = descriptionLower.match(/(\d+)\s*(year|month)s?\s*warranty/i);
  if (pattern1) {
    return `${pattern1[1]} ${pattern1[2]}${parseInt(pattern1[1]) > 1 ? 's' : ''}`;
  }

  // Pattern 2: "Warranty: X Years"
  const pattern2 = descriptionLower.match(/warranty[:\s]+(\d+)\s*(year|month)s?/i);
  if (pattern2) {
    return `${pattern2[1]} ${pattern2[2]}${parseInt(pattern2[1]) > 1 ? 's' : ''}`;
  }

  return undefined; // No default warranty
};

export const isRentalAvailable = (product: Product): boolean => {
  const title = (product.title || "").toLowerCase();
  const category = (product.category || "").toLowerCase();
  
  const isOxygen = title.includes('oxygen concentrator') || category.includes('oxygen concentrator');
  const isBipap = title.includes('bipap') || category.includes('bipap');
  const isCpap = title.includes('cpap') || category.includes('cpap');
  const isPortable = title.includes('portable');
  
  // Portable Oxygen Concentrators are NOT available for rental
  if (isOxygen && isPortable) return false;
  
  return isOxygen || isBipap || isCpap;
};

export const extractYoutubeVideos = (html: string = ""): string[] => {
  const videoIds = new Set<string>();
  
  // Look for embed URLs in iframe src
  const iframeSrcRegex = /src=["'](?:https?:)?\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g;
  let match;
  while ((match = iframeSrcRegex.exec(html)) !== null) {
    if (match[1]) videoIds.add(match[1]);
  }

  // Look for any youtube watch links or youtu.be links in html
  const watchRegex = /(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/g;
  while ((match = watchRegex.exec(html)) !== null) {
    if (match[1]) videoIds.add(match[1]);
  }

  return Array.from(videoIds).map(id => `https://www.youtube.com/embed/${id}`);
};

const normalizeProduct = (shopifyProduct: any): Product => {
  const node = shopifyProduct.node || shopifyProduct;
  const firstVariant = node.variants?.edges?.[0]?.node || node.variants?.[0] || {};
  
  // Extract all images
  const edges = node.images?.edges || node.images || [];
  const images = Array.isArray(edges)
    ? edges.map((e: any) => e.node?.url || e.src || e.url)
    : [firstVariant?.image?.src || 'https://via.placeholder.com/400?text=No+Image'];

  const rawDescription = node.description || "";
  const cleanSpecs = rawDescription.replace(/(<([^>]+)>)/gi, "").substring(0, 60) + "...";

  const collections = (node.collections?.edges || []).map((edge: any) => ({
    title: edge?.node?.title,
    handle: edge?.node?.handle
  }));

  // Auto-Categorization (prioritize Shopify collections)
  const inferredCategory = inferCategory(
      node.title || "",
      node.tags || [],
      node.productType || "",
      collections
  );

  // Extract metafield-based rating and review count
  const ratingMeta = (node.metafields || []).find(
    (m: any) => m && (
      (m.namespace === 'reviews' && m.key === 'rating') ||
      (m.namespace === 'custom' && m.key === 'reviews_rating') ||
      (m.namespace === 'custom' && m.key === 'product_rating')
    )
  );
  const countMeta = (node.metafields || []).find(
    (m: any) => m && (
      (m.namespace === 'reviews' && m.key === 'rating_count') ||
      (m.namespace === 'custom' && m.key === 'reviews_count')
    )
  );

  let ratingVal = generateRating(node.id);
  if (ratingMeta && ratingMeta.value) {
    try {
      const parsed = JSON.parse(ratingMeta.value);
      const val = parseFloat(parsed.value || parsed);
      if (!isNaN(val)) ratingVal = val;
    } catch {
      const val = parseFloat(ratingMeta.value);
      if (!isNaN(val)) ratingVal = val;
    }
  }

  let countVal = Math.floor(generateRating(node.title) * 10) + 5;
  if (countMeta && countMeta.value) {
    const val = parseInt(countMeta.value, 10);
    if (!isNaN(val)) countVal = val;
  }

  // Extract YouTube videos from Shopify media or descriptionHtml
  const mediaEdges = node.media?.edges || [];
  const nativeVideos: string[] = [];
  mediaEdges.forEach((edge: any) => {
    const m = edge.node;
    if (m && m.mediaContentType === 'EXTERNAL_VIDEO' && m.host?.toLowerCase() === 'youtube' && m.embedUrl) {
      nativeVideos.push(m.embedUrl);
    }
  });

  const extractedVideos = extractYoutubeVideos(node.descriptionHtml || node.description || "");
  const combinedVideos = Array.from(new Set([...nativeVideos, ...extractedVideos]));

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    vendor: node.vendor,
    category: inferredCategory,
    price: parseFloat(firstVariant.price?.amount || firstVariant.price || "0"),
    compareAtPrice: firstVariant.compareAtPrice?.amount ? parseFloat(firstVariant.compareAtPrice.amount) : null,
    image: images[0],
    images: images,
    tags: node.tags || [],
    specs: cleanSpecs,
    inStock: firstVariant.availableForSale || firstVariant.available || false,
    variantId: firstVariant.id,
    description: node.descriptionHtml || node.description || "",
    rating: ratingVal,
    reviewCount: countVal,
    warranty: extractWarranty(node.tags || [], node.description || ""),
    seo: node.seo ? {
      title: node.seo.title,
      description: node.seo.description
    } : undefined,
    metafields: (node.metafields || [])
      .filter((m: any) => m !== null)
      .map((m: any) => ({
        namespace: m.namespace,
        key: m.key,
        value: m.value
      })),
    youtubeVideos: combinedVideos
  };
};

const normalizeCustomer = (data: any): Customer => {
  let orders: Order[] = [];
  if (data.orders?.edges) {
      orders = data.orders.edges.map((edge: any) => ({
        id: edge.node.id,
        orderNumber: edge.node.orderNumber,
        processedAt: edge.node.processedAt,
        totalPrice: edge.node.totalPrice,
        statusUrl: edge.node.statusUrl,
        lineItems: edge.node.lineItems.edges.map((li: any) => ({
            title: li.node.title,
            quantity: li.node.quantity
        }))
      }));
  }

  let addresses: Address[] = [];
  if (data.addresses?.edges) {
    addresses = data.addresses.edges.map((edge: any) => ({
        id: edge.node.id,
        address1: edge.node.address1,
        address2: edge.node.address2,
        city: edge.node.city,
        zip: edge.node.zip,
        country: edge.node.country,
        firstName: edge.node.firstName,
        lastName: edge.node.lastName,
        phone: edge.node.phone
    }));
  }

  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    orders,
    addresses
  };
};

// ==========================================
// PRODUCT FUNCTIONS
// ==========================================

const PRODUCT_FRAGMENT = `
  id
  handle
  title
  description
  descriptionHtml
  productType
  vendor
  tags
  variants(first: 1) {
    edges {
      node {
        id
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        availableForSale
        image {
          url
        }
      }
    }
  }
  collections(first: 10) {
    edges {
      node {
        title
        handle
      }
    }
  }
  images(first: 10) {
    edges {
      node {
        url
      }
    }
  }
  media(first: 10) {
    edges {
      node {
        mediaContentType
        ... on ExternalVideo {
          id
          embedUrl
          host
        }
      }
    }
  }
  seo {
    title
    description
  }
  metafields(identifiers: [
    {namespace: "custom", key: "specs"},
    {namespace: "custom", key: "keywords"},
    {namespace: "custom", key: "short_specs"},
    {namespace: "reviews", key: "rating"},
    {namespace: "custom", key: "reviews_rating"},
    {namespace: "custom", key: "product_rating"},
    {namespace: "reviews", key: "rating_count"},
    {namespace: "custom", key: "reviews_count"}
  ]) {
    namespace
    key
    value
  }
`;

export const fetchAllProducts = async (): Promise<Product[]> => {
  // Use a raw query with 'first: 250' to bypass default pagination of ~20
  const query = `
    query getAllProducts {
      products(first: 250) {
        edges {
          node {
            ${PRODUCT_FRAGMENT}
          }
        }
      }
    }
  `;
  
  try {
    const data: any = await shopifyFetch(query);
    return data.products.edges.map(normalizeProduct);
  } catch (error) {
    console.error("Error fetching all products:", error);
    const products = await client.product.fetchAll();
    return products.map(normalizeProduct);
  }
};

export const fetchProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const product = await client.product.fetch(id);
    if (!product) return undefined;
    return normalizeProduct(product);
  } catch (error) {
     return undefined;
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  if (category === 'All' || !category) return fetchAllProducts();
  
  let query = "";
  
  // 1. Try to find keywords for the exact category slug
  let keywords = CATEGORY_KEYWORDS[category];

  // 2. If not found, try to find a key that contains the category string (fuzzy match)
  if (!keywords) {
      const fuzzyKey = Object.keys(CATEGORY_KEYWORDS).find(k => k.toLowerCase().includes(category.toLowerCase()));
      if (fuzzyKey) keywords = CATEGORY_KEYWORDS[fuzzyKey];
  }

  if (keywords) {
      // Build an inclusive query using keywords
      // We limit to top 4 keywords to prevent query string overflow
      const mainKeywords = keywords.slice(0, 4);
      
      const titleQueries = mainKeywords.map(k => `title:*${k}*`).join(" OR ");
      // Tag queries usually require exact match, but we can try
      const tagQueries = mainKeywords.map(k => `tag:${k}`).join(" OR ");
      
      query = `(${titleQueries}) OR (${tagQueries}) OR product_type:${category}`;
  } else {
      // Fallback: Use the category string itself as a keyword
      query = `title:*${category}* OR product_type:${category} OR tag:${category}`;
  }
  
  try {
    const products = await client.product.fetchQuery({ query, first: 250 });
    return products.map(normalizeProduct);
  } catch (e) {
    console.warn("Category search failed, falling back to empty", e);
    // As a final fallback, fetch all and filter client side (slow but safe)
    try {
        const all = await fetchAllProducts();
        return all.filter(p => p.category === category);
    } catch(err) {
        return [];
    }
  }
};

export const fetchProductByHandle = async (handle: string): Promise<Product | undefined> => {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        ${PRODUCT_FRAGMENT}
      }
    }
  `;
  try {
    const data: any = await shopifyFetch(query, { handle });
    if (!data.product) return undefined;
    return normalizeProduct(data.product);
  } catch (error) {
    console.error("Error fetching product by handle:", error);
    return undefined;
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  if (!query) return [];
  
  try {
    const lowerQuery = query.toLowerCase().trim();
    const expandedQuery = expandSearchQuery(query);
    
    // Construct Shopify query
    // 1. Full phrase match (highest priority for Shopify)
    const phraseQuery = `title:"*${query}*"`;
    
    // 2. Individual terms
    const terms = expandedQuery.split(' OR ');
    const titleQueries = terms.map(t => `title:*${t}*`).join(" OR ");
    const tagQueries = terms.map(t => `tag:${t}`).join(" OR ");
    const typeQueries = terms.map(t => `product_type:${t}`).join(" OR ");
    
    const queryString = `(${phraseQuery})^10 OR (${titleQueries}) OR (${tagQueries}) OR (${typeQueries})`;
    
    const shopifyProducts = await client.product.fetchQuery({ query: queryString, first: 100 });
    const products = shopifyProducts.map(normalizeProduct);

    // Prioritize results client-side
    return products.sort((a, b) => {
      const getScore = (p: Product) => {
        const title = p.title.toLowerCase();
        const category = p.category.toLowerCase();
        const keywords = p.metafields?.find(m => m.key === 'keywords')?.value?.toLowerCase() || "";
        
        let score = 0;
        
        // 1. Absolute Dominance: Exact or near-exact title match
        if (title === lowerQuery) score += 10000;
        else if (title.includes(lowerQuery)) score += 5000;

        // 2. High-Priority: Managed/AI-Generated Keywords match
        if (keywords.includes(lowerQuery)) score += 8000;
        
        // 3. Word-based matching (High-Level analysis)
        const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
        
        let matchingWordCount = 0;
        queryWords.forEach(qw => {
          if (title.includes(qw) || keywords.includes(qw)) matchingWordCount++;
        });

        if (queryWords.length > 0) {
          const matchRatio = matchingWordCount / queryWords.length;
          score += matchRatio * 3000;
          
          // Bonus for matching all words
          if (matchingWordCount === queryWords.length) score += 2000;
        }

        // 4. Category & Vendor match
        if (category === lowerQuery || category.includes(lowerQuery)) score += 1000;
        if (p.vendor.toLowerCase().includes(lowerQuery)) score += 500;
        
        // 5. Tag match
        if (p.tags?.some(t => t.toLowerCase().includes(lowerQuery))) score += 200;

        return score;
      };

      const scoreA = getScore(a);
      const scoreB = getScore(b);

      // If scores are equal, prefer shorter titles (usually more relevant)
      if (scoreA === scoreB) {
        return a.title.length - b.title.length;
      }

      return scoreB - scoreA;
    });
  } catch(e) {
    console.error("Search failed", e);
    return [];
  }
};

// ==========================================
// AUTH & CUSTOMER FUNCTIONS
// ==========================================

export const registerCustomer = async (email: string, password: string, firstName: string, lastName: string) => {
  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id }
        customerUserErrors { code field message }
      }
    }
  `;
  const data: any = await shopifyFetch(query, { input: { email, password, firstName, lastName } });
  if (data.customerCreate?.customerUserErrors?.length > 0) {
    throw new Error(data.customerCreate.customerUserErrors[0].message);
  }
  return data.customerCreate?.customer;
};

export const loginCustomer = async (email: string, password: string) => {
  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { code field message }
      }
    }
  `;
  const data: any = await shopifyFetch(query, { input: { email, password } });
  if (data.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
    throw new Error(data.customerAccessTokenCreate.customerUserErrors[0].message);
  }
  return data.customerAccessTokenCreate?.customerAccessToken?.accessToken;
};

export const getCustomer = async (accessToken: string): Promise<Customer> => {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
        addresses(first: 5) {
          edges {
            node {
              id
              address1
              address2
              city
              province
              country
              zip
              firstName
              lastName
              phone
            }
          }
        }
        orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              orderNumber
              processedAt
              totalPrice { amount currencyCode }
              statusUrl
              lineItems(first: 5) {
                edges {
                  node { title quantity }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data: any = await shopifyFetch(query, { customerAccessToken: accessToken });
  if (!data.customer) throw new Error("Customer not found or token expired");
  return normalizeCustomer(data.customer);
};

export const recoverCustomerPassword = async (email: string) => {
  const query = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors { code field message }
      }
    }
  `;
  await shopifyFetch(query, { email });
  return true;
};

// ==========================================
// ADDRESS MANAGEMENT
// ==========================================

export const createAddress = async (accessToken: string, address: Omit<Address, 'id'>) => {
  const query = `
    mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
      customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
        customerAddress { id }
        customerUserErrors { code field message }
      }
    }
  `;
  const data: any = await shopifyFetch(query, { customerAccessToken: accessToken, address });
  if (data.customerAddressCreate?.customerUserErrors?.length > 0) {
    throw new Error(data.customerAddressCreate.customerUserErrors[0].message);
  }
  return data.customerAddressCreate?.customerAddress;
};

export const deleteAddress = async (accessToken: string, addressId: string) => {
  const query = `
    mutation customerAddressDelete($id: ID!, $customerAccessToken: String!) {
      customerAddressDelete(id: $id, customerAccessToken: $customerAccessToken) {
        customerUserErrors { code field message }
        deletedCustomerAddressId
      }
    }
  `;
  const data: any = await shopifyFetch(query, { id: addressId, customerAccessToken: accessToken });
  if (data.customerAddressDelete?.customerUserErrors?.length > 0) {
    throw new Error(data.customerAddressDelete.customerUserErrors[0].message);
  }
  return true;
};
