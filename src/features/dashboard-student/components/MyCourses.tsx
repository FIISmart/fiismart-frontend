import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Recommendation, StudentCourse } from "../types";
import { CourseCard } from "@/components/shared/CourseCard";

interface MyCoursesProps {
  courses: StudentCourse[];
  recommendation: Recommendation | null;
}

export function MyCourses({ courses, recommendation }: MyCoursesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const visibleCourses = isExpanded ? courses : courses.slice(0, 2);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Cursurile Mele</h2>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="text-[13px] font-bold text-primary hover:underline focus:outline-none"
        >
          {isExpanded ? "Restrânge" : "Vezi toate"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCourses.map((course, i) => (
          <CourseCard key={`${course.title}-${i}`} variant="student" course={course} idx={i} />
        ))}

        {recommendation && (
          <div className="bg-card/40 rounded-2xl border-2 border-dashed border-secondary p-8 flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-2">✨</span>
            <h4 className="font-bold text-foreground text-[15px] mb-2 uppercase tracking-wide">
              ARIA: {recommendation.title}
            </h4>
            <p className="text-[12.5px] text-gray-500 font-bold mb-6 max-w-[200px]">
              {recommendation.description}
            </p>
            <button
              type="button"
              onClick={() =>
                recommendation.courseId
                  ? navigate(`/student/courses/${recommendation.courseId}`)
                  : navigate("/student/courses")
              }
              className="px-7 py-2.5 border border-primary rounded-lg text-[12.5px] font-bold text-primary hover:bg-primary/5 focus:outline-none"
            >
              Descoperă cursuri
            </button>
          </div>
        )}
      </div>
    </section>
  );
}