import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { AnswersFeed } from "../components/AnswersFeed";
import { MyCourses } from "../components/MyCourses";
import { QuickActions } from "../components/QuickActions";
import { QuizzesTable } from "../components/QuizzesTable";
import { StatsGrid } from "../components/StatsGrid";
import { StudentNavbar } from "../components/StudentNavbar";
import {
  getAnswers,
  getContinue,
  getCourses,
  getQuizzes,
  getRecommendations,
  getStats,
} from "../services/dashboard-student.service";
import type {
  Answer,
  ContinueStudy,
  Recommendation,
  StudentCourse,
  StudentQuiz,
  StudentStats,
} from "../types";

const EMPTY_STATS: StudentStats = {
  enrolledCourses: 0,
  activeCourses: 0,
  quizzesCompleted: 0,
  streakDays: 0,
};

interface DashboardData {
  stats: StudentStats;
  courses: StudentCourse[];
  quizzes: StudentQuiz[];
  answers: Answer[];
  continueStudy: ContinueStudy | null;
  recommendation: Recommendation | null;
}

const EMPTY_DATA: DashboardData = {
  stats: EMPTY_STATS,
  courses: [],
  quizzes: [],
  answers: [],
  continueStudy: null,
  recommendation: null,
};

/**
 * Top-level student dashboard page. Fetches all dashboard sections in
 * parallel; on any backend failure we render an empty state instead of
 * crashing — the layout shell is still visible.
 */
export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    async function fetchAll(studentId: string) {
      setLoading(true);
      try {
        const [stats, courses, quizzes, answers, cont, rec] = await Promise.all([
          getStats(studentId),
          getCourses(studentId),
          getQuizzes(studentId),
          getAnswers(studentId),
          getContinue(studentId),
          getRecommendations(studentId),
        ]);

        if (cancelled) return;
        setData({
          stats: stats ?? EMPTY_STATS,
          courses: courses ?? [],
          quizzes: quizzes ?? [],
          answers: answers ?? [],
          continueStudy: cont?.cursId ? cont : null,
          recommendation: rec?.courseId ? rec : null,
        });
      } catch {
        if (!cancelled) setData(EMPTY_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll(user.id);
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-edu-cream">
        <Spinner className="size-8 text-[#9b8ec7]" />
      </div>
    );
  }

  const firstName = data.stats.firstName ?? data.stats.name ?? user.firstName ?? "Student";
  const lastName = data.stats.lastName ?? user.lastName ?? "";
  const initials = ((firstName[0] ?? "S") + (lastName[0] ?? "")).toUpperCase();

  return (
    <div className="min-h-screen pb-20 select-none bg-[#F4EFE8]">
      <StudentNavbar studentName={firstName} initials={initials} />

      <main className="max-w-[1280px] mx-auto px-4 md:px-12 pt-6 md:pt-10 flex flex-col gap-8 md:gap-10">
        <div>
          <h1 className="font-serif text-[28px] md:text-[32px] font-bold text-[#1a1a2e]">
            Salut, {firstName}! 👋
          </h1>
          <p className="text-[14.5px] text-gray-500 font-medium opacity-80 mt-1">
            {loading
              ? "Se încarcă datele tale..."
              : "Continuă-ți parcursul de învățare pe FiiSmart."}
          </p>
        </div>

        <StatsGrid stats={data.stats} />
        <QuickActions continueStudy={data.continueStudy} />
        <MyCourses courses={data.courses} recommendation={data.recommendation} />
        <QuizzesTable quizzes={data.quizzes} />
        <AnswersFeed answers={data.answers} />
      </main>
    </div>
  );
}
