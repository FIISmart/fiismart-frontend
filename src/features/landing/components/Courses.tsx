import { useState } from "react";
import { Play, Star, Users, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout";

type Category = "Toate" | "Programare" | "Design" | "Marketing" | "Business" | "Data" | "Limba";

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

const categories: Category[] = ["Toate", "Programare", "Design", "Marketing", "Business", "Data", "Limba"];

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
    <section id="cursuri" className="py-16 lg:py-20 bg-background">
      <PageLayout as="div" maxWidth="7xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm font-medium gap-1.5 bg-accent/40 border-0 mb-4">
            📚 Cursuri Populare
          </Badge>
          <h2 className="font-serif text-h2 font-bold text-foreground mb-4">
            Exploreaza cursurile noastre gratuite
          </h2>
          <p className="font-sans text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Peste 1200+ cursuri gratuite in toate domeniile. Incepem de la zero si
            ajungem la nivel avansat impreuna.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-sans font-medium text-body-sm px-5 py-2 rounded-full transition-all duration-300 ${
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
            <Card
              key={course.id}
              className="p-0 gap-0 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className={`relative h-44 bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                {course.tag && (
                  <span className="absolute top-3 left-3 bg-primary text-white text-caption font-medium px-3 py-1 rounded-full">
                    {course.tag}
                  </span>
                )}
                <button className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card group-hover:scale-110 transition-transform duration-300">
                  <Play className="size-5 text-primary ml-0.5" fill="currentColor" />
                </button>
              </div>

              <div className="p-5">
                <Badge variant="outline" className="rounded-full px-3 py-1 text-caption bg-accent/40 border-0 mb-2">
                  {course.category}
                </Badge>
                <h3 className="font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-body-sm text-muted-foreground mb-3">{course.instructor}</p>

                <div className="flex items-center justify-between text-caption text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center gap-1">
                    <Clock className="size-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="size-4" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">{course.rating}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageLayout>
    </section>
  );
}