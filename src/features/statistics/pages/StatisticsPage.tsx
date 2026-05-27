import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BarChart3, BookOpen, CheckCircle2, ClipboardCheck, GraduationCap, Star, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { UserRole } from "@/features/auth/types";
import { StudentNavbar } from "@/features/dashboard-student/components/StudentNavbar";
import { ProfDashboardNavbar } from "@/features/dashboard-prof/components/ProfDashboardNavbar";
import { getCourses, getQuizzes, getStats } from "@/features/dashboard-student/services/dashboard-student.service";
import type { StudentCourse, StudentQuiz, StudentStats } from "@/features/dashboard-student/types";
import { apiFetch } from "@/lib/api";
import type { DashboardOverviewResponse } from "@/features/dashboard-prof/types";

type StatTileProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
};

function StatTile({ title, value, subtitle, icon }: StatTileProps) {
  return (
    <Card className="border-border/60 bg-white shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#9b8ec7]/12 text-[#9b8ec7]">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-[#1a1a2e]">{value}</p>
          <p className="text-sm font-semibold text-[#5a5470]">{title}</p>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [studentQuizzes, setStudentQuizzes] = useState<StudentQuiz[]>([]);
  const [professorOverview, setProfessorOverview] = useState<DashboardOverviewResponse | null>(null);

  const isProfessor = user?.role === UserRole.PROFESSOR;

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);

    const load = isProfessor
      ? apiFetch<DashboardOverviewResponse>("/teacher-dashboard/me/overview").then((data) => {
          if (!cancelled) setProfessorOverview(data);
        })
      : Promise.all([
          getStats(user.id),
          getCourses(user.id),
          getQuizzes(user.id),
        ]).then(([stats, courses, quizzes]) => {
          if (cancelled) return;
          setStudentStats(stats);
          setStudentCourses(courses ?? []);
          setStudentQuizzes(quizzes ?? []);
        });

    load.catch((err) => {
      if (!cancelled) {
        const message = err instanceof Error ? err.message : "Nu am putut incarca statisticile.";
        toast.error(message);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isProfessor, user?.id]);

  const firstName = user?.firstName || (isProfessor ? "Profesor" : "Student");
  const initials = `${user?.firstName?.[0] ?? (isProfessor ? "P" : "S")}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const averageProgress = useMemo(() => {
    if (studentCourses.length === 0) return 0;
    return Math.round(studentCourses.reduce((sum, course) => sum + course.overallProgress, 0) / studentCourses.length);
  }, [studentCourses]);

  const quizAverage = useMemo(() => {
    if (studentQuizzes.length === 0) return 0;
    return Math.round(studentQuizzes.reduce((sum, quiz) => sum + quiz.scor, 0) / studentQuizzes.length);
  }, [studentQuizzes]);

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFE8]">
        <Spinner className="size-8 text-[#9b8ec7]" />
      </div>
    );
  }

  if (isProfessor) {
    const stats = professorOverview?.stats;
    const courses = professorOverview?.coursesPreview ?? [];
    const quizzes = professorOverview?.quizzesPreview ?? [];

    return (
      <div className="min-h-screen bg-[#F4EFE8]">
        <ProfDashboardNavbar />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9b8ec7]">Statistici profesor</p>
            <h1 className="mt-1 text-3xl font-bold text-[#1a1a2e]">Activitatea cursurilor tale</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Datele sunt calculate din cursurile create, inscrieri si incercari de quiz.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile title="Studenti inscrisi" value={stats?.studentsEnrolled ?? 0} icon={<Users className="h-5 w-5" />} />
            <StatTile title="Cursuri active" value={stats?.activeCourses ?? 0} icon={<BookOpen className="h-5 w-5" />} />
            <StatTile title="Quiz-uri completate" value={stats?.quizzesCompleted ?? 0} icon={<ClipboardCheck className="h-5 w-5" />} />
            <StatTile title="Rata completare" value={`${stats?.completionRatePct ?? 0}%`} icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-bold text-[#1a1a2e]">Top cursuri recente</h2>
                {courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nu exista cursuri create momentan.</p>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.courseId} className="rounded-xl border border-border/60 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-[#1a1a2e]">{course.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                          </div>
                          <span className="rounded-full bg-[#9b8ec7]/10 px-2.5 py-1 text-xs font-semibold text-[#5a5470]">
                            {course.enrollmentCount} inscrieri
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-bold text-[#1a1a2e]">Quiz-uri</h2>
                {quizzes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nu exista incercari de quiz pentru cursurile tale.</p>
                ) : (
                  <div className="space-y-3">
                    {quizzes.map((quiz) => (
                      <div key={quiz.quizId} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                        <div>
                          <p className="font-semibold text-[#1a1a2e]">{quiz.title}</p>
                          <p className="text-sm text-muted-foreground">{quiz.courseTitle}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-bold text-[#1a1a2e]">{quiz.avgScorePct}%</p>
                          <p className="text-xs text-muted-foreground">{quiz.attemptsCount} incercari</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const coursesInProgress = studentCourses.filter((course) => course.overallProgress > 0 && course.overallProgress < 100);
  const finishedCourses = studentCourses.filter((course) => course.overallProgress >= 100);

  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <StudentNavbar studentName={firstName} initials={initials} />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-8 md:px-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9b8ec7]">Statistici student</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#1a1a2e]">Progresul tau</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Date calculate din inscrieri, progresul lectiilor si rezultatele quiz-urilor.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile title="Cursuri inscrise" value={studentStats?.enrolledCourses ?? studentCourses.length} icon={<BookOpen className="h-5 w-5" />} />
          <StatTile title="In progres" value={coursesInProgress.length} icon={<BarChart3 className="h-5 w-5" />} />
          <StatTile title="Finalizate" value={finishedCourses.length} icon={<CheckCircle2 className="h-5 w-5" />} />
          <StatTile title="Scor mediu quiz" value={`${quizAverage}%`} icon={<Star className="h-5 w-5" />} />
        </div>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1a1a2e]">Progres mediu cursuri</h2>
                <p className="text-sm text-muted-foreground">{studentCourses.length} cursuri in cont</p>
              </div>
              <span className="text-2xl font-bold text-[#9b8ec7]">{averageProgress}%</span>
            </div>
            <Progress value={averageProgress} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-bold text-[#1a1a2e]">Cursuri</h2>
              {studentCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nu esti inscris la niciun curs.</p>
              ) : (
                <div className="space-y-4">
                  {studentCourses.map((course) => (
                    <div key={course.courseId ?? course.title} className="rounded-xl border border-border/60 p-4">
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <p className="font-semibold text-[#1a1a2e]">{course.title}</p>
                        <span className="text-sm font-bold text-[#9b8ec7]">{course.overallProgress}%</span>
                      </div>
                      <Progress value={course.overallProgress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-bold text-[#1a1a2e]">Quiz-uri completate</h2>
              {studentQuizzes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nu ai quiz-uri completate momentan.</p>
              ) : (
                <div className="space-y-3">
                  {studentQuizzes.map((quiz, index) => (
                    <div key={`${quiz.quizId ?? quiz.titluQuiz}-${index}`} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                      <div>
                        <p className="font-semibold text-[#1a1a2e]">{quiz.titluQuiz}</p>
                        <p className="text-sm text-muted-foreground">{quiz.numeCurs}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1a1a2e]">{quiz.scor}%</p>
                        <p className="text-xs text-muted-foreground">{quiz.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white">
          <CardContent className="flex items-center gap-4 p-5 text-sm text-muted-foreground">
            <GraduationCap className="h-5 w-5 shrink-0 text-[#9b8ec7]" />
            Statisticile care nu au suport backend real au fost eliminate din aceasta pagina in loc sa afiseze valori inventate.
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
