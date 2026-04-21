// src/App.tsx
import { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import CourseInfo from './components/CourseInfo';
import Sidebar from './components/Sidebar';
import CommentsSection from './components/CommentsSection';
import { courseService } from './services/courseService';
import type { CourseHeader } from './types';

const TEST_STUDENT_ID = '69e790771f39d842d90c8a66';
const TEST_COURSE_ID = '69e790771f39d842d90c8ac0';

type MobileTab = 'despre' | 'discutii' | 'module';

export default function App() {
    const [courseData, setCourseData] = useState<CourseHeader | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
    const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('despre');

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const data = await courseService.getCourseInfo(TEST_STUDENT_ID, TEST_COURSE_ID);
                setCourseData(data);
            } catch (err) {
                setError('Eroare la încărcarea cursului.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Se încarcă cursul...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!courseData) return null;

    return (
        <div className="min-h-screen bg-background">
            <div className="hidden lg:block">
                <Header />
            </div>

            <main className="max-w-7xl mx-auto lg:px-8 lg:py-8">

                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">

                    <div className="lg:col-span-2 flex flex-col gap-0 lg:gap-8">

                        <div className="w-full">
                            <VideoPlayer />
                        </div>

                        <div className="block lg:hidden px-4 mt-4">
                            <div className="flex border-b border-border mb-4">
                                <button
                                    onClick={() => setActiveMobileTab('despre')}
                                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeMobileTab === 'despre' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                                >
                                    Despre curs
                                </button>
                                <button
                                    onClick={() => setActiveMobileTab('discutii')}
                                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeMobileTab === 'discutii' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                                >
                                    Discuții
                                </button>
                                <button
                                    onClick={() => setActiveMobileTab('module')}
                                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeMobileTab === 'module' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                                >
                                    Module
                                </button>
                            </div>

                            <div className="pb-24">
                                {activeMobileTab === 'despre' && <CourseInfo courseData={courseData} />}
                                {activeMobileTab === 'discutii' && <CommentsSection />}
                                {activeMobileTab === 'module' && (
                                    <Sidebar
                                        studentId={TEST_STUDENT_ID}
                                        courseId={TEST_COURSE_ID}
                                        activeLectureId={activeLectureId}
                                        onSelectLecture={setActiveLectureId}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col gap-8">
                            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                                <CourseInfo courseData={courseData} />
                            </div>
                            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                                <CommentsSection />
                            </div>
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