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
            onClick: () => onTabChange("dashboard") // Default to orders or a specific dashboard tab if available
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
            "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-950 w-full flex-1 mx-auto overflow-hidden",
            "h-screen"
        )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar pb-2">
                        <div className="flex flex-col">
                            <Link
                                to="/"
                                className="flex items-center gap-2 py-4 pl-1"
                            >
                                <div className="h-7 w-7 rounded-xl bg-primary flex items-center justify-center text-white flex-shrink-0">
                                    <span className="font-bold text-lg select-none">Q</span>
                                </div>
                                <span className={cn(
                                    "font-bold text-xl text-neutral-800 dark:text-neutral-100 whitespace-pre duration-200",
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
                                    <div key={idx} onClick={() => {
                                        link.onClick();
                                        if (window.innerWidth < 768) {
                                            setOpen(false);
                                        }
                                    }} className="flex items-center justify-between w-full cursor-pointer group relative">
                                        <SidebarLink
                                            link={{
                                                label: link.label,
                                                href: "#",
                                                icon: (
                                                    <div className={cn(
                                                        "relative p-1 rounded-md transition-all duration-200",
                                                        isActive ? "text-primary bg-primary/10" : "text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200"
                                                    )}>
                                                        {link.icon}
                                                        {link.count !== undefined && link.count > 0 && !open && (
                                                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white dark:border-neutral-900" />
                                                        )}
                                                    </div>
                                                ),
                                            }}
                                            className={cn(
                                                "rounded-xl transition-all duration-200 px-2 py-2.5 flex-1",
                                                isActive
                                                    ? "bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700/50"
                                                    : "hover:bg-gray-100 dark:hover:bg-neutral-800/50"
                                            )}
                                        />
                                        {open && link.count !== undefined && link.count > 0 && (
                                            <div className={cn(
                                                "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
                                                isActive ? "text-primary" : "text-neutral-500"
                                            )}>
                                                <Badge variant="secondary" className={cn(
                                                    "rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm",
                                                    isActive
                                                        ? "bg-primary text-white border-transparent"
                                                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-transparent group-hover:bg-neutral-300 dark:group-hover:bg-neutral-600 transition-colors"
                                                )}>
                                                    {link.count}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                            <SidebarLink
                                link={{
                                    label: user?.email ? user.email.split('@')[0] : "User",
                                    href: "#",
                                    icon: (
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-neutral-800">
                                            {user?.email?.[0].toUpperCase()}
                                        </div>
                                    )
                                }}
                            />
                            <div onClick={() => signOut()} className="cursor-pointer group">
                                <SidebarLink
                                    link={{
                                        label: "Logout",
                                        href: "#",
                                        icon: <LogOut className="h-5 w-5 flex-shrink-0 text-neutral-400 group-hover:text-red-500 transition-colors" />
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>
            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden relative">
                {children}
            </div>
        </div>
    );
}
