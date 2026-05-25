import {
  BookOpen,
  Video,
  FileCheck,
  Users,
  Award,
  Radio,
  BarChart2,
  Bot,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <BookOpen className="size-6" />,
    title: "Management Cursuri",
    description: "Creaza si gestioneaza cursurile tale cu instrumente intuitive si profesionale.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <Video className="size-6" />,
    title: "Incalzire Video",
    description: "Inregistreaza si editeaza lectii video de calitate direct din platforma.",
    color: "bg-accent/40 text-primary",
  },
  {
    icon: <FileCheck className="size-6" />,
    title: "Quiz si Portofoliu",
    description: "Creeaza evaluari interactive si construieste un portofoliu profesional.",
    color: "bg-secondary/30 text-primary",
  },
  {
    icon: <Users className="size-6" />,
    title: "Marketplace Tutoring",
    description: "Conecteaza-te cu studenti si profesori din intreaga tara.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <Award className="size-6" />,
    title: "Certificari Smart",
    description: "Obtine certificari recunoscute de angajatori din diverse industrii.",
    color: "bg-accent/40 text-primary",
  },
  {
    icon: <Radio className="size-6" />,
    title: "Inregistrare Exclusiva",
    description: "Acces la sesiuni live exclusive cu experti din domeniu.",
    color: "bg-secondary/30 text-primary",
  },
  {
    icon: <BarChart2 className="size-6" />,
    title: "Progres & Comunitate",
    description: "Urmareste progresul tau si conecteaza-te cu alti studenti motivati.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <Bot className="size-6" />,
    title: "Chatbot & Recomandari",
    description: "Asistent AI care iti recomanda cursuri personalizate in functie de obiective.",
    color: "bg-accent/40 text-primary",
  },
];

export default function Features() {
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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="Functionalitati" ref={sectionRef} className="py-16 lg:py-20 bg-muted/40">
      <PageLayout as="div" maxWidth="7xl">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium gap-1.5 mb-4">
            ✨ Features
          </Badge>
          <h2 className="font-serif text-h2 font-bold text-foreground mb-4">
            Tot ce ai nevoie pentru a invata si preda
          </h2>
          <p className="font-sans text-body-lg text-muted-foreground max-w-2xl mx-auto">
            O platforma moderna care reuneste toate functionalele esentiale pentru un
            ecosistem educational complet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`p-6 gap-0 shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer ${
                isVisible ? "animate-fadeInUp opacity-100" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${feature.color}`}
              >
                {feature.icon}
              </div>

              <h3 className="font-serif text-h3 font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="font-sans text-body-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </PageLayout>
    </section>
  );
}