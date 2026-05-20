import { useEffect, useState } from "react";
import { Play, Star, Users, Clock } from "lucide-react";
import { landingService, PopularCourse } from "../services/landing.service";

interface Course {
  id: string | number;
  category: string;
  title: string;
  instructor: string;
  duration: string;
  students: string;
  rating: number;
  tag?: string;
  color: string;
}

const DEFAULT_CATEGORIES: string[] = ["Toate", "Programare", "Design", "Marketing", "Business", "Data", "Limba"];

const COLORS = [
  "from-accent/30 to-primary/20",
  "from-secondary/30 to-accent/20",
  "from-primary/20 to-secondary/20",
  "from-accent/40 to-primary/10",
  "from-secondary/20 to-accent/30",
  "from-primary/15 to-secondary/30",
];

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState<string>("Toate");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      landingService.getCategories(),
      landingService.getPopularCourses(),
    ])
      .then(([categoriesMap, popularCourses]) => {
        // Backend categories map: { "CategoryName": count }
        const catList = Object.keys(categoriesMap);
        if (catList.length > 0) {
          // Ensure "Toate" is first if it exists or add it
          const filteredCats = catList.filter(c => c !== "Toate");
          setCategories(["Toate", ...filteredCats]);
        }

        const mapped: Course[] = popularCourses.map((c: PopularCourse, idx: number) => ({
          id: idx, // No ID from this specific backend DTO
          category: "Programare", // Backend doesn't return category for popular courses yet
          title: c.title,
          instructor: "Profesor FiiSmart",
          duration: "10 ore", // Static for now
          students: c.enrollmentCount >= 1000 ? `${(c.enrollmentCount / 1000).toFixed(1)}K` : `${c.enrollmentCount}`,
          rating: c.avgRating || 5.0,
          tag: idx === 0 ? "Popular" : undefined,
          color: COLORS[idx % COLORS.length],
        }));
        setCourses(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch landing courses:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filtered =
    activeCategory === "Toate"
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  return (
    <section id="cursuri" className="section-padding bg-background">
      <div className="fii-container">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="badge mb-4">📚 Cursuri Populare</span>
          <h2 className="font-heading text-h2 font-bold text-foreground mb-4">
            Exploreaza cursurile noastre gratuite
          </h2>
          <p className="font-body text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Peste 1200+ cursuri gratuite in toate domeniile. Incepem de la zero si
            ajungem la nivel avansat impreuna.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
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

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
             <div className="col-span-full py-20 text-center text-muted-foreground animate-pulse">
                Se incarca cursurile...
             </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              Nu am gasit cursuri pentru aceasta categorie.
            </div>
          ) : (
            filtered.map((course) => (
              <div
                key={course.id}
                className="landing-card group overflow-hidden p-0"
              >
                {/* Thumbnail */}
                <div className={`relative h-44 bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                  {course.tag && (
                    <span className="absolute top-3 left-3 bg-primary text-white text-caption font-medium px-3 py-1 rounded-full">
                      {course.tag}
                    </span>
                  )}
                  <button className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card group-hover:scale-110 transition-transform duration-300">
                    <Play size={20} className="text-primary ml-0.5" fill="currentColor" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-5">
                  <span className="badge text-caption mb-2 py-1 px-3">{course.category}</span>
                  <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-body-sm text-muted-foreground mb-3">{course.instructor}</p>

                  <div className="flex items-center justify-between text-caption text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="font-medium text-foreground">{course.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
