import { Star, Users } from "lucide-react";
import type { StudentCourse } from "../types";

interface CourseCardProps {
  course: StudentCourse;
  idx: number;
}

const HEADER_COLORS = ["bg-[#b1a7d1]", "bg-[#8ad6cc]"];

/**
 * Tile representing a single enrolled course inside MyCourses.
 */
export function CourseCard({ course, idx }: CourseCardProps) {
  const headerColor = HEADER_COLORS[idx % HEADER_COLORS.length];

  return (
    <div className="bg-white rounded-[22px] overflow-hidden shadow-sm border border-black/5 flex flex-col group h-full">
      <div
        className={`h-32 ${headerColor} relative group-hover:h-36 transition-all duration-300`}
      >
        <div className="absolute top-3 right-3 bg-[#22c55e] text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
          ACTIV
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-[15.5px] text-[#1a1a2e] mb-1 truncate leading-tight tracking-tight">
          {course.title}
        </h3>
        <p className="text-[12.5px] text-gray-400 font-bold mb-6">
          Progres: {course.overallProgress}%
        </p>
        <div className="flex justify-between items-center py-3 border-b border-gray-50 mb-7 text-gray-500 font-bold text-[12px] mt-auto">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-gray-300" />
            {course.enrollmentCount}
          </div>
          <div className="flex items-center gap-2 text-[#1a1a2e]">
            <Star size={15} className="text-yellow-400 fill-yellow-400" />
            {course.avgRating}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="bg-[#9b8ec7]/10 text-[#9b8ec7] py-2.5 rounded-xl text-[10.5px] font-black hover:bg-[#9b8ec7]/20 transition-all uppercase tracking-tight focus:outline-none"
          >
            QUIZ
          </button>
          <button
            type="button"
            className="bg-gray-100 text-gray-500 py-2.5 rounded-xl text-[10.5px] font-black hover:bg-gray-200 transition-all uppercase tracking-tight focus:outline-none"
          >
            CURS
          </button>
        </div>
      </div>
    </div>
  );
}
