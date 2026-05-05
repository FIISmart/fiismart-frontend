import { useState } from "react";
import type { Recommendation, StudentCourse } from "../types";
import { CourseCard } from "./CourseCard";

interface MyCoursesProps {
  courses: StudentCourse[];
  recommendation: Recommendation | null;
}

/**
 * Lists the student's enrolled courses with a "see all"/"collapse" toggle
 * and an optional recommendation tile in the trailing slot.
 */
export function MyCourses({ courses, recommendation }: MyCoursesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleCourses = isExpanded ? courses : courses.slice(0, 2);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-[19px] text-[#1a1a2e]">Cursurile Mele</h2>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="text-[13px] font-bold text-[#9b8ec7] hover:underline focus:outline-none"
        >
          {isExpanded ? "Restrânge" : "Vezi toate"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCourses.map((course, i) => (
          <CourseCard key={`${course.title}-${i}`} course={course} idx={i} />
        ))}

        {recommendation && (
          <div className="bg-white/40 rounded-[22px] border-2 border-dashed border-[#bda6ce] p-8 flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-2">✨</span>
            <h4 className="font-bold text-[#1a1a2e] text-[15px] mb-2 uppercase tracking-wide">
              ARIA: {recommendation.title}
            </h4>
            <p className="text-[12.5px] text-gray-500 font-bold mb-6 max-w-[200px]">
              {recommendation.description}
            </p>
            <button
              type="button"
              className="px-7 py-2.5 border border-[#9b8ec7] rounded-lg text-[12.5px] font-bold text-[#9b8ec7] hover:bg-[#9b8ec7]/5 focus:outline-none"
            >
              Descoperă cursuri
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
