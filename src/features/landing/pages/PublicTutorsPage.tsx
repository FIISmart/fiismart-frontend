import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getTutors, type TutorAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function PublicTutorsPage() {
  const [tutors, setTutors] = useState<TutorAPI[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTutors()
      .then((data) => {
        if (!cancelled) setTutors(data);
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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tutors;
    return tutors.filter((tutor) => [tutor.displayName, tutor.headline, tutor.bio, ...(tutor.tags ?? [])].join(" ").toLowerCase().includes(needle));
  }, [query, tutors]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <main className="fii-container pt-28 pb-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="badge mb-4">Tutori</span>
            <h1 className="font-heading text-4xl font-bold text-foreground mb-3">Gaseste un tutor</h1>
            <p className="text-muted-foreground">Gaseste sprijinul potrivit pentru materia la care ai nevoie de ajutor.</p>
          </div>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cauta dupa nume sau tag..." className="max-w-sm bg-white" />
        </div>

        {isLoading && <p className="text-muted-foreground">Se incarca...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!isLoading && !error && filtered.length === 0 && <p className="text-muted-foreground">Mentorii vor aparea in curand.</p>}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tutor) => (
            <article key={tutor.id} className="landing-card">
              <h2 className="font-heading text-xl font-semibold text-foreground">{tutor.displayName}</h2>
              {tutor.headline && <p className="mt-1 text-sm font-semibold text-primary">{tutor.headline}</p>}
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{tutor.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tutor.tags?.map((tag) => <span key={tag} className="badge text-caption py-1 px-3">{tag}</span>)}
              </div>
              <Link to="/auth" className="btn-primary mt-5 justify-center">
                Autentifica-te pentru cerere
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
