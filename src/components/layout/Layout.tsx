import { useState, ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ClientChatWidget } from "@/components/chat/ClientChatWidget";
import { AnnouncementBar } from "./AnnouncementBar";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  showChatWidget?: boolean;
}

export function Layout({ children, hideFooter = false, showChatWidget = true }: LayoutProps) {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <AnnouncementBar onDismiss={() => setIsBannerVisible(false)} />
      </div>
      <Navbar isBannerVisible={isBannerVisible} />
      <main className={`flex-1 transition-all duration-300 ${isBannerVisible ? "pt-28 md:pt-32" : "pt-16 md:pt-20"}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      {showChatWidget && <ClientChatWidget />}
    </div>
  );
}
