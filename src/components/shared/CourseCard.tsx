import { Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { lessonVideoService } from "@/features/lesson-video/services/lesson-video.service";
import type { StudentCourse } from "@/features/dashboard-student/types";

interface ProfessorCourseCardProps {
  variant: "professor";
  courseId: string;
  title: string;
  subtitle: string;
  studentsCount: number | string;
  rating: number | string;
  status: "Activ" | "Draft";
  gradientClass: string;
}

interface StudentCourseCardProps {
  variant: "student";
  course: StudentCourse;
  idx: number;
}

type CourseCardProps = ProfessorCourseCardProps | StudentCourseCardProps;

function ProfessorCard({
  courseId,
  title,
  subtitle,
  studentsCount,
  rating,
  status,
  gradientClass,
}: Omit<ProfessorCourseCardProps, "variant">) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className={`h-32 w-full relative ${gradientClass}`}>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {status}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4 flex-1">
          <h3 className="font-bold text-lg text-foreground line-clamp-1" title={title}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-primary" />
            <span className="font-medium">{studentsCount} studenți</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
          <button
            onClick={() => navigate(`/professor/courses/${courseId}`)}
            className="py-2 px-4 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition text-center"
          >
            Editează
          </button>

          <button
            onClick={() => navigate(`/professor/courses/${courseId}`)}
            className={`py-2 px-4 rounded-xl font-medium text-sm transition text-center ${
              status === "Activ"
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-muted text-muted-foreground hover:bg-border/50"
            }`}
          >
            {status === "Activ" ? "Public" : "Vezi Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentCard({ course, idx }: { course: StudentCourse; idx: number }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const HEADER_COLORS = ["bg-secondary", "bg-accent"];
  const headerColor = HEADER_COLORS[idx % HEADER_COLORS.length];

  const handleCourseClick = async () => {
    if (!course.courseId) {
      navigate("/student/courses");
      return;
    }

    try {
      const studentId = user?.id;
      if (!studentId) {
        navigate(`/student/courses/${course.courseId}`);
        return;
      }

      const modules = await lessonVideoService.getModules(studentId, course.courseId);
      const firstLectureId = modules?.[0]?.lectures?.[0]?.lectureId;

      if (firstLectureId) {
        navigate(`/student/courses/${course.courseId}/lectures/${firstLectureId}`);
        return;
      }

      navigate(`/student/courses/${course.courseId}`);
    } catch {
      navigate(`/student/courses/${course.courseId}`);
    }
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border flex flex-col group h-full">
      <div className={`h-32 ${headerColor} relative group-hover:h-36 transition-all duration-300`}>
        <div className="absolute top-3 right-3 bg-success text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
          ACTIV
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-foreground mb-1 truncate leading-tight tracking-tight">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground font-bold mb-6">
          Progres: {course.overallProgress}%
        </p>
        <div className="flex justify-between items-center py-3 border-b border-border/50 mb-7 text-muted-foreground font-bold text-xs mt-auto">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            {course.enrollmentCount ?? 0}
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {course.avgRating ?? "N/A"}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(`/student/courses/${course.courseId ?? ""}`)}
            className="bg-primary/10 text-primary py-2.5 rounded-xl text-[10.5px] font-black hover:bg-primary/20 transition-all uppercase tracking-tight focus:outline-none"
          >
            QUIZ
          </button>
          <button
            type="button"
            onClick={() => void handleCourseClick()}
            className="bg-muted text-muted-foreground py-2.5 rounded-xl text-[10.5px] font-black hover:bg-border transition-all uppercase tracking-tight focus:outline-none"
          >
            CURS
          </button>
        </div>
      </div>
    </div>
  );
}

export function CourseCard(props: CourseCardProps) {
  if (props.variant === "professor") {
    const { variant: _, ...rest } = props;
    return <ProfessorCard {...rest} />;
  }
  return <StudentCard course={props.course} idx={props.idx} />;
}