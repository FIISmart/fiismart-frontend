import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Star, Users } from "lucide-react";
import { resolveFileUrl } from "@/lib/api";
import { landingService, type PopularCourse } from "../services/landing.service";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=360&fit=crop";

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "Durata indisponibila";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

export default function Courses() {
  const [courses, setCourses] = useState<PopularCourse[]>([]);
  const [categories, setCategories] = useState<Record<string, number>>({ Toate: 0 });
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [courseData, categoryData] = await Promise.all([
          landingService.getPopularCourses(),
          landingService.getCategories(),
        ]);
        if (!cancelled) {
          setCourses(courseData);
          setCategories(categoryData);
        }
      } catch {
        if (!cancelled) {
          setError("Nu am putut incarca momentan aceasta sectiune. Incearca din nou mai tarziu.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryNames = useMemo(() => {
    const names = Object.keys(categories).filter((key) => categories[key] > 0);
    return names.includes("Toate") ? names : ["Toate", ...names];
  }, [categories]);

  const filtered = useMemo(() => {
    if (activeCategory === "Toate") return courses;
    return courses.filter((course) => course.tags?.includes(activeCategory));
  }, [activeCategory, courses]);

  return (
    <section id="cursuri" className="section-padding bg-background">
      <div className="fii-container">
        <div className="text-center mb-10">
          <span className="badge mb-4">Cursuri publicate</span>
          <h2 className="font-heading text-h2 font-bold text-foreground mb-4">
            Exploreaza cursurile disponibile
          </h2>
          <p className="font-body text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Descopera cursuri create pentru studenti care vor explicatii clare si exercitii practice.
          </p>
        </div>

        {isLoading && <p className="text-center text-muted-foreground">Se incarca cursurile...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!isLoading && !error && courses.length === 0 && (
          <div className="landing-card text-center max-w-xl mx-auto">
            <BookOpen className="mx-auto mb-3 text-primary" />
            <h3 className="font-heading font-semibold text-foreground mb-2">Cursurile vor fi disponibile in curand</h3>
            <p className="text-muted-foreground">
              Profesorii pregatesc continut nou pentru comunitate.
            </p>
          </div>
        )}

        {!isLoading && !error && courses.length > 0 && (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`font-body font-medium text-body-sm px-5 py-2 rounded-full transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-card"
                      : "bg-muted text-muted-foreground hover:bg-secondary/30 hover:text-foreground border border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <Link key={course.id} to="/courses" className="landing-card group overflow-hidden p-0">
                  <div className="relative h-44 bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={resolveFileUrl(course.thumbnailUrl) || FALLBACK_THUMBNAIL}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5">
                    {course.tags?.[0] && <span className="badge text-caption mb-2 py-1 px-3">{course.tags[0]}</span>}
                    <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-body-sm text-muted-foreground mb-1">{course.teacherName}</p>
                    <p className="text-body-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>

                    <div className="flex items-center justify-between text-caption text-muted-foreground border-t border-border pt-3">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDuration(course.durationSecs)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {course.enrollmentCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="font-medium text-foreground">{course.avgRating || "N/A"}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
