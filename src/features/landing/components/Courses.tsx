import { useState } from "react";
import { Play, Star, Users, Clock } from "lucide-react";

type Category =
  | "Toate"
  | "Programare"
  | "Design"
  | "Marketing"
  | "Business"
  | "Data"
  | "Limba";

interface Course {
  id: number;
  category: Category;
  title: string;
  instructor: string;
  duration: string;
  students: string;
  rating: number;
  tag?: string;
  color: string;
}

const categories: Category[] = [
  "Toate",
  "Programare",
  "Design",
  "Marketing",
  "Business",
  "Data",
  "Limba",
];

const courses: Course[] = [
  {
    id: 1,
    category: "Programare",
    title: "Programare Python de la Zero",
    instructor: "Prof. Andrei C.",
    duration: "12 ore",
    students: "4.2K",
    rating: 4.9,
    tag: "Popular",
    color: "from-accent/30 to-primary/20",
  },
  {
    id: 2,
    category: "Business",
    title: "Matematica pentru BDO",
    instructor: "Prof. Elena M.",
    duration: "8 ore",
    students: "2.1K",
    rating: 4.8,
    tag: "Nou",
    color: "from-secondary/30 to-accent/20",
  },
  {
    id: 3,
    category: "Programare",
    title: "Unity C# de la 0",
    instructor: "Prof. Radu D.",
    duration: "20 ore",
    students: "1.7K",
    rating: 4.7,
    color: "from-primary/20 to-secondary/20",
  },
  {
    id: 4,
    category: "Design",
    title: "Design Grafic cu Figma",
    instructor: "Prof. Maria S.",
    duration: "10 ore",
    students: "3.1K",
    rating: 4.9,
    tag: "Recomandat",
    color: "from-accent/40 to-primary/10",
  },
  {
    id: 5,
    category: "Marketing",
    title: "SEO & Marketing Digital",
    instructor: "Prof. Ion P.",
    duration: "6 ore",
    students: "2.8K",
    rating: 4.6,
    color: "from-secondary/20 to-accent/30",
  },
  {
    id: 6,
    category: "Data",
    title: "Excel & Analiza de Date",
    instructor: "Prof. Cristina L.",
    duration: "9 ore",
    students: "5.6K",
    rating: 4.8,
    tag: "Gratuit",
    color: "from-primary/15 to-secondary/30",
  },
];

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState<Category>("Toate");

  const filtered =
    activeCategory === "Toate"
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  return (
    <section id="cursuri" className="landing-section-padding bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="landing-badge mb-4">📚 Cursuri Populare</span>
          <h2 className="font-heading landing-text-h2 font-bold text-foreground mb-4">
            Exploreaza cursurile noastre gratuite
          </h2>
          <p className="font-body landing-text-body-lg text-muted-foreground max-w-2xl mx-auto">
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
              className={`font-body font-medium landing-text-body-sm px-5 py-2 rounded-full transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-primary text-white landing-shadow-card"
                  : "bg-muted text-muted-foreground hover:bg-secondary/30 hover:text-foreground border border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div key={course.id} className="landing-card group overflow-hidden p-0">
              {/* Thumbnail */}
              <div
                className={`relative h-44 bg-gradient-to-br ${course.color} flex items-center justify-center`}
              >
                {course.tag && (
                  <span className="absolute top-3 left-3 bg-primary text-white landing-text-caption font-medium px-3 py-1 rounded-full">
                    {course.tag}
                  </span>
                )}
                <button className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center landing-shadow-card group-hover:scale-110 transition-transform duration-300">
                  <Play size={20} className="text-primary ml-0.5" fill="currentColor" />
                </button>
              </div>

              {/* Info */}
              <div className="p-5">
                <span className="landing-badge landing-text-caption mb-2 py-1 px-3">
                  {course.category}
                </span>
                <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="landing-text-body-sm text-muted-foreground mb-3">
                  {course.instructor}
                </p>

                <div className="flex items-center justify-between landing-text-caption text-muted-foreground border-t border-border pt-3">
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
          ))}
        </div>
      </div>
    </section>
  );
}
