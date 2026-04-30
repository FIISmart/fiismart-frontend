import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
}

const stats: StatItem[] = [
  { value: 50, suffix: "K+", label: "Studenti activi", sublabel: "Pe platforma noastra" },
  { value: 1200, suffix: "+", label: "Cursuri publicate", sublabel: "In toate domeniile" },
  { value: 500, suffix: "+", label: "Profesori verificati", sublabel: "Experti in domeniu" },
  { value: 98, suffix: "%", label: "Rata de satisfactie", sublabel: "Studentii nostri" },
];

const statsRow2: StatItem[] = [
  { value: 2, suffix: "M+", label: "Ore de invatare", sublabel: "Inregistrate pe platforma" },
  { value: 140, suffix: "K+", label: "Accesari lunare", sublabel: "Recunoscute de companii" },
  { value: 25, suffix: "K+", label: "Sesiuni live", sublabel: "Completate cu succes" },
];

interface CounterProps {
  value: number;
  suffix: string;
  prefix?: string;
  isVisible: boolean;
}

function Counter({ value, suffix, isVisible }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const stepCount = 60;
    const increment = value / stepCount;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / stepCount);
    return () => clearInterval(timer);
  }, [isVisible, value]);

  const formatted =
    value >= 1000
      ? count >= 1000
        ? Math.floor(count / 100) / 10 + "K"
        : count.toString()
      : count.toString();

  return (
    <span>
      {value >= 1000 ? formatted : count}
      {suffix}
    </span>
  );
}

export default function Stats() {
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
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="landing-section-padding bg-background border-y border-border"
    >
      <div className="fii-container">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="landing-badge mb-4">📊 Statistici</span>
          <h2 className="font-heading landing-text-h2 font-bold text-foreground mb-4">
            Impactul nostru in educatie
          </h2>
          <p className="font-body landing-text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Transformam educatia prin tehnologie. Cifrele vorbesc de la sine despre
            calitatea si impactul platformei noastre.
          </p>
        </div>

        {/* Stats Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="landing-card text-center group">
              <div className="font-heading text-3xl lg:text-4xl font-bold text-primary mb-1">
                {isVisible ? (
                  <Counter value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                ) : (
                  `0${stat.suffix}`
                )}
              </div>
              <p className="font-body font-medium text-foreground landing-text-body-sm mb-1">
                {stat.label}
              </p>
              <p className="font-body landing-text-caption text-muted-foreground">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statsRow2.map((stat) => (
            <div
              key={stat.label}
              className="bg-muted rounded-lg p-5 flex items-center gap-4 border border-border"
            >
              <div className="w-12 h-12 bg-secondary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp size={22} className="text-primary" />
              </div>
              <div>
                <div className="font-heading text-2xl font-bold text-primary">
                  {isVisible ? (
                    <Counter value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </div>
                <p className="font-body landing-text-body-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Highlight Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/20 rounded-xl p-6 flex flex-wrap items-center justify-center gap-4 border border-primary/20">
          <span className="text-foreground font-body font-medium">
            ✅ Top 100% platforma &nbsp;·&nbsp; 🏆 Studenti campioni &nbsp;·&nbsp; 🔒
            Verificate de experti
          </span>
        </div>
      </div>
    </section>
  );
}
