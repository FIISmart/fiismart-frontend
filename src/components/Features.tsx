import {
  BookOpen,
  Video,
  FileCheck,
  Users,
  Award,
  Radio,
  BarChart2,
  Bot,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <BookOpen size={24} />,
    title: 'Management Cursuri',
    description: 'Creaza si gestioneaza cursurile tale cu instrumente intuitive si profesionale.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: <Video size={24} />,
    title: 'Incalzire Video',
    description: 'Inregistreaza si editeaza lectii video de calitate direct din platforma.',
    color: 'bg-accent/40 text-primary',
  },
  {
    icon: <FileCheck size={24} />,
    title: 'Quiz si Portofoliu',
    description: 'Creeaza evaluari interactive si construieste un portofoliu profesional.',
    color: 'bg-secondary/30 text-primary',
  },
  {
    icon: <Users size={24} />,
    title: 'Marketplace Tutoring',
    description: 'Conecteaza-te cu studenti si profesori din intreaga tara.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: <Award size={24} />,
    title: 'Certificari Smart',
    description: 'Obtine certificari recunoscute de angajatori din diverse industrii.',
    color: 'bg-accent/40 text-primary',
  },
  {
    icon: <Radio size={24} />,
    title: 'Inregistrare Exclusiva',
    description: 'Acces la sesiuni live exclusive cu experti din domeniu.',
    color: 'bg-secondary/30 text-primary',
  },
  {
    icon: <BarChart2 size={24} />,
    title: 'Progres & Comunitate',
    description: 'Urmareste progresul tau si conecteaza-te cu alti studenti motivati.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: <Bot size={24} />,
    title: 'Chatbot & Recomandari',
    description: 'Asistent AI care iti recomanda cursuri personalizate in functie de obiective.',
    color: 'bg-accent/40 text-primary',
  },
];

const Features = () => {
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
    <section id="Functionalitati" ref={sectionRef} className="section-padding bg-muted/40">
      <div className="section-container">
        {/* Header */}  
        <div className="text-center mb-16">
          <span className="badge-purple mb-4">✨ Features</span>
          <h2 className="font-heading text-h2 font-bold text-foreground mb-4">
            Tot ce ai nevoie pentru a invata si preda
          </h2>
          <p className="font-body text-body-lg text-muted-foreground max-w-2xl mx-auto">
            O platforma moderna care reuneste toate functionalele esentiale pentru un
            ecosistem educational complet.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`card group cursor-pointer transition-all duration-300 ${
                isVisible ? 'animate-fadeInUp opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${feature.color}`}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="font-heading text-h3 font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="font-body text-body-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
