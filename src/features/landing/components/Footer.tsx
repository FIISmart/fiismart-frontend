import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout";

export default function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-white">
      <PageLayout as="div" maxWidth="7xl" className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <GraduationCap className="size-5 text-white" />
              </div>
              <span className="font-serif font-bold text-lg">FIISmart</span>
            </div>
            <p className="font-sans text-body-sm text-white/60 mb-4 leading-relaxed">
              Platforma educationala completa pentru profesori si studenti din Romania.
            </p>
            <div className="flex gap-3">
              {["f", "in", "tw", "yt"].map((s) => (
                <div
                  key={s}
                  className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center text-caption font-medium hover:bg-primary transition-colors cursor-pointer"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
          {[
            { title: "Navigare", links: ["Cursuri", "Tutori", "Comunitate", "Blog", "Contact"] },
            { title: "Categorii", links: ["Programare", "Design", "Marketing", "Business", "Limbi Straine"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-serif font-semibold text-white mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-sans text-body-sm text-white/60 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="font-serif font-semibold text-white mb-4">Support</h4>
            <ul className="flex flex-col gap-2">
              {["Ajutor", "FAQ", "Contact"].map((link) => (
                <li key={link}>
                  <a href="#" className="font-sans text-body-sm text-white/60 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
              <li>
                <Link to="/privacy" className="font-sans text-body-sm text-white/60 hover:text-white transition-colors">Confidențialitate</Link>
              </li>
              <li>
                <Link to="/terms" className="font-sans text-body-sm text-white/60 hover:text-white transition-colors">Termeni</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-caption text-white/40">© 2026 FIISmart. Toate drepturile rezervate.</p>
          <div className="flex items-center gap-4 text-white/40 text-caption">
            <span className="flex items-center gap-1">
              <Mail className="size-4" /> contact@FIISmart.ro
            </span>
            <span className="flex items-center gap-1">
              <Phone className="size-4" /> +40 721 000 000
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4" /> Bucuresti, RO
            </span>
          </div>
        </div>
      </PageLayout>
    </footer>
  );
}