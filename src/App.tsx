import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import CourseInfo from './components/CourseInfo';
import Sidebar from './components/Sidebar';
import CommentsSection from './components/CommentsSection';
import { courseService } from './services/courseService';
import type { CourseHeader, CourseComment } from './types';

const TEST_STUDENT_ID = '69efa508aad58b2dc2d0c75c';
const TEST_COURSE_ID = '69efa508aad58b2dc2d0c84d';

interface LectureDetails {
    lectureId: string;
    title: string;
    videoUrl: string;
    durationSecs: number;
    order: number;
    positionSecs?: number;
    watchedPercent?: number;
    completed?: boolean;
}

export default function App() {
    const [courseData, setCourseData] = useState<CourseHeader | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
    const [lectureDetails, setLectureDetails] = useState<LectureDetails | null>(null);

    const [seekRequest, setSeekRequest] = useState<{ time: number; id: number } | null>(null);
    const [currentTime, setCurrentTime] = useState(0);

    const [lectureComments, setLectureComments] = useState<CourseComment[]>([]);
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const data = await courseService.getCourseInfo(TEST_STUDENT_ID, TEST_COURSE_ID);
                setCourseData(data);

                if (data.modules?.[0]?.lectures?.[0]) {
                    setActiveLectureId(data.modules[0].lectures[0].lectureId);
                }
            } catch {
                setError('Eroare la incarcarea cursului.');
            } finally {
                setLoading(false);
            }
        };
        void fetchCourseData();
    }, []);

    const fetchLectureDetails = useCallback(async () => {
        if (!activeLectureId) return;
        setLectureDetails(null);

        try {
            const response = await fetch(
                `http://localhost:8081/api/students/${TEST_STUDENT_ID}/courses/${TEST_COURSE_ID}/lectures/${activeLectureId}`
            );
            if (response.ok) {
                const data = await response.json();
                setLectureDetails(data);
            }
        } catch (err) {
            console.error('Eroare la preluarea detaliilor lecției:', err);
        }
    }, [activeLectureId]);

    useEffect(() => {
        void fetchLectureDetails();
    }, [fetchLectureDetails]);

    // 🔥 Extragem markerele corect, indiferent cum vin de la backend
    const markersList = lectureComments
        .map(c => {
            // @ts-expect-error fallback logic pt backend vechi/nou
            const timeVal = c.timestampSecs ?? c.videoTimestamp;
            return { time: timeVal, id: c.commentId };
        })
        .filter(m => typeof m.time === 'number');

    const handleSeekAndHighlight = (time: number, id: string) => {
        setSeekRequest({ time, id: Date.now() });
        setActiveCommentId(id);
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground font-medium">Se încarcă...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-semibold">{error}</div>;

    return (
        <div className="min-h-screen bg-[#F2EAE0]">
            <div className="hidden lg:block">
                <Header />
            </div>

            <main className="max-w-[1200px] mx-auto lg:px-8 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <VideoPlayer
                            src={lectureDetails?.videoUrl}
                            savedPosition={lectureDetails?.positionSecs || 0}
                            studentId={TEST_STUDENT_ID}
                            courseId={TEST_COURSE_ID}
                            lectureId={activeLectureId || ""}
                            onTimeUpdate={setCurrentTime}
                            targetTime={seekRequest}
                            onMarkerClick={handleSeekAndHighlight}
                            markers={markersList}
                        />

                        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                            <CourseInfo courseData={courseData!} />
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                            <CommentsSection
                                studentId={TEST_STUDENT_ID}
                                courseId={TEST_COURSE_ID}
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
                            studentId={TEST_STUDENT_ID}
                            courseId={TEST_COURSE_ID}
                            activeLectureId={activeLectureId}
                            onSelectLecture={setActiveLectureId}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}