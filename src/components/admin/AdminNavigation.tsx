import { 
  Package, 
  MessageSquare, 
  MessagesSquare, 
  LayoutDashboard, 
  Star, 
  Users, 
  BarChart3, 
  Video, 
  FileText, 
  Bot, 
  Mail 
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminStatCounts {
  orders: number;
  messages: number;
  reviews: number;
  leads: number;
  videos: number;
}

interface AdminNavigationProps {
  counts: AdminStatCounts;
}

export function AdminNavigation({ counts }: AdminNavigationProps) {
  const navItems = [
    { value: "orders", icon: Package, label: "Orders", count: counts.orders },
    { value: "messages", icon: MessageSquare, label: "Messages", count: counts.messages },
    { value: "chat", icon: MessagesSquare, label: "Live Chat", count: 0 }, // Live chat usually handles its own count or is real-time
    { value: "reviews", icon: Star, label: "Reviews", count: counts.reviews },
    { value: "leads", icon: Users, label: "Leads", count: counts.leads },
    { value: "email-analytics", icon: BarChart3, label: "Analytics", count: 0 },
    { value: "videos", icon: Video, label: "Videos", count: counts.videos },
    { value: "blog", icon: FileText, label: "Blog", count: 0 },
    { value: "cold-outreach", icon: Mail, label: "Outreach", count: 0 },
    { value: "ai-settings", icon: Bot, label: "AI Settings", count: 0 },
  ];

  return (
    <div className="w-full sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm transition-all duration-300">
      <div className="w-full overflow-x-auto scrollbar-hide py-2 px-1">
        <TabsList className="h-auto bg-transparent p-1 gap-2 flex w-max mx-auto justify-start md:justify-center">
            {navItems.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
              "relative flex flex-col md:flex-row items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300",
              "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm",
              "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 md:h-4 md:w-4" />
              <span className="hidden md:inline">{item.label}</span>
              {/* Mobile label visible only when active? Or always? Let's keep icons prominent on mobile */}
              <span className="md:hidden text-[10px]">{item.label}</span>
              
              {item.count > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 px-1.5 min-w-[1.25rem] text-[10px] pointer-events-none bg-primary/20 text-primary border-none hidden md:flex"
              >
                {item.count}
              </Badge>
              )}
              {item.count > 0 && (
                <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-primary md:hidden" />
              )}
            </TabsTrigger>
            ))}
        </TabsList>
      </div>
    </div>
  );
}
