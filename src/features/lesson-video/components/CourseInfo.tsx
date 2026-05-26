import { Users, Star } from "lucide-react";
import type { CourseHeader } from "../types";

interface Props {
  courseData: CourseHeader | null;
}

export default function CourseInfo({ courseData }: Props) {
  if (!courseData) return null;

  const teacherName = courseData.teacherDisplayName || courseData.teacher?.displayName || "Profesor";

  const firstTag = courseData.tags && courseData.tags.length > 0
      ? courseData.tags[0]
      : "Curs Standard";

  return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {courseData.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {courseData.description || "Nicio descriere adăugată pentru acest curs."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-6">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {teacherName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{teacherName}</p>
              <p className="text-xs text-muted-foreground">Instructor</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              <Users size={16} />
              <span>{courseData.enrollmentCount || 0} Studenți înscriși</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
              <Star size={16} fill="currentColor" />
              <span>{firstTag}</span>
            </div>

          </div>
        </div>
      </div>
  );
}