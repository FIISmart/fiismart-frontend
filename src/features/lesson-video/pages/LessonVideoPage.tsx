import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import VideoPlayer from "../components/VideoPlayer";
import LessonContent, { inferLessonType } from "../components/LessonContent";
import CourseInfo from "../components/CourseInfo";
import Sidebar from "../components/Sidebar";
import CommentsSection from "../components/CommentsSection";
import { lessonVideoService } from "../services/lesson-video.service";
import type {
  CourseComment,
  CourseHeader,
  LectureDetails,
} from "../types";

export default function LessonVideoPage() {
  const { courseId, lectureId } = useParams<{
    courseId: string;
    lectureId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courseData, setCourseData] = useState<CourseHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(
    lectureId ?? null
  );
  const [lectureDetails, setLectureDetails] = useState<LectureDetails | null>(
    null
  );

  const [seekRequest, setSeekRequest] = useState<{
    time: number;
    id: number;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [lectureComments, setLectureComments] = useState<CourseComment[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  // State to trigger refetches when progress is saved
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const studentId = user?.id ?? null;

  // Keep activeLectureId in sync with the route param
  useEffect(() => {
    if (lectureId) setActiveLectureId(lectureId);
  }, [lectureId]);

  // Extracted fetchCourseData into a useCallback so we can trigger it again
  const fetchCourseData = useCallback(async () => {
    if (!studentId || !courseId) return;
    
    try {
      const data = await lessonVideoService.getCourseInfo(studentId, courseId);
      setCourseData(data);

      // If we don't have a lecture yet, default to the first one in the course
      if (
        !activeLectureId &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any)?.modules?.[0]?.lectures?.[0]
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActiveLectureId((data as any).modules[0].lectures[0].lectureId);
      }
    } catch {
      setError("Eroare la incarcarea cursului.");
    } finally {
      setLoading(false);
    }
  }, [studentId, courseId, activeLectureId]);

  // Keep refreshTrigger here: We WANT to update Course Data for the Sidebar overall progress
  useEffect(() => {
    void fetchCourseData();
  }, [fetchCourseData, refreshTrigger]);

  const fetchLectureDetails = useCallback(async () => {
    if (!studentId || !courseId || !activeLectureId) return;

    try {
      const data = await lessonVideoService.getLectureDetails(
        studentId,
        courseId,
        activeLectureId
      );
      setLectureDetails(data);
    } catch (err) {
      console.error("Eroare la preluarea detaliilor lecției:", err);
    }
  }, [studentId, courseId, activeLectureId]);

  // Runs ONLY when the user actually switches to a different video
  useEffect(() => {
    void fetchLectureDetails();
  }, [fetchLectureDetails]);

  // ✅ THE FIX: flatMap perfectly handles the types and filters out undefined values
  const markersList = lectureComments.flatMap((c) => {
    const timeVal = c.timestampSecs ?? c.videoTimestamp;
    
    return typeof timeVal === "number" 
      ? [{ time: timeVal, id: c.commentId }] 
      : [];
  });

  const handleSeekAndHighlight = (time: number, id: string) => {
    setSeekRequest({ time, id: Date.now() });
    setActiveCommentId(id);
  };

  // Wrapped in useCallback so it doesn't trigger interval resets in VideoPlayer
  const handleProgressSaved = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleSelectLecture = useCallback((nextLectureId: string) => {
    setActiveLectureId(nextLectureId);
    if (courseId) {
      navigate(`/student/courses/${courseId}/lectures/${nextLectureId}`);
    }
  }, [courseId, navigate]);

  const handleMarkComplete = useCallback(async (durationSecs?: number) => {
    if (!studentId || !courseId || !activeLectureId) return;
    const nextDuration = durationSecs ?? lectureDetails?.durationSecs;
    try {
      await lessonVideoService.saveProgress(studentId, courseId, activeLectureId, {
        watchedPercent: 100,
        positionSecs: nextDuration ?? 0,
        completed: true,
        durationSecs: nextDuration && nextDuration > 0 ? nextDuration : undefined,
      });
      setLectureDetails((prev) => prev ? {
        ...prev,
        completed: true,
        watchedPercent: 100,
        positionSecs: nextDuration ?? prev.positionSecs,
        durationSecs: nextDuration ?? prev.durationSecs,
      } : prev);
      handleProgressSaved();
    } catch (err) {
      console.error("Eroare la marcarea lectiei ca parcursa:", err);
    }
  }, [activeLectureId, courseId, handleProgressSaved, lectureDetails?.durationSecs, studentId]);

  const handleDurationDetected = useCallback(async (durationSecs: number) => {
    if (!studentId || !courseId || !activeLectureId || durationSecs <= 0) return;
    const currentDuration = lectureDetails?.durationSecs ?? 0;
    if (currentDuration > 0 && Math.abs(currentDuration - durationSecs) <= 1) return;

    try {
      await lessonVideoService.saveProgress(studentId, courseId, activeLectureId, {
        watchedPercent: lectureDetails?.watchedPercent ?? 0,
        positionSecs: lectureDetails?.positionSecs ?? 0,
        completed: Boolean(lectureDetails?.completed),
        durationSecs,
      });
      setLectureDetails((prev) => prev ? { ...prev, durationSecs } : prev);
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
      <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
    );
  }

  const lessonType = inferLessonType(lectureDetails);
  const videoSrc = lectureDetails?.videoUrl || lectureDetails?.content || undefined;

  return (
    <div className="min-h-screen bg-edu-bg">
      <div className="hidden lg:block">
        <Header />
      </div>

      <main className="max-w-[1200px] mx-auto lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
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
                  markers={markersList}
                  onProgressSaved={handleProgressSaved}
                  onDurationDetected={handleDurationDetected}
                />
              ) : (
                <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                  Video-ul nu este disponibil.
                  <div className="mt-4">
                    <Button onClick={() => void handleMarkComplete()} disabled={lectureDetails?.completed}>
                      {lectureDetails?.completed ? "Parcurs" : "Marcheaza ca parcursa"}
                    </Button>
                  </div>
                </div>
              )
            ) : lectureDetails ? (
              <LessonContent lecture={lectureDetails} onMarkComplete={handleMarkComplete} />
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                Lectia nu este disponibila.
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <CourseInfo courseData={courseData} />
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
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
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <Sidebar
              studentId={studentId ?? ""}
              courseId={courseId ?? ""}
              activeLectureId={activeLectureId}
              onSelectLecture={handleSelectLecture}
              overallProgress={courseData?.overallProgress ?? 0}
              finalQuiz={courseData?.finalQuiz}
              refreshTrigger={refreshTrigger} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
