import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Star,
  TrendingUp,
  PlusCircle,
  LayoutDashboard,
  WifiOff,
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

// Fallback shape returned by the overview endpoint — used when the
// backend is unreachable so the dashboard chrome still renders.
const EMPTY_OVERVIEW: DashboardOverviewResponse = {
  stats: {
    studentsEnrolled: 0,
    activeCourses: 0,
    quizzesCompleted: 0,
    completionRatePct: 0,
  },
  coursesPreview: [],
  quizzesPreview: [],
  commentsPreview: [],
};

export function ProfessorDashboardPage() {
  const { user } = useAuth();
  const teacherId = user?.id;

  const [data, setData] = useState<DashboardOverviewResponse>(EMPTY_OVERVIEW);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetchError, setHasFetchError] = useState(false);

  useEffect(() => {
    if (!teacherId) return;

    let cancelled = false;
    setIsLoading(true);
    setHasFetchError(false);

    apiFetch<DashboardOverviewResponse>("/teacher-dashboard/me/overview", {
      headers: {
        "X-Dev-UserId": teacherId,
      },
    })
      .then((backendData) => {
        if (cancelled) return;
        setData(backendData);
        setHasFetchError(false);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setData(EMPTY_OVERVIEW);
        setHasFetchError(true);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4EFE8] flex items-center justify-center">
        <Spinner className="size-8 text-[#9b8ec7]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE8] pb-20 select-none flex flex-col">
      <ProfDashboardNavbar />

      {isLoading ? (
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-12 py-12 flex justify-center items-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Spinner className="size-6 text-[#9b8ec7]" />
            <p className="text-xl font-medium animate-pulse">Se încarcă dashboard-ul...</p>
          </div>
        </main>
      ) : (
        <main className="max-w-[1280px] w-full mx-auto px-4 md:px-12 pt-6 md:pt-10 flex flex-col gap-8 md:gap-10">
          {hasFetchError && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-sm text-amber-800"
            >
              <WifiOff size={16} className="shrink-0" />
              <span>Backend offline — vei vedea o vizualizare goală.</span>
            </div>
          )}

          <div>
            <h2 className="font-serif text-[28px] md:text-[32px] font-bold text-[#1a1a2e]">
              Bine ai venit, Profesor! 👋
            </h2>
            <p className="text-[14.5px] text-gray-500 font-medium opacity-80 mt-1">
              Iată o privire de ansamblu asupra cursurilor tale și a activității studenților.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <StatCard
              title="Studenți activi"
              value={data.stats.studentsEnrolled}
              subtitle="Înrolati în total"
              icon={<Users size={22} className="text-[#9b8ec7] opacity-70" />}
            />
            <StatCard
              title="Cursuri active"
              value={data.stats.activeCourses}
              subtitle="Publicate pe platformă"
              icon={<BookOpen size={22} className="text-[#5EEAD4]" />}
            />
            <StatCard
              title="Quiz-uri completate"
              value={data.stats.quizzesCompleted}
              subtitle="De către studenți"
              icon={<Star size={22} className="text-pink-400" />}
            />
            <StatCard
              title="Rata de completare"
              value={`${data.stats.completionRatePct}%`}
              subtitle="Media per student"
              icon={<TrendingUp size={22} className="text-green-500" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              title="Creare Quiz Rapid"
              description="Adaugă un test scurt pentru evaluarea studenților."
              icon={<PlusCircle size={24} />}
              bgColorClass="bg-[#9b8ec7]"
            />
            <ActionCard
              title="Course Builder"
              description="Configurează și publică un curs nou pas cu pas."
              icon={<LayoutDashboard size={24} />}
              bgColorClass="bg-[#8ad6cc]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-[22px] md:text-[24px] font-bold text-[#1a1a2e]">
                Cursurile Mele (Preview)
              </h3>
              <a
                href="#"
                className="text-sm font-bold text-[#9b8ec7] hover:text-[#2d2a3e] transition"
              >
                Vezi toate
              </a>
            </div>

            {data.coursesPreview.length === 0 ? (
              <div className="bg-white border border-black/5 rounded-[22px] p-8 text-center text-gray-400 font-medium">
                Nu ai niciun curs creat momentan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.coursesPreview.map((course, index) => {
                  const statusAfisat = course.status === "published" ? "Activ" : "Draft";

                  return (
                    <CourseCard
                      key={course.courseId}
                      courseId={course.courseId}
                      title={course.title}
                      subtitle={course.description}
                      studentsCount={course.enrollmentCount}
                      rating={course.avgRating}
                      status={statusAfisat}
                      idx={index}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-10">
            <QuizTable quizzes={data.quizzesPreview} />
            <CommentList comments={data.commentsPreview} />
          </div>
        </main>
      )}
    </div>
  );
}

export default ProfessorDashboardPage;
