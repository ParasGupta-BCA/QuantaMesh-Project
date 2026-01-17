import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product" | "service";
  structuredData?: object;
  noindex?: boolean;
}

/**
 * SEO Head Component
 * Provides consistent SEO meta tags across all pages
 * Optimized for both traditional search engines and AI discovery
 */
export function SEOHead({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = "https://www.quantamesh.store/Service%201.png",
  ogType = "website",
  structuredData,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title.includes("Quanta Mesh") ? title : `${title} | Quanta Mesh`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta 
        name="robots" 
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} 
      />
      
      {/* Author & Publisher */}
      <meta name="author" content="Quanta Mesh" />
      <meta name="publisher" content="Quanta Mesh" />
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${title} - Quanta Mesh`} />
      <meta property="og:site_name" content="Quanta Mesh" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@quantamesh" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbData(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Generate Service structured data
 */
export function generateServiceData({
  name,
  description,
  price,
  currency = "USD",
  url,
}: {
  name: string;
  description: string;
  price: string;
  currency?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": "Quanta Mesh",
      "url": "https://www.quantamesh.store"
    },
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": "https://schema.org/InStock",
      "url": url
    },
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    }
  };
}