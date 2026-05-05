import { BarChart2, BookOpen, CheckSquare, Users } from "lucide-react";
import type { StudentStats } from "../types";
import { StatCard } from "./StatCard";

interface StatsGridProps {
  stats: StudentStats;
}

/**
 * Four-up grid summarising the student's enrolment and activity numbers.
 */
export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      <StatCard
        val={stats.enrolledCourses}
        label="ÎNROLATE"
        icon={<Users className="text-[#9b8ec7] opacity-70" />}
      />
      <StatCard
        val={stats.activeCourses}
        label="ACTIVE"
        icon={<BookOpen className="text-[#5EEAD4]" />}
      />
      <StatCard
        val={stats.quizzesCompleted?.toLocaleString() ?? "0"}
        label="QUIZ-URI"
        icon={<CheckSquare className="text-pink-400" />}
      />
      <StatCard
        val={`${stats.streakDays} zile`}
        label="STREAK"
        icon={<BarChart2 className="text-green-500" />}
      />
    </div>
  );
}
