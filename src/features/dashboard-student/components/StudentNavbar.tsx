import { Bell, ChevronDown, GraduationCap } from "lucide-react";

interface StudentNavbarProps {
  studentName: string;
  initials: string;
}

/**
 * Top navigation bar for the student dashboard. Mirrors the marketing site's
 * branding (purple FII / dark Smart) and surfaces the active student profile.
 */
export function StudentNavbar({ studentName, initials }: StudentNavbarProps) {
  return (
    <nav className="relative h-20 w-full bg-[#F4EFE8] flex items-center justify-center px-4 md:px-12">
      <div className="max-w-[1280px] w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#9b8ec7] rounded-[14px] flex items-center justify-center text-white shadow-sm">
            <GraduationCap size={22} />
          </div>
          <div className="flex font-bold text-xl tracking-[-0.5px]">
            <span className="text-[#9b8ec7]">FII</span>
            <span className="text-[#2d2a3e] ml-1">Smart</span>
          </div>
        </div>

        <div className="hidden lg:flex gap-10 text-[15px] font-semibold text-[#5a5470]">
          <a href="#">Cursuri</a>
          <a href="#">Funcționalități</a>
          <a href="#">Despre Noi</a>
          <a href="#">Contact</a>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <Bell size={20} className="text-gray-400 cursor-pointer hidden sm:block" />
          <div className="flex items-center gap-2.5 px-3 md:px-4 py-1.5 bg-white rounded-full border border-black/5 shadow-sm">
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-[#9b8ec7]">
              {initials}
            </div>
            <span className="text-[13.5px] font-bold text-[#333333] hidden sm:block">
              {studentName}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      </div>
    </nav>
  );
}
