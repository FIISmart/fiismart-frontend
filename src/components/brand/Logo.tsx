import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getHomePath } from "@/lib/routes";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  darkSmart?: boolean;
};

export function Logo({ className = "", iconClassName = "", textClassName = "", darkSmart = false }: LogoProps) {
  const { user } = useAuth();

  return (
    <Link to={getHomePath(user?.role)} className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-primary ${iconClassName}`}>
        <GraduationCap className="h-5 w-5 text-white" />
      </span>
      <span className={`font-heading text-xl font-bold ${textClassName}`}>
        <span className="text-primary">FII</span>
        <span className={darkSmart ? "text-white" : "text-black"}> Smart</span>
      </span>
    </Link>
  );
}
