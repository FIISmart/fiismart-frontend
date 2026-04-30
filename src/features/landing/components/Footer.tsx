import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="font-heading font-bold text-lg">FIISmart</span>
            </div>
            <p className="font-body landing-text-body-sm text-white/60 mb-4 leading-relaxed">
              Platforma educationala completa pentru profesori si studenti din Romania.
            </p>
            <div className="flex gap-3">
              {["f", "in", "tw", "yt"].map((s) => (
                <div
                  key={s}
                  className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center landing-text-caption font-medium hover:bg-primary transition-colors cursor-pointer"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
          {[
            {
              title: "Navigare",
              links: ["Cursuri", "Tutori", "Comunitate", "Blog", "Contact"],
            },
            {
              title: "Categorii",
              links: ["Programare", "Design", "Marketing", "Business", "Limbi Straine"],
            },
            {
              title: "Support",
              links: ["Ajutor", "FAQ", "Contact", "Confidentialitate", "Termeni"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-white mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body landing-text-body-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body landing-text-caption text-white/40">
            © 2026 FIISmart. Toate drepturile rezervate.
          </p>
          <div className="flex items-center gap-4 text-white/40 landing-text-caption">
            <span className="flex items-center gap-1">
              <Mail size={12} /> contact@FIISmart.ro
            </span>
            <span className="flex items-center gap-1">
              <Phone size={12} /> +40 721 000 000
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} /> Bucuresti, RO
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
