import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Button } from "@/components/ui/button.tsx";
import { apiFetch } from "@/lib/api";

import Header from "../components/Header.tsx";
import VideoPlayer from "../components/VideoPlayer.tsx";
import LessonContent, { inferLessonType } from "../components/LessonContent.tsx";
import CourseInfo from "../components/CourseInfo.tsx";
import Sidebar from "../components/Sidebar.tsx";
import CommentsSection from "../components/CommentsSection.tsx";
import { ReviewSection } from "../components/ReviewSection.tsx";
import { StreakBadge } from "../components/StreakBadge.tsx";

import { lessonVideoService } from "../services/lesson-video.service.ts";

import type {
  CourseComment,
  CourseHeader,
  GroupedVideoMarker,
  LectureDetails,
} from "../types";
type LessonVideoPageProps = {
  previewMode?: boolean;
};

export default function LessonVideoPage({ previewMode = false }: LessonVideoPageProps) {
  const { courseId, lectureId } = useParams<{
    courseId: string;
    lectureId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isPreview = location.pathname.startsWith("/professor/preview/");

  const [courseData, setCourseData] = useState<CourseHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLectureId, setActiveLectureId] = useState<string | null>(
    lectureId && lectureId !== "undefined" ? lectureId : null
  );

  const [lectureDetails, setLectureDetails] =
      useState<LectureDetails | null>(null);

  const [seekRequest, setSeekRequest] = useState<{
    time: number;
    id: number;
  } | null>(null);

  const [currentTime, setCurrentTime] = useState(0);

  const [lectureComments, setLectureComments] = useState<CourseComment[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const studentId = user?.id ?? null;

  useEffect(() => {
    if (lectureId && lectureId !== "undefined") setActiveLectureId(lectureId);
  }, [lectureId]);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;

    try {
      let data: CourseHeader;
      if (isPreview) {
        const { getCourseBuilderQuizzes } = await import("@/lib/api");
        const [courseRaw, builderQuizzes] = await Promise.all([
          apiFetch<any>(`/courses/${courseId}`),
          getCourseBuilderQuizzes(courseId).catch(() => [])
        ]);

        const finalQuiz = builderQuizzes.find(q => q.quizScope === 'course_final');

        data = {
          courseId: courseRaw.id,
          title: courseRaw.title,
          description: courseRaw.description,
          thumbnailUrl: courseRaw.thumbnailUrl,
          tags: courseRaw.tags || [],
          teacher: {
            teacherId: courseRaw.teacherId,
            displayName: "Profesor",
          },
          overallProgress: 0,
          finalQuiz: finalQuiz ? { quizId: finalQuiz.id, statusLabel: "Disponibil" } : undefined,
          modules: [],
        } as unknown as CourseHeader;
      } else {
        // Endpoint normal (studenți)
        if (!studentId) return;
        data = await lessonVideoService.getCourseInfo(studentId, courseId);
      }

      setCourseData(data);

      // If we don't have a lecture yet, default to the first one in the course
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstLectureId = (data as any)?.modules?.[0]?.lectures?.[0]?.lectureId;
      if (
        !activeLectureId &&
        firstLectureId &&
        typeof firstLectureId === "string" &&
        firstLectureId !== "undefined"
      ) {
        setActiveLectureId(firstLectureId);
      }
    } catch {
      setError("Eroare la încărcarea cursului.");
    } finally {
      setLoading(false);
    }
  }, [studentId, courseId, activeLectureId, isPreview]); // <-- NOU: Am adăugat isPreview la dependențe

  useEffect(() => {
    void fetchCourseData();
  }, [fetchCourseData, refreshTrigger]);

  const fetchLectureDetails = useCallback(async () => {
    if (!courseId || !activeLectureId || activeLectureId === "undefined") return;

    if (previewMode) {
      try {
        const { getModules } = await import("@/lib/api");
        const modules = await getModules(courseId);
        
        const currentLecture = modules
          .flatMap((module: any) => module.lectures || [])
          .find((lecture: any) => lecture.id === activeLectureId);

        if (!currentLecture) {
           setError("Lecția nu a putut fi găsită în modul preview.");
           return;
        }

        // Determina tipul lectiei daca lipseste din backend, pentru backwards compatibility
        let computedType = currentLecture.type;
        if (!computedType) {
          if (currentLecture.pdfUrl || (currentLecture.content && currentLecture.content.includes(".pdf"))) {
            computedType = "pdf";
          } else if (currentLecture.videoUrl) {
            computedType = "video";
          } else {
            computedType = "markdown";
          }
        }

        setLectureDetails({
          lectureId: currentLecture.id,
          title: currentLecture.title,
          type: computedType,
          content: currentLecture.content,
          videoUrl: currentLecture.videoUrl,
          pdfUrl: currentLecture.pdfUrl,
          durationSecs: currentLecture.durationSecs || 0,
          order: currentLecture.order || 0,
          completed: false,
          watchedPercent: 0,
          positionSecs: 0,
        } as any);
      } catch (err) {
         console.error("Eroare la preluarea lecției (preview):", err);
      }
      return;
    }

    // Fallback inteligent pentru ID-ul utilizatorului (preview profesor etc.)
    const currentId = studentId ?? user?.id;
    if (!currentId) return;

    try {
      const data = await lessonVideoService.getLectureDetails(
          currentId,
          courseId,
          activeLectureId
      );

      setLectureDetails(data);
    } catch (err) {
      console.error("Eroare la preluarea lecției:", err);
    }
  }, [previewMode, courseId, activeLectureId, studentId, user?.id]);

  useEffect(() => {
    void fetchLectureDetails();
  }, [fetchLectureDetails]);

  const groupedMarkersList = useMemo((): GroupedVideoMarker[] => {
    const groups: Record<number, CourseComment[]> = {};

    lectureComments.forEach((comment) => {
      const timeVal =
          comment.timestampSecs ?? comment.videoTimestamp;

      if (typeof timeVal === "number") {
        if (!groups[timeVal]) {
          groups[timeVal] = [];
        }

        groups[timeVal].push(comment);
      }
    });

    return Object.entries(groups).map(([time, comments]) => ({
      time: Number(time),
      comments,
      count: comments.length,
    }));
  }, [lectureComments]);

  // Find quiz for current module
  const currentModuleQuizId = useMemo(() => {
    if (!courseData) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modules = (courseData as any)?.modules ?? [];

    for (const mod of modules) {
      const hasLecture = mod.lectures?.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (lec: any) => lec.lectureId === activeLectureId
      );

      if (hasLecture && mod.quiz?.quizId) {
        return mod.quiz.quizId;
      }
    }

    return null;
  }, [courseData, activeLectureId]);

  const handleSeekAndHighlight = (time: number, id: string) => {
    setSeekRequest({
      time,
      id: Date.now(),
    });

    setActiveCommentId(id);
  };

  const handleProgressSaved = useCallback((response?: {
    lectureId: string;
    watchedPercent: number;
    positionSecs: number;
    completed: boolean;
    overallProgress: number;
  }) => {
    if (response) {
      setLectureDetails((prev) => prev && prev.lectureId === response.lectureId ? {
        ...prev,
        completed: response.completed,
        watchedPercent: response.watchedPercent,
        positionSecs: response.positionSecs,
      } : prev);
      setCourseData((prev) => prev ? {
        ...prev,
        overallProgress: response.overallProgress,
      } : prev);
    }
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleSelectLecture = useCallback((nextLectureId: string) => {
    if (!nextLectureId) return;
    setActiveLectureId(nextLectureId);
    if (courseId) {
      if (isPreview) {
        navigate(`/professor/preview/${courseId}/lectures/${nextLectureId}`);
      } else {
        navigate(`/student/courses/${courseId}/lectures/${nextLectureId}`);
      }
    }
  }, [courseId, navigate, isPreview]);

  const handleMarkComplete = useCallback(async (durationSecs?: number) => {
    if (isPreview) return;
    if (!studentId || !courseId || !activeLectureId || activeLectureId === "undefined") return;
    const nextDuration = durationSecs ?? lectureDetails?.durationSecs;
    setIsSaving(true);
    try {
      const response = await lessonVideoService.saveProgress(studentId, courseId, activeLectureId, {
        watchedPercent: 100,
        positionSecs: nextDuration ?? 0,
        completed: true,
        durationSecs: nextDuration && nextDuration > 0 ? nextDuration : undefined,
      });
      setLectureDetails((prev) => prev ? {
        ...prev,
        completed: response.completed,
        watchedPercent: response.watchedPercent,
        positionSecs: response.positionSecs,
        durationSecs: nextDuration ?? prev.durationSecs,
      } : prev);
      
      setCourseData(prev => prev ? {
          ...prev,
          overallProgress: response.overallProgress
      } : prev);
      
      handleProgressSaved();
    } catch (err) {
      console.error("Eroare la marcarea lectiei ca parcursa:", err);
    } finally {
      setIsSaving(false);
    }
  }, [activeLectureId, courseId, handleProgressSaved, lectureDetails?.durationSecs, studentId, isPreview]);

  const handleDurationDetected = useCallback(async (durationSecs: number) => {
    if (isPreview) return;
    if (!studentId || !courseId || !activeLectureId || activeLectureId === "undefined" || durationSecs <= 0) return;
    const currentDuration = lectureDetails?.durationSecs ?? 0;
    if (currentDuration > 0 && Math.abs(currentDuration - durationSecs) <= 1) return;

    try {
      const response = await lessonVideoService.saveProgress(studentId, courseId, activeLectureId, {
        watchedPercent: lectureDetails?.watchedPercent ?? 0,
        positionSecs: lectureDetails?.positionSecs ?? 0,
        completed: Boolean(lectureDetails?.completed),
        durationSecs,
      });
      setLectureDetails((prev) => prev ? { ...prev, durationSecs, completed: response.completed, watchedPercent: response.watchedPercent } : prev);
      
      setCourseData(prev => prev ? {
          ...prev,
          overallProgress: response.overallProgress
      } : prev);
      
      handleProgressSaved();
    } catch (err) {
      console.error("Eroare la salvarea duratei lectiei:", err);
    }
  }, [
    activeLectureId,
    courseId,
    handleProgressSaved,
    lectureDetails?.completed,
    lectureDetails?.durationSecs,
    lectureDetails?.positionSecs,
    lectureDetails?.watchedPercent,
    studentId,
    isPreview,
  ]);

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-edu-bg">
          <Spinner className="size-8 text-primary" />
        </div>
    );
  }

  if (loading && !courseData) {
    return (
        <div className="p-8 text-center text-muted-foreground font-medium">
          Se încarcă...
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-8 text-center text-red-500 font-semibold">
          {error}
        </div>
    );
  }

  const lessonType = inferLessonType(lectureDetails);
  const videoSrc = lectureDetails?.videoUrl || lectureDetails?.content || undefined;

  return (
      <div className="min-h-screen bg-edu-bg">
        <Header />

        <main className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">

            <div className="lg:col-span-2 flex flex-col gap-6 order-1">
              <div className="flex justify-end">
                {!isPreview && studentId && <StreakBadge studentId={studentId} />}
              </div>

              {lessonType === "video" ? (
                  videoSrc ? (
                      <VideoPlayer
                          src={videoSrc}
                          savedPosition={lectureDetails?.positionSecs || 0}
                          studentId={studentId ?? ""}
                          courseId={courseId ?? ""}
                          lectureId={activeLectureId || ""}
                          onTimeUpdate={setCurrentTime}
                          targetTime={seekRequest}
                          onMarkerClick={handleSeekAndHighlight}
                          markers={groupedMarkersList}
                          onProgressSaved={handleProgressSaved}
                          onDurationDetected={handleDurationDetected}
                          previewMode={previewMode}
                      />
                  ) : (
                      <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground">
                        Video-ul nu este disponibil.
                        {!isPreview && <div className="mt-4">
                          <Button onClick={() => void handleMarkComplete()} disabled={lectureDetails?.completed || isSaving}>
                            {lectureDetails?.completed ? "Parcurs" : "Marchează ca parcursă"}
                          </Button>
                        </div>}
                      </div>
                  )
              ) : lectureDetails ? (
                  <LessonContent lecture={lectureDetails} onMarkComplete={handleMarkComplete} isSaving={isSaving} readOnly={isPreview} />
              ) : (
                  <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground">
                    Lecția nu este disponibilă.
                  </div>
              )}

              {lectureDetails?.quiz?.quizId && (
                  <button
                      onClick={() => navigate(isPreview ? `/professor/quizzes` : `/student/quizzes/${lectureDetails.quiz!.quizId}?courseId=${courseId}`)}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                  >
                    Mergi la Quiz-ul Lecției
                  </button>
              )}
            </div>

            <div className="lg:col-span-1 order-2">
              <Sidebar
                  studentId={studentId ?? ""}
                  courseId={courseId ?? ""}
                  activeLectureId={activeLectureId}
                  onSelectLecture={handleSelectLecture}
                  overallProgress={courseData?.overallProgress ?? 0}
                  finalQuiz={courseData?.finalQuiz}
                  refreshTrigger={refreshTrigger}
                  previewMode={previewMode}
              />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6 order-3">
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                <CourseInfo courseData={courseData} />
              </div>

              {isPreview ? (
                  <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm text-sm text-muted-foreground">
                    Comentariile, recenziile si progresul sunt dezactivate in modul preview profesor.
                  </div>
              ) : (
                  <>
                    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                      <CommentsSection
                          studentId={studentId ?? ""}
                          courseId={courseId ?? ""}
                          lectureId={activeLectureId || ""}
                          currentTime={currentTime}
                          onSeek={handleSeekAndHighlight}
                          activeCommentId={activeCommentId}
                          onCommentsLoaded={setLectureComments}
                          onRefreshComments={fetchLectureDetails}
                      />
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                      <ReviewSection
                          studentId={studentId ?? ""}
                          courseId={courseId ?? ""}
                          lectureId={activeLectureId || ""}
                      />
                    </div>
                  </>
              )}
            </div>

          </div>
        </main>
      </div>
  );
}
