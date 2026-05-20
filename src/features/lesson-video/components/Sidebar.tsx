import {
  PlayCircle,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ModuleSummary } from "../types";
import { lessonVideoService } from "../services/lesson-video.service";

interface SidebarProps {
  studentId: string;
  courseId: string;
  activeLectureId: string | null;
  onSelectLecture: (lectureId: string) => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
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
}: SidebarProps) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const overallProgressRef = useRef<HTMLDivElement | null>(null);
  // Static "14%" placeholder progress, mirroring source.
  useEffect(() => {
    if (overallProgressRef.current) {
      overallProgressRef.current.style.width = "14%";
    }
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await lessonVideoService.getModules(studentId, courseId);
        setModules(data);
        if (data && data.length > 0) {
          setExpandedModules([data[0].moduleId]);
        }
      } catch (error) {
        console.error("Eroare la încărcarea modulelor", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchModules();
  }, [studentId, courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 text-muted-foreground text-center">
        Se încarcă lecțiile...
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
      <h3 className="font-bold text-xl text-foreground mb-6">Conținut curs</h3>

      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-muted-foreground">Progres</span>
          <span className="text-primary">14%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div ref={overallProgressRef} className="h-full w-0 bg-primary rounded-full" />
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
                      {completedLectures}/{lectures.length} lecții
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp size={20} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={20} className="text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="p-2 space-y-1 bg-card">
                  {lectures.map((lecture) => {
                    const isActive =
                      lecture.watchedPercent > 0 && !lecture.completed;
                    const isSelected = lecture.lectureId === activeLectureId;

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
                            <CheckCircle2
                              size={18}
                              className="text-emerald-500"
                            />
                          ) : isActive ? (
                            <PlayCircle size={18} className="text-primary" />
                          ) : (
                            <Circle
                              size={18}
                              className="text-muted-foreground/50"
                            />
                          )}
                        </div>
                        <div className="flex-1">
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
                              <LectureProgressBar
                                percent={lecture.watchedPercent}
                              />
                              <span className="text-xs text-primary font-medium">
                                {lecture.watchedPercent}%
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDuration(lecture.durationSecs)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {moduleItem.quiz && (
                    <div className="flex items-center gap-3 p-3 mt-2 rounded-lg bg-accent/20 border border-accent/40 cursor-pointer hover:bg-accent/30 transition-colors">
                      <HelpCircle size={18} className="text-foreground" />
                      <div>
                        <h5 className="text-sm font-medium text-foreground">
                          Quiz Modul {moduleItem.order}
                        </h5>
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">
                          {moduleItem.quiz.statusLabel}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
