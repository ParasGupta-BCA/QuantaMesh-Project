import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
    title?: string;
}

export function AdminHeader({ title = "Dashboard" }: AdminHeaderProps) {
    return (
        <div className="w-full flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 sticky top-0 z-20 transition-all duration-300">
            <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400">
                    {title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Admin</span>
                    <span>/</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{title}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 bg-neutral-100/50 dark:bg-neutral-800/50 border-transparent focus:bg-background focus:border-primary/20 transition-all rounded-full h-9 text-sm"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary transition-colors">
                        <Bell className="h-5 w-5" />
                    </Button>
                    {/* Profile trigger could go here if not in sidebar, but we put it in sidebar */}
                </div>
            </div>
        </div>
    );
}
}
