import { useCallback, useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

import Header from "../components/Header";
import VideoPlayer from "../components/VideoPlayer";
import CourseInfo from "../components/CourseInfo";
import Sidebar from "../components/Sidebar";
import CommentsSection from "../components/CommentsSection";
import { ReviewSection } from "../components/ReviewSection";
import { StreakBadge } from "../components/StreakBadge";

import { lessonVideoService } from "../services/lesson-video.service";

import type {
  CourseComment,
  CourseHeader,
  GroupedVideoMarker,
  LectureDetails,
} from "../types";

export default function LessonVideoPage() {
  const { courseId, lectureId } = useParams<{
    courseId: string;
    lectureId: string;
  }>();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState<CourseHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLectureId, setActiveLectureId] = useState<string | null>(
      lectureId ?? null
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

  const studentId = user?.id ?? null;

  // Sync lecture id with route
  useEffect(() => {
    if (lectureId) {
      setActiveLectureId(lectureId);
    }
  }, [lectureId]);

  // Fetch course data
  const fetchCourseData = useCallback(async () => {
    if (!studentId || !courseId) return;

    try {
      const data = await lessonVideoService.getCourseInfo(
          studentId,
          courseId
      );

      setCourseData(data);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!activeLectureId && (data as any)?.modules?.[0]?.lectures?.[0]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActiveLectureId((data as any).modules[0].lectures[0].lectureId);
      }
    } catch {
      setError("Eroare la încărcarea cursului.");
    } finally {
      setLoading(false);
    }
  }, [studentId, courseId, activeLectureId]);

  useEffect(() => {
    void fetchCourseData();
  }, [fetchCourseData, refreshTrigger]);

  // Fetch lecture details
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
      console.error("Eroare la preluarea lecției:", err);
    }
  }, [studentId, courseId, activeLectureId]);

  useEffect(() => {
    void fetchLectureDetails();
  }, [fetchLectureDetails]);

  // Group comments by timestamp
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

  const handleProgressSaved = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Loading states
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

  return (
      <div className="min-h-screen bg-edu-bg">
        <div className="hidden lg:block">
          <Header />
        </div>

        <main className="max-w-[1200px] mx-auto lg:px-8 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            {/* MAIN CONTENT */}
            <div className="lg:col-span-2 flex flex-col gap-8">

              <div className="flex justify-end">
                <StreakBadge studentId={studentId ?? ""} />
              </div>
              <VideoPlayer
                  src={lectureDetails?.videoUrl}
                  savedPosition={lectureDetails?.positionSecs || 0}
                  studentId={studentId ?? ""}
                  courseId={courseId ?? ""}
                  lectureId={activeLectureId || ""}
                  onTimeUpdate={setCurrentTime}
                  targetTime={seekRequest}
                  onMarkerClick={handleSeekAndHighlight}
                  markers={groupedMarkersList}
                  onProgressSaved={handleProgressSaved}
              />

              {currentModuleQuizId && (
                  <button
                      onClick={() =>
                          navigate(`/student/quizzes/${currentModuleQuizId}`)
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-md"
                  >
                    Mergi la Quiz
                  </button>
              )}

              {/* COURSE INFO */}
              <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <CourseInfo courseData={courseData} />
              </div>

              {/* COMMENTS */}
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

              {/* REVIEW */}
              <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <ReviewSection
                    studentId={studentId ?? ""}
                    courseId={courseId ?? ""}
                    lectureId={activeLectureId || ""}
                />
              </div>
            </div>

            {/* SIDEBAR */}
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