import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Play, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { StudentNavbar } from "../components/StudentNavbar";
import { getCourse, getModules, checkMyEnrollment, enrollMe } from "@/lib/api";
import type { CourseAPI, ModuleResponse } from "@/lib/api";
import { toast } from "sonner";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=360&fit=crop";

export default function StudentCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const firstName = user?.firstName ?? "Student";
  const initials = ((user?.firstName?.[0] ?? "S") + (user?.lastName?.[0] ?? "")).toUpperCase();

  const [course, setCourse] = useState<CourseAPI | null>(null);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    Promise.all([getCourse(courseId), getModules(courseId), checkMyEnrollment(courseId)])
      .then(([c, m, status]) => {
        setCourse(c);
        setModules(m);
        setEnrolled(status.enrolled);
        if (m.length > 0) setExpanded(new Set([m[0].id]));
      })
      .catch(() => toast.error("Eroare la încărcarea cursului."))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleEnroll = async () => {
    if (!courseId) return;
    setEnrolling(true);
    try {
      await enrollMe(courseId);
      setEnrolled(true);
      toast.success("Te-ai înscris cu succes în curs!");
    } catch {
      toast.error("Eroare la înrolare. Încearcă din nou.");
    } finally {
      setEnrolling(false);
    }
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const totalLectures = modules.reduce((a, m) => a + m.lectures.length, 0);
  const totalMins = modules.reduce(
    (a, m) => a + m.lectures.reduce((b, l) => b + Math.round((l.durationSecs || 0) / 60), 0),
    0
  );
  const duration = totalMins < 60 ? `${totalMins} min` : `${Math.floor(totalMins / 60)}h ${totalMins % 60}min`;
  const firstLecture = modules[0]?.lectures[0];

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar studentName={firstName} initials={initials} />

      <main className="max-w-[900px] mx-auto px-4 md:px-8 pt-6 pb-20 flex flex-col gap-6">
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="size-4" /> Înapoi la cursuri
        </Link>

        {loading && (
          <p className="text-center py-20 text-muted-foreground text-sm">Se încarcă cursul...</p>
        )}

        {!loading && course && (
          <>
            {/* Header */}
            <div className="bg-card rounded-2xl overflow-hidden border border-black/5 shadow-sm">
              <div className="aspect-[21/7] overflow-hidden">
                <img
                  src={course.thumbnailUrl ?? FALLBACK_THUMBNAIL}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col gap-3">
                {(course.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(course.tags ?? []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  {course.title}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">{course.description}</p>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><BookOpen className="size-4" /> {modules.length} module</span>
                  <span className="flex items-center gap-1.5"><Play className="size-4" /> {totalLectures} lecții</span>
                  <span className="flex items-center gap-1.5"><Clock className="size-4" /> {duration}</span>
                </div>
              </div>
            </div>

            {/* Modules */}
            {modules.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground text-sm">Cursul nu are conținut momentan.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <h2 className="font-serif font-semibold text-lg text-foreground">Conținutul cursului</h2>

                {modules.map((mod, idx) => {
                  const isOpen = expanded.has(mod.id);
                  return (
                    <div key={mod.id} className="bg-card rounded-xl border border-black/5 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggle(mod.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span className="size-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{mod.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {mod.lectures.length} {mod.lectures.length === 1 ? "lecție" : "lecții"}
                            </p>
                          </div>
                        </div>
                        {isOpen
                          ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                          : <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-black/5">
                          {mod.lectures.length === 0 ? (
                            <p className="px-5 py-4 text-sm text-muted-foreground">Nicio lecție în acest modul.</p>
                          ) : (
                            <div className="divide-y divide-black/5">
                              {mod.lectures.map((lecture, lIdx) => {
                                const mins = Math.round((lecture.durationSecs || 0) / 60);
                                return (
                                  <Link
                                    key={lecture.id}
                                    to={`/student/courses/${courseId}/lectures/${lecture.id}`}
                                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary/5 transition-colors group"
                                  >
                                    <span className="size-7 rounded-full border border-primary/30 text-primary text-xs flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                                      <Play className="size-4" />
                                    </span>
                                    <span className="flex-1 text-sm text-foreground line-clamp-1">
                                      {lIdx + 1}. {lecture.title}
                                    </span>
                                    {mins > 0 && (
                                      <span className="text-xs text-muted-foreground shrink-0">{mins} min</span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!enrolled ? (
                  <Button
                    onClick={handleEnroll}
                    disabled={enrolling}
className="mt-2 bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-base"
                   >
                     {enrolling ? "Se procesează..." : "Înscrie-te în curs"}
                  </Button>
                ) : firstLecture ? (
                  <Button
                    asChild
                    className="mt-2 bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-base"
                  >
                    <Link to={`/student/courses/${courseId}/lectures/${firstLecture.id}`}>
                      Continuă cursul
                    </Link>
                  </Button>
                ) : null}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
