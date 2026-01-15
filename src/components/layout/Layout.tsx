import { useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ClientChatWidget } from "@/components/chat/ClientChatWidget";
import { AnnouncementBar } from "./AnnouncementBar";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  showChatWidget?: boolean;
  hideAnnouncement?: boolean;
}

export function Layout({ children, hideFooter = false, showChatWidget = true, hideAnnouncement = false }: LayoutProps) {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const location = useLocation();
  
  // Hide announcement bar on portfolio page or when explicitly hidden
  const shouldShowBanner = isBannerVisible && !hideAnnouncement && location.pathname !== '/portfolio';

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60]">
          <AnnouncementBar onDismiss={() => setIsBannerVisible(false)} />
        </div>
      )}
      <Navbar isBannerVisible={shouldShowBanner} />
      <main className={`flex-1 transition-all duration-300 ${shouldShowBanner ? "pt-28 md:pt-32" : "pt-16 md:pt-20"}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      {showChatWidget && <ClientChatWidget />}
    </div>
  );
}
