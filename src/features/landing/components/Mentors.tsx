import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, UserRound } from "lucide-react";
import { getTutors, type TutorAPI } from "@/lib/api";

export default function Mentors() {
  const [tutors, setTutors] = useState<TutorAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTutors()
      .then((data) => {
        if (!cancelled) setTutors(data.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setError("Nu am putut incarca momentan aceasta sectiune. Incearca din nou mai tarziu.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section-padding bg-muted/30">
      <div className="fii-container">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <span className="badge mb-4">Mentori</span>
            <h2 className="font-heading text-h2 font-bold text-foreground mb-4">
              Gaseste sprijinul potrivit
            </h2>
            <p className="font-body text-body-lg text-muted-foreground max-w-2xl">
              Invata alaturi de profesori care te pot ghida la materiile unde ai nevoie de claritate.
            </p>
          </div>
          <Link to="/tutors" className="btn-secondary w-fit">Vezi mentorii</Link>
        </div>

        {isLoading && <p className="text-muted-foreground">Se incarca mentorii...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!isLoading && !error && tutors.length === 0 && (
          <div className="landing-card text-center text-muted-foreground">
            Mentorii vor aparea in curand.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {tutors.map((tutor) => (
            <article key={tutor.id} className="landing-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRound size={22} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{tutor.displayName}</h3>
                  {tutor.headline && <p className="text-sm text-primary">{tutor.headline}</p>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{tutor.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tutor.tags?.slice(0, 3).map((tag) => <span key={tag} className="badge text-caption py-1 px-3">{tag}</span>)}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{tutor.avgRating || "N/A"} · {tutor.experienceYears || 0} ani experienta</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
