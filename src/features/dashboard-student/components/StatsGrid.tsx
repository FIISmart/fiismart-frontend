import { BarChart2, BookOpen, CheckSquare, Users } from "lucide-react";
import type { StudentStats } from "../types";
import { StatCard } from "@/components/shared/StatCard";

interface StatsGridProps {
  stats: StudentStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      <StatCard
        title="ÎNROLATE"
        value={stats.enrolledCourses}
        icon={<Users className="size-5 text-primary opacity-70" />}
        variant="compact"
      />
      <StatCard
        title="ACTIVE"
        value={stats.activeCourses}
        icon={<BookOpen className="size-5 text-primary" />}
        variant="compact"
      />
      <StatCard
        title="QUIZ-URI"
        value={stats.quizzesCompleted?.toLocaleString() ?? "0"}
        icon={<CheckSquare className="size-5 text-primary" />}
        variant="compact"
      />
      <StatCard
        title="STREAK"
        value={`${stats.streakDays} zile`}
        icon={<BarChart2 className="size-5 text-primary" />}
        variant="compact"
      />
    </div>
  );
}
