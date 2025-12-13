import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { Benefits } from "@/components/home/Benefits";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <Layout>
      <Helmet>
        <title>Quanta Mesh - Publish Your Android App to Google Play | $25</title>
        <meta name="description" content="Professional Android app publishing service. We publish your app to Google Play Console for just $25. Fast submission, metadata optimization, and policy compliance included." />
        <meta name="keywords" content="android app publishing, google play console, app store submission, publish android app, app publishing service, deploy android app, google play developer account" />
        <link rel="canonical" href="https://quantamesh.com" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "ProfessionalService",
                  "name": "Quanta Mesh",
                  "url": "https://quantamesh.com",
                  "logo": "https://quantamesh.com/android-chrome-512x512.png",
                  "image": "https://quantamesh.com/Service%201.png",
                  "description": "Professional Android app publishing service for Google Play Store.",
                  "priceRange": "$25",
                  "currenciesAccepted": "USD",
                  "openingHoursSpecification": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday"
                    ],
                    "opens": "00:00",
                    "closes": "23:59"
                  }
                },
                {
                  "@type": "Product",
                  "name": "Android App Publishing Service",
                  "description": "Complete Android app publishing service to Google Play Console. Includes metadata optimization, graphic assets review, and policy compliance check.",
                  "image": "https://quantamesh.com/Service%201.png",
                  "brand": {
                    "@type": "Brand",
                    "name": "Quanta Mesh"
                  },
                  "offers": {
                    "@type": "Offer",
                    "url": "https://quantamesh.com/order",
                    "priceCurrency": "USD",
                    "price": "25.00",
                    "availability": "https://schema.org/InStock",
                    "priceValidUntil": "2025-12-31"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "120"
                  }
                }
              ]
            }
          `}
        </script>
      </Helmet>
      
      <Hero />
      <Benefits />
      <Testimonials />
      <FAQ />
      <CTA />
    </Layout>
  );
};

export default Index;
