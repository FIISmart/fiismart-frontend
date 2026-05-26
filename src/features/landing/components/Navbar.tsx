import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

const navLinks = [
  { label: "Functionalitati", href: "#Functionalitati" },
  { label: "Cursuri", href: "#cursuri" },
  { label: "Comunitate", href: "#comunitate" },
  { label: "Contact", href: "#contact" },
];

type NavbarProps = {
  solid?: boolean;
};

export default function Navbar({ solid = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
        solid || isScrolled
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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-secondary py-2 px-5 text-sm">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-primary py-2 px-5 text-sm"
                >
                  Logout
                </button>
              </>
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
              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="btn-secondary py-2 px-5 text-sm justify-center"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileOpen(false);
                        void handleLogout();
                      }}
                      className="btn-primary py-2 px-5 text-sm justify-center"
                    >
                      Logout
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
