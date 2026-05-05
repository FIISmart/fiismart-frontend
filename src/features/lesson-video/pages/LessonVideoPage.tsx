import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  const studentId = user?.id ?? null;

  // Keep activeLectureId in sync with the route param
  useEffect(() => {
    if (lectureId) setActiveLectureId(lectureId);
  }, [lectureId]);

  // Load course header info
  useEffect(() => {
    if (!studentId || !courseId) return;
    let cancelled = false;

    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const data = await lessonVideoService.getCourseInfo(
          studentId,
          courseId
        );
        if (cancelled) return;
        setCourseData(data);

        // If we don't have a lecture yet, default to the first one in the
        // course (mirrors the source behaviour for the legacy hard-coded
        // lecture).
        if (
          !activeLectureId &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any)?.modules?.[0]?.lectures?.[0]
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setActiveLectureId((data as any).modules[0].lectures[0].lectureId);
        }
      } catch {
        if (!cancelled) setError("Eroare la incarcarea cursului.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchCourseData();
    return () => {
      cancelled = true;
    };
    // activeLectureId intentionally omitted: we only want the initial fallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, courseId]);

  const fetchLectureDetails = useCallback(async () => {
    if (!studentId || !courseId || !activeLectureId) return;
    setLectureDetails(null);

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

  useEffect(() => {
    void fetchLectureDetails();
  }, [fetchLectureDetails]);

  // Extragem markerele corect, indiferent cum vin de la backend
  const markersList = lectureComments
    .map((c) => {
      // @ts-expect-error fallback logic pt backend vechi/nou
      const timeVal = c.timestampSecs ?? c.videoTimestamp;
      return { time: timeVal, id: c.commentId };
    })
    .filter((m) => typeof m.time === "number");

  const handleSeekAndHighlight = (time: number, id: string) => {
    setSeekRequest({ time, id: Date.now() });
    setActiveCommentId(id);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-edu-bg">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (loading) {
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
            />
          </div>
        </div>
      </main>
    </div>
  );
}
