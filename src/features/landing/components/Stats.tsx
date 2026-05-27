import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { landingService, type LandingStats } from "../services/landing.service";

export default function Stats() {
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    landingService
      .getStatistics()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setError("Nu am putut incarca momentan aceasta sectiune. Incearca din nou mai tarziu.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = stats
    ? [
        { value: stats.activeStudents, label: "Studenti activi", sublabel: "Invata in ritmul lor" },
        { value: stats.freeCourses, label: "Cursuri publicate", sublabel: "Lectii clare si structurate" },
        { value: stats.totalTeachers, label: "Profesori", sublabel: "Mentori din comunitate" },
        { value: stats.satisfactionRate, label: "Rating mediu", sublabel: "Feedback de la cursuri" },
      ]
    : [];

  return (
    <section className="section-padding bg-background border-y border-border">
      <div className="fii-container">
        <div className="text-center mb-12">
          <span className="badge mb-4">Comunitate</span>
          <h2 className="font-heading text-h2 font-bold text-foreground mb-4">
            Platforma in cifre
          </h2>
          <p className="font-body text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Urmareste cum creste comunitatea de studenti, profesori si cursuri.
          </p>
        </div>

        {!stats && !error && <p className="text-center text-muted-foreground">Se incarca statisticile...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {items.map((stat) => (
                <div key={stat.label} className="landing-card text-center group">
                  <div className="font-heading text-3xl lg:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <p className="font-body font-medium text-foreground text-body-sm mb-1">{stat.label}</p>
                  <p className="font-body text-caption text-muted-foreground">{stat.sublabel}</p>
                </div>
              ))}
            </div>

            <div className="bg-muted rounded-lg p-5 flex items-center justify-center gap-4 border border-border">
              <div className="w-12 h-12 bg-secondary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp size={22} className="text-primary" />
              </div>
              <p className="font-body text-body-sm text-muted-foreground">
                Tot ce ai nevoie pentru invatare, intr-un singur loc.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
