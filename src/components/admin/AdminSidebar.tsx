import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
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
    Mail,
    LogOut,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminStatCounts {
    orders: number;
    messages: number;
    reviews: number;
    leads: number;
    videos: number;
}

interface AdminSidebarProps {
    counts: AdminStatCounts;
    activeTab: string;
    onTabChange: (tab: string) => void;
    children?: React.ReactNode;
}

export function AdminSidebar({ counts, activeTab, onTabChange, children }: AdminSidebarProps) {
    const [open, setOpen] = useState(false);
    const { signOut, user } = useAuth();

    const links = [
        {
            label: "Dashboard",
            value: "dashboard", // Assuming there might be a dashboard home
            icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("orders") // Default to orders or a specific dashboard tab if available
        },
        {
            label: "Orders",
            value: "orders",
            icon: <Package className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("orders"),
            count: counts.orders
        },
        {
            label: "Messages",
            value: "messages",
            icon: <MessageSquare className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("messages"),
            count: counts.messages
        },
        {
            label: "Live Chat",
            value: "chat",
            icon: <MessagesSquare className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("chat")
        },
        {
            label: "Reviews",
            value: "reviews",
            icon: <Star className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("reviews"),
            count: counts.reviews
        },
        {
            label: "Leads",
            value: "leads",
            icon: <Users className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("leads"),
            count: counts.leads
        },
        {
            label: "Analytics",
            value: "email-analytics",
            icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("email-analytics")
        },
        {
            label: "Videos",
            value: "videos",
            icon: <Video className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("videos"),
            count: counts.videos
        },
        {
            label: "Blog",
            value: "blog",
            icon: <FileText className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("blog")
        },
        {
            label: "Outreach",
            value: "cold-outreach",
            icon: <Mail className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("cold-outreach")
        },
        {
            label: "AI Settings",
            value: "ai-settings",
            icon: <Bot className="h-5 w-5 flex-shrink-0" />,
            onClick: () => onTabChange("ai-settings")
        },
    ];

    return (
        <div className={cn(
            "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
            "h-screen"
        )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="flex flex-col">
                            <Link
                                to="/"
                                className="flex items-center gap-2 py-4 pl-1"
                            >
                                <div className="h-7 w-7 rounded-lg bg-black dark:bg-white flex-shrink-0" />
                                <span className={cn(
                                    "font-bold text-lg text-black dark:text-white whitespace-pre duration-200",
                                    !open && "opacity-0 hidden"
                                )}>
                                    QuantaMesh
                                </span>
                            </Link>
                        </div>

                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => {
                                const isActive = activeTab === link.value;
                                return (
                                    <div key={idx} onClick={link.onClick} className="cursor-pointer">
                                        <SidebarLink
                                            link={{
                                                label: link.label,
                                                href: "#",
                                                icon: (
                                                    <div className={cn("relative", isActive ? "text-primary" : "text-neutral-700 dark:text-neutral-200")}>
                                                        {link.icon}
                                                        {link.count !== undefined && link.count > 0 && !open && (
                                                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                                                        )}
                                                    </div>
                                                ),
                                            }}
                                            className={cn(
                                                "rounded-xl transition-all duration-200",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "hover:bg-gray-100 dark:hover:bg-neutral-800"
                                            )}
                                        />
                                        {open && link.count !== undefined && link.count > 0 && isActive && (
                                            <div className="ml-auto">
                                                <Badge variant="secondary" className=" bg-primary/20 text-primary">{link.count}</Badge>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                            <SidebarLink
                                link={{
                                    label: user?.email || "User",
                                    href: "#",
                                    icon: (
                                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {user?.email?.[0].toUpperCase()}
                                        </div>
                                    )
                                }}
                            />
                            <div onClick={() => signOut()} className="cursor-pointer">
                                <SidebarLink
                                    link={{
                                        label: "Logout",
                                        href: "#",
                                        icon: <LogOut className="h-5 w-5 flex-shrink-0 text-red-500" />
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>
            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
}
