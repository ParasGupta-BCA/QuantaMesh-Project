import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, LogIn, UserPlus, Shield, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blog", path: "/blog" },
  { name: "Order", path: "/order" },
  { name: "Contact", path: "/contact" },
  { name: "Chat", path: "/chat", badge: "New" },
];

interface NavbarProps {
  isBannerVisible?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Navbar({ isBannerVisible = false, onOpenChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useAdmin();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync open state with parent
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300",
        isBannerVisible ? "top-10 md:top-12" : "top-0",
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold flex-shrink-0 group"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden shrink-0">
              <img src="/logo.png" alt="QuantaMesh" className="w-full h-full object-cover" />
            </div>
            <span className="text-foreground text-xl font-bold tracking-tight">Quanta Mesh</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-background/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-border/40 shadow-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  location.pathname === link.path
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {link.name}
                {link.badge && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold px-1 ring-2 ring-background">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2 pl-2 pr-3 rounded-full hover:bg-secondary/80">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User size={16} />
                        </div>
                        <span className="max-w-[100px] truncate text-sm font-medium">
                          {user.email?.split('@')[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-border/50 bg-background/95 backdrop-blur-lg">
                      {isAdmin && (
                        <>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                            <Link to="/admin" className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span className="font-medium">Admin Panel</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-border/50" />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span className="font-medium">Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground" asChild>
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/40"
                      asChild
                    >
                      <Link to="/auth?signup=true">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
            <Button size="sm" className="rounded-full shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 hover:brightness-110 transition-all" asChild>
              <Link to="/order">
                Publish App
                <ChevronRight size={14} className="ml-1 opacity-70" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu (Sheet) */}
          <div className="flex lg:hidden items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-full hover:bg-secondary/80 transition-colors active:scale-95 duration-200"
                  aria-label="Toggle menu"
                >
                  <Menu size={24} className="text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r border-border/10 bg-background/95 backdrop-blur-xl">
                <SheetHeader className="p-6 border-b border-border/10">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
                      <img src="/logo.png" alt="QuantaMesh" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-foreground">Quanta Mesh</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
                  <div className="flex flex-col p-4 space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl text-base font-medium transition-all duration-200",
                          location.pathname === link.path
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span>{link.name}</span>
                        {link.badge && (
                          <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto p-4 space-y-4 border-t border-border/10 bg-secondary/5">
                    {!loading && (
                      <div className="space-y-4">
                        {user ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                                <p className="text-xs text-muted-foreground">Logged in</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {isAdmin && (
                                <Link
                                  to="/admin"
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-sm font-medium bg-background border border-border/50 shadow-sm hover:bg-secondary/80 transition-colors"
                                >
                                  <Shield size={16} />
                                  Admin Panel
                                </Link>
                              )}
                              <button
                                onClick={handleSignOut}
                                className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors"
                              >
                                <LogOut size={16} />
                                Sign Out
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="w-full gap-2 rounded-xl h-11" asChild>
                              <Link to="/auth" onClick={() => setIsOpen(false)}>
                                <LogIn size={18} />
                                Sign In
                              </Link>
                            </Button>
                            <Button className="w-full gap-2 rounded-xl h-11" asChild>
                              <Link to="/auth?signup=true" onClick={() => setIsOpen(false)}>
                                <UserPlus size={18} />
                                Sign Up
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <Button size="lg" className="w-full rounded-xl gap-2 font-semibold shadow-lg shadow-primary/20" asChild>
                      <Link to="/order" onClick={() => setIsOpen(false)}>
                        Publish My App
                        <ChevronRight size={18} />
                      </Link>
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      © {new Date().getFullYear()} QuantaMesh
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
