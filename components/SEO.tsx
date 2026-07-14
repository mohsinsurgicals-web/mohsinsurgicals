import React from 'react';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '../constants';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
  productData?: {
    name: string;
    image: string;
    description: string;
    sku?: string;
    brand: string;
    price: number;
    currency: string;
    availability: string;
    ratingValue?: string | number;
    reviewCount?: string | number;
  };
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords,
  canonical, 
  ogImage,
  ogType = 'website',
  productData
}) => {
  const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  const siteUrl = window.location.origin;
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : window.location.href;

  // Enhance keywords and descriptions dynamically for medical/rental products
  let enhancedKeywords = keywords || '';
  let enhancedDescription = description || '';
  
  const lowerTitle = title?.toLowerCase() || '';
  const isRegionalProduct = 
    lowerTitle.includes('oxygen') || 
    lowerTitle.includes('bipap') || 
    lowerTitle.includes('cpap') || 
    lowerTitle.includes('rental') || 
    lowerTitle.includes('wheelchair') || 
    lowerTitle.includes('hospital bed') ||
    lowerTitle.includes('monitor') ||
    lowerTitle.includes('medical');

  if (isRegionalProduct) {
    const regionalAdditions = [
      "oxygen concentrator rental Hyderabad",
      "medical equipment delivery Bangalore",
      "BiPAP machine rental Chennai",
      "medical equipment supplier Delhi NCR",
      "hospital bed rental Mumbai",
      "medical equipment on rent",
      "Mohsin Surgicals India"
    ];
    enhancedKeywords = enhancedKeywords 
      ? `${enhancedKeywords}, ${regionalAdditions.join(', ')}`
      : regionalAdditions.join(', ');

    if (enhancedDescription && !enhancedDescription.includes('Hyderabad')) {
      enhancedDescription = `${enhancedDescription} Available for fast home delivery, professional setup, and rental options in Hyderabad, Bangalore, Chennai, Mumbai, and Delhi NCR.`;
    }
  }

  const jsonLd = productData ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productData.name,
    "image": [productData.image],
    "description": productData.description,
    "sku": productData.sku,
    "brand": {
      "@type": "Brand",
      "name": productData.brand
    },
    "offers": {
      "@type": "Offer",
      "url": fullCanonical,
      "priceCurrency": productData.currency,
      "price": productData.price,
      "availability": productData.availability === 'InStock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": productData.ratingValue?.toString() || "4.8",
      "reviewCount": productData.reviewCount?.toString() || "85"
    }
  } : null;

  const faqJsonLd = ogType === 'product' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Do you provide home delivery and setup for ${title || 'this medical equipment'}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, Mohsin Surgicals provides professional home delivery, installation, and live demonstration support for ${title || 'our medical equipment'} across major cities including Hyderabad, Bangalore, Chennai, Mumbai, and Delhi NCR.`
        }
      },
      {
        "@type": "Question",
        "name": `Are rental options available for ${title || 'this equipment'}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, select critical care and mobility items like oxygen concentrators, CPAP/BiPAP machines, and hospital beds are available for flexible monthly rentals.`
        }
      },
      {
        "@type": "Question",
        "name": "Can I claim GST input tax credit on my purchase?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Mohsin Surgicals is a registered tax payer and provides a valid GST invoice with all institutional and retail orders so you can claim 12% to 18% input tax credit."
        }
      }
    ]
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      {enhancedDescription && <meta name="description" content={enhancedDescription} />}
      {enhancedKeywords && <meta name="keywords" content={enhancedKeywords} />}
      <link rel="canonical" href={fullCanonical} />

      {/* JSON-LD Structured Data for Google SERP Domination */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      {faqJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      {enhancedDescription && <meta property="og:description" content={enhancedDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:url" content={fullCanonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {enhancedDescription && <meta name="twitter:description" content={enhancedDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export default SEO;
