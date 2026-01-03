import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Mail,
    Calendar,
    ChevronUp,
    ChevronDown,
    FileText,
    Tag,
    Link as LinkIcon,
    ExternalLink,
    Loader2,
    DollarSign,
    Box,
    Globe,
    Smartphone,
    FolderOpen
} from "lucide-react";
import { Order } from "@/types/admin";
import { OrderFilesList } from "./OrderFileDownload";

interface AdminOrdersProps {
    orders: Order[];
    updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
    loading?: boolean;
}

const orderStatuses = [
    { value: "pending", label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    { value: "in_progress", label: "In Progress", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { value: "submitted", label: "Submitted", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { value: "published", label: "Published", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    { value: "rejected", label: "Rejected", color: "bg-red-500/10 text-red-500 border-red-500/20" },
    { value: "completed", label: "Completed", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
];

const addOnLabels: Record<string, string> = {
    "feature-graphic": "Feature Graphic Design",
    "copywriting": "Store Listing Copywriting",
    "expedited": "Expedited Delivery",
    "screenshots": "Screenshot Enhancement",
    "source-code": "Source Code",
};

export function AdminOrders({ orders, updateOrderStatus, loading }: AdminOrdersProps) {
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    const toggleOrderExpand = (orderId: string) => {
        setExpandedOrders((prev) => {
            const next = new Set(prev);
            if (next.has(orderId)) {
                next.delete(orderId);
            } else {
                next.add(orderId);
            }
            return next;
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = orderStatuses.find(s => s.value === status) ||
            { label: status, color: "bg-secondary text-secondary-foreground" };

        return (
            <Badge variant="outline" className={`${statusConfig.color} border font-medium px-2.5 py-0.5 rounded-full uppercase text-[10px] tracking-wider`}>
                {statusConfig.label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <Card className="glass-card border-dashed">
                <CardContent className="py-20 flex flex-col items-center justify-center text-center text-muted-foreground gap-4">
                    <Box className="h-12 w-12 opacity-20" />
                    <p>No orders found in the database.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 animate-slide-up">
            {orders.map((order, index) => {
                const isExpanded = expandedOrders.has(order.id);
                return (
                    <Card
                        key={order.id}
                        className={`glass-card overflow-hidden transition-all duration-300 border-border/40 hover:border-primary/20 ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <CardContent className="p-0">
                            {/* Order Header */}
                            <div
                                className="p-4 md:p-6 cursor-pointer hover:bg-secondary/20 transition-colors"
                                onClick={() => toggleOrderExpand(order.id)}
                            >
                                <div className="flex flex-col md:flex-row gap-4 justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between md:justify-start gap-3">
                                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                                <Smartphone className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg text-foreground truncate">{order.app_name}</h3>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="h-3.5 w-3.5 opacity-70" />
                                                        {order.customer_name}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 opacity-70" />
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:block md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-border/30">
                                        <div className="md:mb-1">
                                            <span className="text-xs text-muted-foreground mr-2 md:mr-0 md:block uppercase tracking-wider font-medium opacity-70">Total Price</span>
                                            <span className="font-bold text-lg md:text-xl text-foreground flex items-center md:justify-end gap-1">
                                                <DollarSign className="h-4 w-4 text-primary" />
                                                {order.total_price}
                                            </span>
                                        </div>
                                        <div className="hidden md:flex justify-end mt-2">
                                            {isExpanded ?
                                                <ChevronUp className="h-5 w-5 text-muted-foreground/50" /> :
                                                <ChevronDown className="h-5 w-5 text-muted-foreground/50" />
                                            }
                                        </div>
                                    </div>

                                    {/* Mobile Chevron */}
                                    <div className="md:hidden flex justify-center -mb-2">
                                        {isExpanded ?
                                            <ChevronUp className="h-5 w-5 text-muted-foreground/50" /> :
                                            <ChevronDown className="h-5 w-5 text-muted-foreground/50" />
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Order Details */}
                            {isExpanded && (
                                <div className="border-t border-border/30 bg-secondary/5 anim-expand-height">
                                    {/* Action Bar */}
                                    <div className="p-4 md:px-6 md:py-4 bg-background/50 backdrop-blur-sm border-b border-border/30 flex flex-col sm:flex-row gap-3 items-center sticky top-0 z-10">
                                        <div className="w-full sm:w-auto flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                                            <Select
                                                value={order.status}
                                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                                            >
                                                <SelectTrigger className="w-full sm:w-[180px] h-9 bg-background/50 border-border/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {orderStatuses.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${status.color.split(" ")[0]}`} />
                                                                {status.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-full text-right sm:w-auto sm:ml-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full sm:w-auto gap-2 h-9 bg-background/50 border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`mailto:${order.email}`, "_blank");
                                                }}
                                            >
                                                <Mail className="h-4 w-4" />
                                                Contact Client
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 md:p-6 space-y-8">
                                        {/* App Information Section */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="flex items-center gap-2 text-sm font-semibold text-primary/80 uppercase tracking-widest">
                                                    <FileText className="h-4 w-4" /> App Details
                                                </h4>

                                                <div className="bg-background/40 rounded-xl border border-border/30 p-5 space-y-6">
                                                    <div>
                                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">Short Description</label>
                                                        <p className="text-sm leading-relaxed text-foreground/90">{order.short_description}</p>
                                                    </div>

                                                    {order.full_description && (
                                                        <div>
                                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">Full Description</label>
                                                            <div className="text-sm leading-relaxed text-muted-foreground bg-secondary/10 p-3 rounded-lg border border-border/20 whitespace-pre-wrap max-h-[200px] overflow-y-auto scrollbar-thin">
                                                                {order.full_description}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4">
                                                        {order.category && (
                                                            <div>
                                                                <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5 flex items-center gap-1">
                                                                    <Tag className="h-3 w-3" /> Category
                                                                </label>
                                                                <Badge variant="secondary" className="font-normal capitalize px-3 py-1 bg-secondary/50">
                                                                    {order.category}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5 flex items-center gap-1">
                                                                <Mail className="h-3 w-3" /> Email
                                                            </label>
                                                            <span className="text-sm truncate block" title={order.email}>{order.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="flex items-center gap-2 text-sm font-semibold text-primary/80 uppercase tracking-widest">
                                                    <LinkIcon className="h-4 w-4" /> Resources & Add-ons
                                                </h4>

                                                <div className="bg-background/40 rounded-xl border border-border/30 p-5 space-y-6 h-full">
                                                    <div className="space-y-3">
                                                        {(order.privacy_policy_url || order.support_url) ? (
                                                            <div className="grid gap-3">
                                                                {order.privacy_policy_url && (
                                                                    <a
                                                                        href={order.privacy_policy_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group"
                                                                    >
                                                                        <div className="p-2 rounded bg-background shadow-sm group-hover:text-primary transition-colors">
                                                                            <Globe className="h-4 w-4" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-xs font-medium text-muted-foreground group-hover:text-primary/80">Privacy Policy</div>
                                                                            <div className="text-sm truncate text-foreground">{order.privacy_policy_url}</div>
                                                                        </div>
                                                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                    </a>
                                                                )}

                                                                {order.support_url && (
                                                                    <a
                                                                        href={order.support_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group"
                                                                    >
                                                                        <div className="p-2 rounded bg-background shadow-sm group-hover:text-primary transition-colors">
                                                                            <Globe className="h-4 w-4" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-xs font-medium text-muted-foreground group-hover:text-primary/80">Support URL</div>
                                                                            <div className="text-sm truncate text-foreground">{order.support_url}</div>
                                                                        </div>
                                                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-muted-foreground italic">No external links provided.</div>
                                                        )}
                                                    </div>

                                                    {/* Uploaded Files Section */}
                                                    <div className="pt-4 border-t border-border/30">
                                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-3 flex items-center gap-1.5">
                                                            <FolderOpen className="h-3 w-3" /> Uploaded Files
                                                        </label>
                                                        <OrderFilesList
                                                            apkFilePath={order.apk_file_path}
                                                            iconFilePath={order.icon_file_path}
                                                            featureGraphicPath={order.feature_graphic_path}
                                                            screenshotPaths={order.screenshot_paths}
                                                        />
                                                    </div>

                                                    <div className="pt-4 border-t border-border/30">
                                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-3">Selected Add-ons</label>
                                                        {order.add_ons && order.add_ons.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {order.add_ons.map((addon) => (
                                                                    <Badge key={addon} variant="secondary" className="glass-card border-none px-3 py-1.5 text-xs font-normal">
                                                                        {addOnLabels[addon] || addon}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground italic">No add-ons selected.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <span className="text-[10px] font-mono text-muted-foreground/40 select-all">ID: {order.id}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
