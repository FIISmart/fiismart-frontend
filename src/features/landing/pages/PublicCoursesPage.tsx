import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPublishedCourses, type CourseAPI } from "@/lib/api";
import { BookOpen, Star, Users } from "lucide-react";

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<CourseAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPublishedCourses()
      .then((data) => {
        if (!cancelled) setCourses(data);
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
    <div className="min-h-screen bg-background">
      <Navbar solid />
      <main className="fii-container pt-28 pb-16">
        <div className="mb-10">
          <span className="badge mb-4">Cursuri publice</span>
          <h1 className="font-heading text-4xl font-bold text-foreground mb-3">Exploreaza cursurile FII Smart</h1>
          <p className="text-muted-foreground max-w-2xl">
            Alege un curs potrivit pentru obiectivele tale si incepe sa inveti pas cu pas.
          </p>
        </div>

        {isLoading && <p className="text-muted-foreground">Se incarca...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!isLoading && !error && courses.length === 0 && (
          <div className="landing-card text-center">
            <BookOpen className="mx-auto text-primary mb-3" />
            <p className="font-semibold">Cursurile vor fi disponibile in curand.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article key={course.id} className="landing-card flex flex-col gap-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {course.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="badge text-caption py-1 px-3">{tag}</span>
                  ))}
                </div>
                <h2 className="font-heading text-xl font-semibold text-foreground">{course.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{course.description}</p>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground mt-auto">
                <span className="flex items-center gap-1"><Users size={14} /> {course.enrollmentCount ?? 0}</span>
                <span className="flex items-center gap-1"><Star size={14} /> {course.avgRating || "N/A"}</span>
              </div>
              <Link to="/auth" className="btn-primary justify-center">
                Autentifica-te pentru inscriere
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
