import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { lessonVideoService } from "../services/lesson-video.service";
import type { StreakResponse } from "../types";

interface StreakBadgeProps {
    studentId: string;
}

export function StreakBadge({ studentId }: StreakBadgeProps) {
    const [streakData, setStreakData] = useState<StreakResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) return;

        let mounted = true;
        lessonVideoService.getStudentStreak(studentId)
            .then((data) => {
                if (mounted) {
                    setStreakData(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Eroare la preluarea streak-ului:", err);
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, [studentId]);

    if (loading || !streakData) return null;

    const { currentStreak, hasCompletedToday } = streakData;

    // Dacă nu are niciun streak și nu a făcut nimic azi, putem alege să ascundem badge-ul
    if (currentStreak === 0 && !hasCompletedToday) return null;

    return (
        <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm border shadow-sm transition-all
        ${hasCompletedToday
                ? 'bg-orange-100 text-orange-600 border-orange-200'
                : 'bg-neutral-100 text-neutral-500 border-neutral-200 grayscale-[0.5]'
            }`}
            title={hasCompletedToday ? "Ai învățat azi! Streak menținut." : "Completează o lecție azi pentru a-ți menține streak-ul!"}
        >
            <Flame
                className={`size-4 ${hasCompletedToday ? "text-orange-500 fill-orange-500" : "text-neutral-400"}`}
            />
            <span>{currentStreak} {currentStreak === 1 ? 'zi' : 'zile'}</span>
        </div>
    );
}