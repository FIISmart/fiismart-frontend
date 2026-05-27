import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";

const navigation = [
  { label: "Cursuri", to: "/courses" },
  { label: "Tutori", to: "/tutors" },
  { label: "Despre noi", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const support = [
  { label: "Devino profesor", to: "/become-professor" },
  { label: "Confidentialitate", to: "/privacy" },
  { label: "Termeni", to: "/terms" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-white">
      <div className="fii-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Logo darkSmart textClassName="text-lg" className="mb-4" />
            <p className="font-body text-body-sm text-white/60 mb-4 leading-relaxed">
              Platforma educationala completa pentru profesori si studenti din Romania.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Navigare</h4>
            <ul className="flex flex-col gap-2">
              {navigation.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="font-body text-body-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Cont</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/auth" className="font-body text-body-sm text-white/60 hover:text-white transition-colors">
                  Autentificare
                </Link>
              </li>
              {support.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="font-body text-body-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-white/60 text-body-sm">
              <span className="flex items-center gap-2">
                <Mail size={14} /> contact@fiismart.ro
              </span>
              <span className="flex items-center gap-2">
                <Phone size={14} /> +40 721 000 000
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={14} /> Bucuresti, RO
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-caption text-white/40">(c) 2026 FII Smart. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
