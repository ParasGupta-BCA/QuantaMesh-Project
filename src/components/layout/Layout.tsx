import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ClientChatWidget } from "@/components/chat/ClientChatWidget";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  showChatWidget?: boolean;
}

export function Layout({ children, hideFooter = false, showChatWidget = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      {!hideFooter && <Footer />}
      {showChatWidget && <ClientChatWidget />}
    </div>
  );
}
