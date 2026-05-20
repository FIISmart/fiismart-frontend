import { useState, useEffect } from "react";
import { Menu, X, GraduationCap, User, Lock, LogOut, Calendar, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { UserRole } from "@/features/auth/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { label: "Functionalitati", href: "#Functionalitati" },
  { label: "Cursuri", href: "#cursuri" },
  { label: "Comunitate", href: "#comunitate" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ solid = false }: { solid?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardHref =
    user?.role === UserRole.PROFESSOR ? "/professor/dashboard" : "/student/dashboard";

  const userInitials = user
    ? ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || user.email?.[0].toUpperCase()
    : "";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 navbar-blur ${
        isScrolled || solid
          ? "bg-background/80 shadow-card border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="fii-container">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 font-heading font-bold text-lg text-foreground"
          >
            <GraduationCap size={28} className="text-primary" />
            <span>
              FII<span className="text-primary">Smart</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-primary font-body text-body transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 rounded-full transition-all">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src="" alt={user?.displayName || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to={dashboardHref} className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Vizualizare profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link 
                      to={user?.role === UserRole.PROFESSOR ? "/professor/timetable" : "/student/timetable"} 
                      className="flex items-center w-full"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Orar</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === UserRole.STUDENT && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/student/statistics" className="flex items-center w-full">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Statistici</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer">
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Schimbare parola</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Deconectare</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth" className="btn-secondary py-2 px-5 text-sm">
                  Autentifica-te
                </Link>
                <Link to="/auth" className="btn-primary py-2 px-5 text-sm">
                  Incepe Gratuit
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary font-body text-body px-2 py-2 transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3 border-t border-border px-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-muted/50 rounded-lg">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to={dashboardHref}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <User size={18} className="text-muted-foreground" />
                      Vizualizare profil
                    </Link>
                    <Link
                      to={user?.role === UserRole.PROFESSOR ? "/professor/timetable" : "/student/timetable"}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Calendar size={18} className="text-muted-foreground" />
                      Orar
                    </Link>
                    {user?.role === UserRole.STUDENT && (
                      <Link
                        to="/student/statistics"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <BarChart3 size={18} className="text-muted-foreground" />
                        Statistici
                      </Link>
                    )}
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors text-left"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Lock size={18} className="text-muted-foreground" />
                      Schimbare parola
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileOpen(false);
                        void handleLogout();
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left mt-1"
                    >
                      <LogOut size={18} />
                      Deconectare
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      className="btn-secondary py-2 px-5 text-sm justify-center"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Autentifica-te
                    </Link>
                    <Link
                      to="/auth"
                      className="btn-primary py-2 px-5 text-sm justify-center"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Incepe Gratuit
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
