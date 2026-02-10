import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
    title?: string;
}

export function AdminHeader({ title = "Dashboard" }: AdminHeaderProps) {
    return (
        <div className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-20">
            <div>
                <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">{title}</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Welcome to your admin panel</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block w-64">
                    {/* Placeholder for Search */}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                    </Button>
                    {/* Profile trigger could go here if not in sidebar, but we put it in sidebar */}
                </div>
            </div>
        </div>
    );
}
