import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout";

const navLinks = [
  { label: "Functionalitati", href: "#Functionalitati" },
  { label: "Cursuri", href: "#cursuri" },
  { label: "Comunitate", href: "#comunitate" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        isScrolled
          ? "bg-background/80 shadow-card border-b border-border"
          : "bg-transparent"
      }`}
    >
      <PageLayout as="div" maxWidth="7xl">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <a
            href="#"
            className="flex items-center gap-2 font-serif font-bold text-lg text-foreground"
          >
            <GraduationCap className="size-6 text-primary" />
            <span>
              FII<span className="text-primary">Smart</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-primary font-sans text-body transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">Autentifica-te</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth">Incepe Gratuit</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {isMobileOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary font-sans text-body px-2 py-2 transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="outline" size="sm" className="justify-center">
                      <Link to="/dashboard" onClick={() => setIsMobileOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button size="sm" className="justify-center" onClick={() => { setIsMobileOpen(false); void handleLogout(); }}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/auth" onClick={() => setIsMobileOpen(false)}>
                        Autentifica-te
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/auth" onClick={() => setIsMobileOpen(false)}>
                        Incepe Gratuit
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </nav>
  );
}