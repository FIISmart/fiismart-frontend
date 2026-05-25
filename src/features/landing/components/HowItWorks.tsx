import { UserPlus, Search, BookOpen, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout";

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
{
    number: "01",
    icon: <UserPlus className="size-8" />,
    title: "Crează un cont",
    description:
      "Înregistrează-te gratuit în mai puțin de 2 minute. Ai nevoie doar de o adresă de email și ești gata.",
  },
  {
    number: "02",
    icon: <Search className="size-8" />,
    title: "Explorează cursuri",
    description:
      "Răsfoiește peste 1200+ cursuri gratuite din toate domeniile și alege ce ți se potrivește.",
  },
  {
    number: "03",
    icon: <BookOpen className="size-8" />,
    title: "Învață eficient",
    description:
      "Urmează lecțiile video, rezolvă quiz-uri interactive și aplică cunoștințele în proiecte reale.",
  },
  {
    number: "04",
    icon: <Award className="size-8" />,
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
    <section ref={sectionRef} className="py-16 lg:py-20 bg-muted/30">
      <PageLayout as="div" maxWidth="7xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm font-medium gap-1.5 bg-secondary/20 border-0 mb-4">
            Cum funcționează
          </Badge>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Începe în 4 pași simpli
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            De la înregistrare la certificare, procesul este simplu și intuitiv.
          </p>
        </div>

        <div className="relative mt-12">
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
                <div className="relative mb-6">
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md z-20">
                    {step.number}
                  </div>
                  <div className="w-24 h-24 bg-background rounded-2xl flex items-center justify-center text-foreground border border-border group-hover:-translate-y-2 transition-transform duration-300 shadow-sm">
                    {step.icon}
                  </div>
                </div>

                <div className="px-2">
                  <h3 className="font-serif font-semibold text-lg text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    </section>
  );
}