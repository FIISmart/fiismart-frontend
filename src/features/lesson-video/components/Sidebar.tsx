import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Code,
  FileText,
  HelpCircle,
  PlayCircle,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ModuleSummary, QuizStatus } from "../types";
import { lessonVideoService } from "../services/lesson-video.service";

interface SidebarProps {
  studentId: string;
  courseId: string;
  activeLectureId: string | null;
  onSelectLecture: (lectureId: string) => void;
  overallProgress?: number;
  finalQuiz?: QuizStatus | null;
  refreshTrigger?: number;
}

const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const statusLabel = (quiz?: QuizStatus | null) => {
  if (!quiz) return "Disponibil";
  if (quiz.statusLabel) return quiz.statusLabel;
  const score = quiz.latestScore ?? quiz.lastScore;
  if (score !== undefined && score !== null) return `Finalizat - ${score}%`;
  if (quiz.status === "promovat") return "Finalizat";
  if (quiz.status === "picat") return "Incercat";
  return "Disponibil";
};

const lessonMetaLabel = (type?: string, durationSecs?: number) => {
  const duration = formatDuration(durationSecs ?? 0);
  if (duration) return duration;
  if (type === "pdf") return "Document";
  if (type === "markdown") return "Text";
  return "Durata indisponibila";
};

interface LectureProgressBarProps {
  percent: number;
}

function LectureProgressBar({ percent }: LectureProgressBarProps) {
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.width = `${percent}%`;
    }
  }, [percent]);

  return (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
      <div ref={fillRef} className="h-full w-0 bg-primary" />
    </div>
  );
}

export default function Sidebar({
  studentId,
  courseId,
  activeLectureId,
  onSelectLecture,
  overallProgress = 0,
  finalQuiz,
  refreshTrigger = 0,
}: SidebarProps) {
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await lessonVideoService.getModules(studentId, courseId);
        setModules(data);
        if (data && data.length > 0 && expandedModules.length === 0) {
          setExpandedModules([data[0].moduleId]);
        }
      } catch (error) {
        console.error("Eroare la incarcarea modulelor", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchModules();
    // Keep the user's current accordion state during background refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, courseId, refreshTrigger]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  const openQuiz = (quiz?: QuizStatus | null) => {
    if (!quiz?.quizId) return;
    navigate(`/student/quizzes/${quiz.quizId}?courseId=${courseId}`);
  };

  if (loading && modules.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 text-muted-foreground text-center">
        Se incarca lectiile...
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
      <h3 className="font-bold text-xl text-foreground mb-6">Continut curs</h3>

      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-muted-foreground">Progres</span>
          <span className="text-primary">{overallProgress}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {modules.map((moduleItem) => {
          const isExpanded = expandedModules.includes(moduleItem.moduleId);
          const lectures = moduleItem.lectures || [];
          const completedLectures = lectures.filter((l) => l.completed).length;

          return (
            <div
              key={moduleItem.moduleId}
              className="border border-border rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleModule(moduleItem.moduleId)}
                className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-sm font-bold text-foreground">
                    {moduleItem.order}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-foreground">
                      {moduleItem.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {completedLectures}/{lectures.length} lectii
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="p-2 space-y-1 bg-card">
                  {lectures.map((lecture) => {
                    const isActive = lecture.watchedPercent > 0 && !lecture.completed;
                    const isSelected = lecture.lectureId === activeLectureId;
                    const LectureIcon = lecture.type === "pdf"
                      ? FileText
                      : lecture.type === "markdown"
                        ? Code
                        : PlayCircle;

                    return (
                      <div
                        key={lecture.lectureId}
                        onClick={() => onSelectLecture(lecture.lectureId)}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer border ${
                          isSelected
                            ? "bg-secondary/20 border-primary"
                            : "hover:bg-muted/30 border-transparent"
                        }`}
                      >
                        <div className="mt-0.5">
                          {lecture.completed ? (
<CheckCircle2 className="size-5 text-emerald-500" />
                           ) : isActive ? (
                            <LectureIcon className="size-5 text-primary" />
                           ) : (
                            <Circle className="size-5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5
                            className={`text-sm ${
                              lecture.completed
                                ? "text-muted-foreground"
                                : "text-foreground font-medium"
                            }`}
                          >
                            {lecture.title}
                          </h5>
                          {isActive ? (
                            <div className="mt-2 flex items-center gap-2">
                              <LectureProgressBar percent={lecture.watchedPercent} />
                              <span className="text-xs text-primary font-medium">
                                {lecture.watchedPercent}%
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              {lessonMetaLabel(lecture.type, lecture.durationSecs)}
                            </p>
                          )}

                          {lecture.quiz?.quizId && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openQuiz(lecture.quiz);
                              }}
                              className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                            >
                              <HelpCircle className="size-4 shrink-0" />
                              <span className="shrink-0">Quiz lectie</span>
                              <span className="truncate text-muted-foreground">
                                {statusLabel(lecture.quiz)}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {moduleItem.quiz?.quizId && (
                    <button
                      type="button"
                      onClick={() => openQuiz(moduleItem.quiz)}
                      className="flex w-full items-center gap-3 p-3 mt-2 rounded-lg bg-accent/20 border border-accent/40 cursor-pointer hover:bg-accent/30 transition-colors text-left"
                    >
                      <HelpCircle className="size-5 text-foreground shrink-0" />
                      <div className="min-w-0">
                        <h5 className="text-sm font-medium text-foreground">
                          Quiz Modul {moduleItem.order}
                        </h5>
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">
                          {statusLabel(moduleItem.quiz)}
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {finalQuiz?.quizId && (
          <button
            type="button"
            onClick={() => openQuiz(finalQuiz)}
            className="flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left hover:bg-primary/10"
          >
            <Trophy className="size-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-foreground">Quiz final curs</h4>
              <p className="text-xs text-muted-foreground">{statusLabel(finalQuiz)}</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
