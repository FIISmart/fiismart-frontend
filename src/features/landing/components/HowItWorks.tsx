import { UserPlus, Search, BookOpen, Award } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface Step {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: <UserPlus size={32} />,
    title: "Creaza un cont",
    description:
      "Inregistreaza-te gratuit in mai putin de 2 minute. Ai nevoie doar de o adresa de email si esti gata.",
  },
  {
    number: "02",
    icon: <Search size={32} />,
    title: "Exploreaza cursuri",
    description:
      "Rasfoieste peste 1200+ cursuri gratuite din toate domeniile si alege ce ti se potriveste.",
  },
  {
    number: "03",
    icon: <BookOpen size={32} />,
    title: "Invata eficient",
    description:
      "Urmeaza lectiile video, rezolva quiz-uri interactive si aplica cunostintele in proiecte reale.",
  },
  {
    number: "04",
    icon: <Award size={32} />,
    title: "Obtine certificat",
    description:
      "La finalizarea cursului primesti un certificat recunoscut de angajatori din toata Romania.",
  },
];

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="landing-section-padding bg-muted/30 py-20">
      <div className="max-w-7xl ml-auto mr-auto pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
        {/* Header Centrat */}
        <div className="text-center mb-16">
          <span className="landing-badge mb-4 inline-block bg-secondary/20 text-foreground px-4 py-1 rounded-full text-sm font-medium">
            Cum functioneaza
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Incepe in 4 pasi simpli
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            De la inregistrare la certificare, procesul este simplu si intuitiv.
          </p>
        </div>

        {/* Container Pasi Orizontali */}
        <div className="relative mt-12">
          {/* Linia orizontala de fundal (vizibila doar pe desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-border z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex flex-col items-center text-center group transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                {/* Iconita cu numar */}
                <div className="relative mb-6">
                  {/* Badge Numar */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md z-20">
                    {step.number}
                  </div>
                  {/* Patratul rotunjit pentru iconita */}
                  <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center text-foreground border border-border group-hover:-translate-y-2 transition-transform duration-300 shadow-sm">
                    {step.icon}
                  </div>
                </div>

                {/* Text Content */}
                <div className="px-2">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
