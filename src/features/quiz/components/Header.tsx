import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full h-[49px] bg-[#F2EAE0] border-b border-[#E5DDD4] flex items-center justify-between px-6 shrink-0">
      <div className="font-bold text-[16px] text-[#9B8EC7]">FIISmart</div>

      <div className="flex items-center gap-6">
        <Link
          to="/student/dashboard"
          className="text-[14px] font-medium text-[#5A4A3A] hover:text-[#9B8EC7] transition-colors"
        >
          Home
        </Link>
        <Link
          to="/student/quizzes"
          className="text-[14px] font-medium text-[#9B8EC7]"
        >
          Quiz
        </Link>
      </div>
    </header>
  );
}