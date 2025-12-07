import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Order", path: "/order" },
  { name: "Contact", path: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card border-t-0 rounded-t-none">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18 lg:h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl lg:text-2xl font-bold flex-shrink-0"
            >
              <span className="gradient-text">Quanta</span>
              <span className="text-foreground">Mesh</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    location.pathname === link.path
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* CTA Button & Auth - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {!loading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <User size={16} />
                          <span className="max-w-[120px] truncate">
                            {user.email?.split('@')[0]}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-border/50">
                        <DropdownMenuItem 
                          onClick={handleSignOut}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="gap-2" asChild>
                        <Link to="/auth">
                          <LogIn size={16} />
                          Sign In
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/10" asChild>
                        <Link to="/auth?signup=true">
                          <UserPlus size={16} />
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </>
              )}
              <Button variant="gradient" size="default" asChild>
                <Link to="/order">Publish My App</Link>
              </Button>
            </div>

            {/* Tablet Navigation (md to lg) */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              {!loading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="glass" size="sm" className="gap-1.5">
                          <User size={14} />
                          <span className="max-w-[80px] truncate text-xs">
                            {user.email?.split('@')[0]}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-border/50">
                        <DropdownMenuItem 
                          onClick={handleSignOut}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs" asChild>
                      <Link to="/auth">
                        <LogIn size={14} />
                        Sign In
                      </Link>
                    </Button>
                  )}
                </>
              )}
              <Button variant="gradient" size="sm" className="text-xs" asChild>
                <Link to="/order">Publish App</Link>
              </Button>
              <button
                className="p-2 rounded-lg hover:bg-secondary transition-colors ml-1"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            {/* Mobile Auth & Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {!loading && !user && (
                <Button 
                  variant="gradient" 
                  size="sm" 
                  className="gap-1.5 text-xs px-3"
                  asChild
                >
                  <Link to="/auth">
                    <LogIn size={14} />
                    <span className="hidden xs:inline">Sign In</span>
                  </Link>
                </Button>
              )}
              {!loading && user && (
                <Button 
                  variant="glass" 
                  size="sm" 
                  className="gap-1.5 text-xs px-2"
                  onClick={handleSignOut}
                >
                  <User size={14} />
                </Button>
              )}
              <button
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-border/50 animate-slide-up">
            <div className="container mx-auto px-4 sm:px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    location.pathname === link.path
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              {!loading && (
                <div className="pt-3 border-t border-border/50 space-y-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        Signed in as <span className="text-foreground font-medium">{user.email}</span>
                      </div>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 border-border/50"
                        onClick={() => setIsOpen(false)}
                        asChild
                      >
                        <Link to="/auth">
                          <LogIn size={16} />
                          Sign In
                        </Link>
                      </Button>
                      <Button 
                        variant="gradient" 
                        className="w-full gap-2"
                        onClick={() => setIsOpen(false)}
                        asChild
                      >
                        <Link to="/auth?signup=true">
                          <UserPlus size={16} />
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="pt-2 md:hidden">
                <Button variant="gradient" className="w-full" asChild>
                  <Link to="/order" onClick={() => setIsOpen(false)}>
                    Publish My App
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
