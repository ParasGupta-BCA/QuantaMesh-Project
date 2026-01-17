import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { Benefits } from "@/components/home/Benefits";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";
import { CgiShowcase } from "@/components/home/CgiShowcase";
import { LeadCapturePopup } from "@/components/leads/LeadCapturePopup";
import { Helmet } from "react-helmet-async";

const Index = () => {
  // Comprehensive structured data for E-E-A-T and AI discovery
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": "https://www.quantamesh.store/#organization",
        "name": "Quanta Mesh",
        "alternateName": ["QuantaMesh", "Quanta Mesh App Publishing", "Quanta Mesh CGI"],
        "url": "https://www.quantamesh.store",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.quantamesh.store/android-chrome-512x512.png",
          "width": 512,
          "height": 512
        },
        "image": "https://www.quantamesh.store/Service%201.png",
        "description": "Quanta Mesh is a trusted professional service specializing in Android app publishing to Google Play Store and CGI video production. We help developers and businesses launch their apps without needing their own developer console account, offering fast, affordable, and policy-compliant submissions.",
        "priceRange": "$20-$100",
        "currenciesAccepted": "USD",
        "paymentAccepted": ["Credit Card", "PayPal", "Stripe"],
        "telephone": "+1-000-000-0000",
        "email": "parasgupta4494@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "28.6139",
          "longitude": "77.2090"
        },
        "areaServed": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates",
            "latitude": 0,
            "longitude": 0
          },
          "geoRadius": "40075000"
        },
        "serviceArea": {
          "@type": "Place",
          "name": "Worldwide"
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": "120",
          "ratingCount": "120"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "App Publishing Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Android App Publishing",
                "description": "Complete Google Play Store app publishing service including metadata optimization, screenshot upload, policy compliance check, and post-publish support",
                "provider": {"@id": "https://www.quantamesh.store/#organization"}
              },
              "price": "25.00",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": "2025-12-31"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "CGI Video Ads",
                "description": "Hyper-realistic 3D CGI video advertisements for social media marketing and brand promotion",
                "provider": {"@id": "https://www.quantamesh.store/#organization"}
              },
              "priceSpecification": {
                "@type": "PriceSpecification",
                "price": "Contact for quote",
                "priceCurrency": "USD"
              }
            }
          ]
        },
        "sameAs": [
          "https://www.instagram.com/quantamesh/"
        ],
        "knowsAbout": [
          "Android App Development",
          "Google Play Store Publishing",
          "App Store Optimization (ASO)",
          "Mobile App Marketing",
          "Play Store Policy Compliance",
          "APK and AAB File Publishing",
          "CGI Video Production",
          "3D Visual Effects",
          "Social Media Advertising"
        ],
        "slogan": "Publish Your Android App to Google Play - Fast, Affordable, Hassle-Free"
      },
      {
        "@type": "Service",
        "@id": "https://www.quantamesh.store/#service-publishing",
        "name": "Android App Publishing Service",
        "serviceType": "App Publishing",
        "provider": {"@id": "https://www.quantamesh.store/#organization"},
        "description": "Professional Android app publishing service for Google Play Store. We handle everything from metadata entry, screenshot uploads, policy compliance, to post-publish support. Perfect for indie developers who don't want to pay for their own Google Play Console account.",
        "offers": {
          "@type": "Offer",
          "price": "25.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "termsOfService": "https://www.quantamesh.store/terms-of-service",
        "areaServed": "Worldwide"
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.quantamesh.store/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Can I publish my Android app without a Google Play Console account?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! With Quanta Mesh, you don't need to create or pay for a Google Play Console developer account. We publish your app using our verified professional developer account for a one-time fee of just $25. This saves you the $25 registration fee and the hassle of identity verification."
            }
          },
          {
            "@type": "Question",
            "name": "How long does it take to get my app published on Google Play Store?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We typically submit your app within 24-48 hours after receiving all required assets (APK/AAB file, screenshots, app icon, and descriptions). Google's review process usually takes an additional 1-7 days depending on the app complexity and current review queue."
            }
          },
          {
            "@type": "Question",
            "name": "What happens if Google rejects my app?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "If your app is rejected due to metadata, screenshots, or other fixable policy issues, we will fix the problems and re-submit your app for FREE. If the rejection is due to core policy violations (like malware, explicit content, or copyright issues), we'll provide guidance on what needs to change but cannot guarantee publication."
            }
          },
          {
            "@type": "Question",
            "name": "Is my app code and data safe with Quanta Mesh?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. We only use your APK/AAB file for the upload process. We never modify your source code or access your app's internal data. All uploaded files are securely stored and permanently deleted from our servers within 30 days after publication. We use Stripe for secure payment processing."
            }
          },
          {
            "@type": "Question",
            "name": "Why should I use Quanta Mesh instead of creating my own developer account?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Creating a Google Play Developer account costs $25 and requires identity verification which can take days or weeks. With Quanta Mesh, you pay the same $25 but we handle all the technical setup, metadata optimization, policy compliance checks, and submission process for you. It's faster, easier, and you get professional expertise included."
            }
          },
          {
            "@type": "Question",
            "name": "What services does Quanta Mesh offer besides app publishing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "In addition to Android app publishing, Quanta Mesh offers professional CGI video ad production. We create hyper-realistic 3D visual effects and CGI advertisements for social media marketing, perfect for brands wanting viral-ready content that captures attention."
            }
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://www.quantamesh.store/#webpage",
        "url": "https://www.quantamesh.store",
        "name": "Publish Android App to Google Play | $25 Service | Quanta Mesh",
        "description": "Don't have a Developer Console? We publish your Android app to Google Play Store for just $25. No account needed. Fast approval, policy compliance, and lifetime support.",
        "isPartOf": {"@id": "https://www.quantamesh.store/#website"},
        "about": {"@id": "https://www.quantamesh.store/#organization"},
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": "https://www.quantamesh.store/Service%201.png"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.quantamesh.store"
            }
          ]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://www.quantamesh.store/#website",
        "url": "https://www.quantamesh.store",
        "name": "Quanta Mesh",
        "description": "Professional Android app publishing and CGI video production services",
        "publisher": {"@id": "https://www.quantamesh.store/#organization"},
        "inLanguage": "en-US"
      }
    ]
  };

  return (
    <Layout>
      <LeadCapturePopup />
      <Helmet>
        <title>Publish Android App to Google Play | $25 Service | Quanta Mesh</title>
        <meta name="description" content="Publish your Android app to Google Play Store without a developer account. For just $25, we handle metadata, screenshots, and policy compliance. 100% Secure & Fast. Trusted by 100+ developers." />
        <meta name="keywords" content="publish android app, google play store upload, no developer account needed, cheap app publishing, play store submission service, android app launch, quanta mesh, app publishing service, google play console alternative" />
        <link rel="canonical" href="https://www.quantamesh.store" />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Quanta Mesh" />
        <meta name="publisher" content="Quanta Mesh" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main>
        <Hero />
        <Benefits />
        <CgiShowcase />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
    </Layout>
  );
};

export default Index;
