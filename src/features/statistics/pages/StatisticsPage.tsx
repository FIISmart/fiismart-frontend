import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import Navbar from "@/features/landing/components/Navbar";
import "../../landing/landing.css";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Trophy, 
  Star,
  Zap,
  MessageSquare,
  GraduationCap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  getStats, 
  getCourses, 
  getQuizzes 
} from "@/features/dashboard-student/services/dashboard-student.service";
import type { 
  StudentStats, 
  StudentCourse, 
  StudentQuiz 
} from "@/features/dashboard-student/types";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function StatisticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [s, c, q] = await Promise.all([
          getStats(user.id),
          getCourses(user.id),
          getQuizzes(user.id)
        ]);
        setStats(s);
        setCourses(c || []);
        setQuizzes(q || []);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        toast.error("Nu am putut încărca datele statistice.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EFE8]">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  const userInitials = user
    ? ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase()
    : "S";

  const coursesInProgress = courses.filter(c => c.overallProgress < 100);
  const finishedCourses = courses.filter(c => c.overallProgress === 100);

  // Mock data for things not yet in backend
  const teachers = [
    { name: "Prof. Andrei C.", subject: "Programare", courses: 2, rating: 5, initials: "AC", color: "bg-primary/20 text-primary" },
    { name: "Prof. Maria S.", subject: "Design", courses: 1, rating: 5, initials: "MS", color: "bg-secondary/30 text-secondary" },
    { name: "Prof. Cristina L.", subject: "Data", courses: 1, rating: 4, initials: "CL", color: "bg-yellow-100 text-yellow-700" }
  ];

  const achievements = [
    { icon: "🏆", title: "Primul certificat", subtitle: "Obținut în Mar 2026", unlocked: finishedCourses.length > 0 },
    { icon: "🔥", title: `Streak ${stats?.streakDays || 0} zile`, subtitle: "Activ", unlocked: (stats?.streakDays || 0) > 0 },
    { icon: "⚡", title: "Rapid learner", subtitle: "10h în prima săptămână", unlocked: true },
    { icon: "🎓", title: "Expert", subtitle: "Finalizează 5 cursuri", unlocked: finishedCourses.length >= 5 },
    { icon: "💬", title: "Contributor", subtitle: "Postează 10 comentarii", unlocked: false }
  ];

  const weeklyActivity = [
    { day: "L", value: 30 },
    { day: "M", value: 65 },
    { day: "M", value: 45 },
    { day: "J", value: 80 },
    { day: "V", value: 50 },
    { day: "S", value: 20 },
    { day: "D", value: 35 }
  ];

  const quizAverage = quizzes.length > 0 
    ? Math.round(quizzes.reduce((acc, q) => acc + q.scor, 0) / quizzes.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <Navbar solid={true} />
      
      {/* Profile Header */}
      <div className="mt-16 lg:mt-18 bg-[#2D2A3E] relative overflow-hidden py-12">
        {/* Decorative blobs */}
        <div className="absolute w-80 h-80 rounded-full bg-primary/15 -top-24 -right-16 blur-[40px]" />
        <div className="absolute w-56 h-56 rounded-full bg-secondary/10 -bottom-16 left-8 blur-[30px]" />
        
        <div className="fii-container relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="p-1 bg-gradient-to-br from-primary via-secondary to-yellow-200 rounded-full inline-flex">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-3xl font-bold text-white font-heading">
                {userInitials}
              </div>
            </div>
            
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-white text-3xl font-bold font-heading">
                  {user?.firstName} {user?.lastName}
                </h1>
                <span className="bg-primary/30 text-[#e0d8f5] text-[11px] font-semibold px-3 py-1 rounded-full border border-primary/40">
                  Student
                </span>
              </div>
              <p className="text-white/60 text-sm mt-1 font-body">
                {user?.email} · Iași, România · Membru din Ian. 2026
              </p>
            </div>
            
            <div className="flex gap-3 pb-1">
              <button className="bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all font-body">
                Editează profilul
              </button>
              <button className="bg-transparent text-white/80 border border-white/25 px-4 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5 font-body">
                Setări
              </button>
            </div>
          </div>
          
          <div className="flex gap-0 mt-8 border-b border-white/10">
            <div className="px-5 py-3 border-b-2 border-secondary text-white text-sm font-medium cursor-pointer font-body">Statistici</div>
            <div className="px-5 py-3 border-b-2 border-transparent text-white/45 text-sm font-medium hover:text-white/70 transition-colors cursor-pointer font-body">Cursuri</div>
            <div className="px-5 py-3 border-b-2 border-transparent text-white/45 text-sm font-medium hover:text-white/70 transition-colors cursor-pointer font-body">Certificate</div>
            <div className="px-5 py-3 border-b-2 border-transparent text-white/45 text-sm font-medium hover:text-white/70 transition-colors cursor-pointer font-body">Comunitate</div>
          </div>
        </div>
      </div>

      <main className="fii-container py-10">
        
        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <Card className="text-center py-5 border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-primary font-heading">{stats?.enrolledCourses || 0}</div>
              <p className="text-xs text-muted-foreground font-medium mt-1">Cursuri înscrise</p>
            </CardContent>
          </Card>
          <Card className="text-center py-5 border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-green-500 font-heading">{finishedCourses.length}</div>
              <p className="text-xs text-muted-foreground font-medium mt-1">Finalizate</p>
            </CardContent>
          </Card>
          <Card className="text-center py-5 border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-orange-500 font-heading">47h</div>
              <p className="text-xs text-muted-foreground font-medium mt-1">Ore învățate</p>
            </CardContent>
          </Card>
          <Card className="text-center py-5 border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-destructive font-heading">{stats?.streakDays || 0}</div>
              <p className="text-xs text-muted-foreground font-medium mt-1">Zile streak 🔥</p>
            </CardContent>
          </Card>
          <Card className="text-center py-5 border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="text-2xl font-bold font-heading">{finishedCourses.length > 0 ? finishedCourses.length : 0}</div>
              <p className="text-xs text-muted-foreground font-medium mt-1">Certificate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          
          {/* Left Column: Courses */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-[#2D2A3E] font-heading">Cursuri în desfășurare</h2>
            
            <div className="flex flex-col gap-4">
              {coursesInProgress.length > 0 ? (
                coursesInProgress.map((course, idx) => (
                  <Card key={idx} className="p-5 border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-primary/10 text-primary text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                            {course.overallProgress < 30 ? "Început" : "În lucru"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{course.enrollmentCount} studenți</span>
                        </div>
                        <h4 className="text-base font-bold text-[#2D2A3E] font-heading leading-tight">
                          {course.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-orange-500 mt-1 font-semibold">
                          <Star size={12} fill="currentColor" />
                          {course.avgRating}
                        </div>
                      </div>
                      <span className="text-xl font-bold text-primary font-heading">
                        {course.overallProgress}%
                      </span>
                    </div>
                    <Progress value={course.overallProgress} className="h-2 bg-primary/15" />
                    <p className="text-[11px] text-muted-foreground mt-3">Continuă parcursul de învățare pe FiiSmart.</p>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center border-dashed border-2 border-border/50 bg-white/30">
                  <p className="text-muted-foreground italic">Nu ai cursuri în desfășurare în acest moment.</p>
                </Card>
              )}

              {finishedCourses.map((course, idx) => (
                <Card key={`fin-${idx}`} className="p-5 border-green-500/20 shadow-sm bg-white/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-green-100 text-green-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                          ✓ Finalizat
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#2D2A3E] font-heading leading-tight">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-orange-500 mt-1 font-semibold">
                        <Star size={12} fill="currentColor" />
                        {course.avgRating}
                      </div>
                    </div>
                    <span className="text-xl font-bold text-green-500 font-heading">100%</span>
                  </div>
                  <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3 italic">🏆 Certificat obținut pentru {course.title}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column: Sidebar Stats */}
          <div className="flex flex-col gap-8">
            
            <section>
              <h2 className="text-lg font-bold text-[#2D2A3E] font-heading mb-4">Activitate săptămânală</h2>
              <Card className="p-5 border-border/50 shadow-sm">
                <div className="flex items-end gap-2.5 h-28 px-1">
                  {weeklyActivity.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div 
                        className="w-full bg-primary/20 rounded-t-sm transition-all group-hover:bg-primary" 
                        style={{ height: `${item.value}%`, backgroundColor: item.value > 60 ? '#9B8EC7' : undefined }} 
                      />
                      <span className="text-[10px] text-muted-foreground font-bold">{item.day}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-4 text-center">8.4h medie / zi activă această săptămână</p>
              </Card>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#2D2A3E] font-heading mb-4">Profesorii tăi</h2>
              <Card className="p-5 border-border/50 shadow-sm">
                <div className="flex flex-col gap-5">
                  {teachers.map((t, idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${t.color}`}>
                          {t.initials}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#2D2A3E]">{t.name}</p>
                          <p className="text-[11px] text-muted-foreground">{t.subject} · {t.courses} cursuri</p>
                        </div>
                        <div className="flex text-orange-400 text-[10px]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < t.rating ? "currentColor" : "none"} className={i >= t.rating ? "text-muted/30" : ""} />
                          ))}
                        </div>
                      </div>
                      {idx < teachers.length - 1 && <div className="h-px bg-border/40 mt-5" />}
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#2D2A3E] font-heading mb-4">Performanță quiz</h2>
              <Card className="p-4 border-border/50 shadow-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                    <div className="text-xl font-bold text-primary font-heading">{quizAverage}%</div>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Medie răspunsuri</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                    <div className="text-xl font-bold text-green-500 font-heading">{quizzes.length}</div>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Quiz-uri completate</p>
                  </div>
                </div>
              </Card>
            </section>

          </div>
        </div>

        {/* Achievements */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-[#2D2A3E] font-heading mb-6">Realizări</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {achievements.map((a, idx) => (
              <Card key={idx} className={`text-center p-5 border-border/50 shadow-sm transition-all hover:-translate-y-1 ${!a.unlocked ? 'opacity-40 grayscale' : 'border-primary/30 bg-white'}`}>
                <div className="text-3xl mb-3">{a.icon}</div>
                <p className="text-sm font-bold text-[#2D2A3E] font-heading leading-tight">{a.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{a.subtitle}</p>
              </Card>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

