import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  // App Publishing
  {
    question: "How long does the app publishing process take?",
    answer: "Once we receive all your assets (APK/AAB, screenshots, icons, and app details), we typically submit your app within 24-48 hours. Google's review process usually takes an additional 1-7 days."
  },
  {
    question: "What do I need to provide for app publishing?",
    answer: "You'll need to provide: your app file (APK or AAB), app icon (512x512 PNG), feature graphic (1024x500), at least 2 screenshots per device type, app title, short and full descriptions, privacy policy URL, and your contact information."
  },
  {
    question: "Is my app guaranteed to be approved on Google Play?",
    answer: "While we ensure your submission meets all Google Play requirements and policies, final approval is at Google's discretion. We perform thorough policy checks before submission and offer free re-submission if rejected for fixable issues."
  },
  {
    question: "What if Google rejects my app?",
    answer: "We review every app for policy compliance before submission. If Google rejects your app for issues we can fix (metadata, screenshots, etc.), we'll resubmit for free. If the rejection is due to app content or functionality issues, we'll provide guidance on what needs to change."
  },
  // CGI Ads
  {
    question: "What kind of CGI ads do you create?",
    answer: "We create hyper-realistic 3D CGI video advertisements — product showcases, brand films, social media reels, and more. Our CGI ads are designed to stop the scroll and drive engagement on platforms like Instagram, TikTok, and YouTube."
  },
  {
    question: "How long does a CGI ad project take?",
    answer: "Timelines vary based on complexity. A standard CGI product ad typically takes 5-10 business days from brief to final delivery. We'll give you a specific timeline after reviewing your project requirements."
  },
  // Website & App Dev
  {
    question: "Do you build websites for all types of businesses?",
    answer: "Yes! We build websites for all kinds of businesses — from simple landing pages and portfolios to full e-commerce stores and business portals. Every website is custom-designed, fully responsive, and SEO-optimized."
  },
  {
    question: "Can you develop both Android and iOS apps?",
    answer: "Absolutely. We develop cross-platform mobile apps that work on both Android and iOS, as well as native apps for either platform. We also build web apps and full-stack solutions depending on your needs."
  },
  {
    question: "How do I get started with a website or app project?",
    answer: "Simply reach out via our Contact page or chat with us. We'll schedule a free discovery call to understand your requirements, then provide a detailed proposal with timeline and pricing."
  },
];

export function FAQ() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our services — app publishing, CGI ads, website development, and app development.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-semibold pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
