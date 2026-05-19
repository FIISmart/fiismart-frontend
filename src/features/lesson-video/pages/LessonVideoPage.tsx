import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import Header from "../components/Header";
import VideoPlayer from "../components/VideoPlayer";
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

  return (
    <div className="min-h-screen bg-edu-bg">
      <div className="hidden lg:block">
        <Header />
      </div>

      <main className="max-w-[1200px] mx-auto lg:px-8 lg:py-8">
        {courseId && (
          <Link
            to={`/student/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 px-4 lg:px-0 pt-4 lg:pt-0"
          >
            <ArrowLeft className="size-4" />
            Înapoi la curs
          </Link>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <VideoPlayer
              src={lectureDetails?.videoUrl}
              savedPosition={lectureDetails?.positionSecs || 0}
              studentId={studentId ?? ""}
              courseId={courseId ?? ""}
              lectureId={activeLectureId || ""}
              onTimeUpdate={setCurrentTime}
              targetTime={seekRequest}
              onMarkerClick={handleSeekAndHighlight}
              markers={markersList}
              onProgressSaved={handleProgressSaved} 
            />

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
              onSelectLecture={setActiveLectureId}
              overallProgress={courseData?.overallProgress ?? 0}
              refreshTrigger={refreshTrigger} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}