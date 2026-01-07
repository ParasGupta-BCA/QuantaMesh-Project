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
  return (
    <Layout>
      <LeadCapturePopup />
      <Helmet>
        <title>Publish Android App to Google Play | $25 Service | Quanta Mesh</title>
        <meta name="description" content="Publish your Android app to Google Play Store without a developer account. For just $25, we handle metadata, screenshots, and policy compliance. 100% Secure & Fast." />
        <meta name="keywords" content="publish android app, google play store upload, no developer account needed, cheap app publishing, play store submission service, android app launch" />
        <link rel="canonical" href="https://www.quantamesh.store" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "ProfessionalService",
                  "name": "Quanta Mesh",
                  "url": "https://www.quantamesh.store",
                  "logo": "https://www.quantamesh.store/android-chrome-512x512.png",
                  "image": "https://www.quantamesh.store/Service%201.png",
                  "description": "Professional Android app publishing service for Google Play Store. We help developers publish apps without a console account.",
                  "priceRange": "$25",
                  "currenciesAccepted": "USD",
                  "openingHoursSpecification": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "00:00",
                    "closes": "23:59"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "120"
                  }
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "Can I publish my app without a Google Play Console account?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes! With Quanta Mesh, you don't need to pay $25 for a console account. We publish your app using our professional developer account for a one-time fee of $25."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How long does it take to get my app published?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "We typically submit your app within 24-48 hours after receiving all required assets. Google's review process usually takes an additional 1-3 days."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What happens if my app gets rejected?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "If the rejection is due to metadata or fixable policy issues, we will fix it and re-submit for FREE. If the app violates core policies (violance, malware), we cannot publish it."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Is this service safe for my app code?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Absolutely. We only use your APK/AAB file for upload purposes. We do not modify your source code, and all data is deleted from our servers after 30 days."
                      }
                    }
                  ]
                }
              ]
            }
          `}
        </script>
      </Helmet>

      <Hero />
      <Benefits />
      <CgiShowcase />
      <Testimonials />
      <FAQ />
      <CTA />
    </Layout>
  );
};

export default Index;
