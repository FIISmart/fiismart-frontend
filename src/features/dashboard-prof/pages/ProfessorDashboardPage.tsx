import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Star,
  TrendingUp,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { ProfDashboardNavbar } from "../components/ProfDashboardNavbar";
import { StatCard } from "../components/StatCard";
import { ActionCard } from "../components/ActionCard";
import { CourseCard } from "../components/CourseCard";
import { QuizTable } from "../components/QuizTable";
import { CommentList } from "../components/CommentList";
import type { DashboardOverviewResponse } from "../types";

export function ProfessorDashboardPage() {
  const { user } = useAuth();
  const teacherId = user?.id;

  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiFetch<DashboardOverviewResponse>("/teacher-dashboard/me/overview", {
      headers: {
        "X-Dev-UserId": teacherId,
      },
    })
      .then((backendData) => {
        if (cancelled) return;
        setData(backendData);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Nu am putut aduce datele de la server.";
        setError(message);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  // Auth still loading — no user available yet.
  if (!user) {
    return (
      <div className="min-h-screen bg-edu-bg text-edu-foreground flex items-center justify-center">
        <Spinner className="size-8 text-edu-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edu-bg text-edu-foreground flex flex-col font-sans">
      <ProfDashboardNavbar />

      {isLoading || !data ? (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center">
          {error ? (
            <p className="text-xl text-red-500 font-medium">{error}</p>
          ) : (
            <div className="flex items-center gap-3 text-edu-muted-fg">
              <Spinner className="size-6 text-edu-primary" />
              <p className="text-xl font-medium animate-pulse">Se încarcă dashboard-ul...</p>
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-10">
            <h2 className="text-4xl font-bold font-poppins text-edu-foreground">
              Bine ai venit, Profesor!
            </h2>
            <p className="text-edu-muted-fg mt-2 text-lg">
              Iată o privire de ansamblu asupra cursurilor tale și a activității studenților.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard
              title="Studenți activi"
              value={data.stats.studentsEnrolled}
              subtitle="Înrolati în total"
              icon={<Users size={24} />}
              iconBgColor="bg-edu-secondary/20"
              iconColor="text-edu-primary"
            />
            <StatCard
              title="Cursuri active"
              value={data.stats.activeCourses}
              subtitle="Publicate pe platformă"
              icon={<BookOpen size={24} />}
              iconBgColor="bg-edu-accent/30"
              iconColor="text-edu-foreground"
            />
            <StatCard
              title="Quiz-uri completate"
              value={data.stats.quizzesCompleted}
              subtitle="De către studenți"
              icon={<Star size={24} />}
              iconBgColor="bg-edu-secondary/30"
              iconColor="text-edu-primary"
            />
            <StatCard
              title="Rata de completare"
              value={`${data.stats.completionRatePct}%`}
              subtitle="Media per student"
              icon={<TrendingUp size={24} />}
              iconBgColor="bg-white"
              iconColor="text-edu-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <ActionCard
              title="Creare Quiz Rapid"
              description="Adaugă un test scurt pentru evaluarea studenților."
              icon={<PlusCircle size={28} />}
              bgColorClass="bg-edu-secondary/50"
            />
            <ActionCard
              title="Course Builder"
              description="Configurează și publică un curs nou pas cu pas."
              icon={<LayoutDashboard size={28} />}
              bgColorClass="bg-edu-accent/60"
            />
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold font-poppins text-edu-foreground">
                Cursurile Mele (Preview)
              </h3>
              <a
                href="#"
                className="text-sm font-medium text-edu-primary hover:text-edu-secondary transition"
              >
                Vezi toate
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.coursesPreview.map((course, index) => {
                const statusAfisat = course.status === "published" ? "Activ" : "Draft";

                const culori = [
                  "bg-gradient-to-br from-edu-primary/80 to-edu-secondary/80",
                  "bg-gradient-to-br from-edu-accent to-emerald-200",
                  "bg-gradient-to-br from-pink-300 to-orange-200",
                ];
                const gradientAles = culori[index % culori.length];

                return (
                  <CourseCard
                    key={course.courseId}
                    title={course.title}
                    subtitle={course.description}
                    studentsCount={course.enrollmentCount}
                    rating={course.avgRating}
                    status={statusAfisat}
                    gradientClass={gradientAles}
                  />
                );
              })}
            </div>
          </div>

          <QuizTable quizzes={data.quizzesPreview} />
          <CommentList comments={data.commentsPreview} />
        </main>
      )}
    </div>
  );
}

export default ProfessorDashboardPage;
