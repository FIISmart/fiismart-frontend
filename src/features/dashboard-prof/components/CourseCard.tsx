import { Users, Star, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
    courseId: string;
    title: string;
    subtitle: string;
    studentsCount: number | string;
    rating: number | string;
    status: "Activ" | "Draft";
    gradientClass: string;
}

export function CourseCard({
                               courseId,
                               title,
                               subtitle,
                               studentsCount,
                               rating,
                               status,
                               gradientClass,
                           }: CourseCardProps) {
    const navigate = useNavigate();
    return (
        <div className="bg-edu-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className={`h-32 w-full relative ${gradientClass}`}>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-edu-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {status}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="mb-4 flex-1">
                    <h3
                        className="font-poppins font-bold text-lg text-edu-foreground line-clamp-1"
                        title={title}
                    >
                        {title}
                    </h3>
                    <p className="text-sm text-edu-muted-fg mt-1">{subtitle}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-edu-muted-fg mb-4">
                    <div className="flex items-center gap-1.5">
                        <Users size={16} className="text-edu-primary" />
                        <span className="font-medium">{studentsCount} studenți</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        <span className="font-medium">{rating}</span>
                    </div>
                </div>

                {/* Secțiunea butoanelor - Actualizată pentru a include Preview */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-edu-border/50">
                    <button
                        onClick={() => navigate(`/professor/preview/${courseId}`)}
                        className="py-2 px-4 rounded-xl border border-edu-border text-edu-muted-fg font-medium text-sm hover:bg-edu-bg transition flex items-center justify-center gap-1.5 w-full"
                    >
                        <Eye size={16} />
                        Preview
                    </button>
                    <button
                        onClick={() => navigate(`/professor/courses/${courseId}`)}
                        className="py-2 px-4 rounded-xl bg-edu-bg/50 text-edu-muted-fg font-medium text-sm hover:bg-edu-bg transition text-center w-full"
                    >
                        Editează
                    </button>
                </div>
            </div>
        </div>
    );
}