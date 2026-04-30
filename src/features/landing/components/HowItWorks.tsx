import { UserPlus, Search, BookOpen, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: <UserPlus size={32} />,
    title: "Crează un cont",
    description:
      "Înregistrează-te gratuit în mai puțin de 2 minute. Ai nevoie doar de o adresă de email și ești gata.",
  },
  {
    number: "02",
    icon: <Search size={32} />,
    title: "Explorează cursuri",
    description:
      "Răsfoiește peste 1200+ cursuri gratuite din toate domeniile și alege ce ți se potrivește.",
  },
  {
    number: "03",
    icon: <BookOpen size={32} />,
    title: "Învață eficient",
    description:
      "Urmează lecțiile video, rezolvă quiz-uri interactive și aplică cunoștințele în proiecte reale.",
  },
  {
    number: "04",
    icon: <Award size={32} />,
    title: "Obține certificat",
    description:
      "La finalizarea cursului primești un certificat recunoscut de angajatori din toată România.",
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
    <section ref={sectionRef} className="section-padding bg-muted/30 py-20">
      <div className="fii-container max-w-6xl mx-auto px-4">

        {/* Header Centrat */}
        <div className="text-center mb-16">
          <span className="badge mb-4 inline-block bg-secondary/20 text-secondary-foreground px-4 py-1 rounded-full text-sm font-medium">
            Cum funcționează
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Începe în 4 pași simpli
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            De la înregistrare la certificare, procesul este simplu și intuitiv.
          </p>
        </div>

        {/* Container Pași Orizontali */}
        <div className="relative mt-12">
          {/* Linia orizontală de fundal (vizibilă doar pe desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-border z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center text-center group transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Iconița cu număr */}
                <div className="relative mb-6">
                  {/* Badge Număr */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#9b87f5] text-white flex items-center justify-center text-sm font-bold shadow-md z-20">
                    {step.number}
                  </div>
                  {/* Pătratul rotunjit pentru iconiță */}
                  <div className="w-24 h-24 bg-[#F2ECE4] rounded-2xl flex items-center justify-center text-foreground border border-border group-hover:-translate-y-2 transition-transform duration-300 shadow-sm">
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
