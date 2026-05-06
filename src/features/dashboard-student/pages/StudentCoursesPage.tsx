import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/AuthContext";
import { StudentNavbar } from "../components/StudentNavbar";
import { getPublishedCourses } from "@/lib/api";
import type { CourseAPI } from "@/lib/api";
import { toast } from "sonner";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=360&fit=crop";

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? "Student";
  const initials = ((user?.firstName?.[0] ?? "S") + (user?.lastName?.[0] ?? "")).toUpperCase();

  const [courses, setCourses] = useState<CourseAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getPublishedCourses()
      .then(setCourses)
      .catch(() => toast.error("Eroare la încărcarea cursurilor."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(
    (c) =>
      query === "" ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      (c.tags ?? []).some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <StudentNavbar studentName={firstName} initials={initials} />

      <main className="max-w-[1280px] mx-auto px-4 md:px-12 pt-6 md:pt-10 pb-20 flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-[28px] md:text-[32px] font-bold text-[#1a1a2e]">
            Explorează cursurile
          </h1>
          <p className="text-[14.5px] text-gray-500 font-medium opacity-80 mt-1">
            {loading ? "Se încarcă cursurile..." : `${courses.length} cursuri disponibile`}
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Caută după titlu, descriere sau tag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white border-black/10"
          />
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="size-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">
              {query
                ? "Niciun curs nu corespunde căutării."
                : "Nu există cursuri publicate momentan."}
            </p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Link
              key={course.id}
              to={`/student/courses/${course.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={course.thumbnailUrl ?? FALLBACK_THUMBNAIL}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                {(course.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(course.tags ?? []).slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-[#9b8ec7]/10 text-[#7b6eb0] text-xs border-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-serif font-semibold text-lg text-[#1a1a2e] line-clamp-2 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3.5" />
                      {(course.modules ?? []).length} module
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      La cerere
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#9b8ec7] group-hover:gap-2 transition-all">
                    Accesează <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
