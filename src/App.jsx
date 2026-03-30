import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Users, CheckSquare, BarChart2, 
  Play, Bell, Star, GraduationCap, MoreVertical, ChevronDown 
} from 'lucide-react';

const STUDENT_ID = "69ca821fd0882443e8ed8c75"; 
const API_URL = `http://localhost:8081/api/dashboard/${STUDENT_ID}`;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQuizzesExpanded, setIsQuizzesExpanded] = useState(false); 
  const [data, setData] = useState({ 
    studentName: "", 
    initials: "",    
    stats: { enrolledCourses: 132, activeCourses: 8, quizzesCompleted: 3420, streakDays: 5 }, 
    courses: [],
    quizzes: [],
    answers: [], 
    recommendation: null, 
    continueStudy: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [resStats, resCourses, resQuizzes, resAnswers, resCont, resRec] = await Promise.all([
          axios.get(`${API_URL}/stats`),
          axios.get(`${API_URL}/courses`),
          axios.get(`${API_URL}/quizzes`),
          axios.get(`${API_URL}/answers`), 
          axios.get(`${API_URL}/continue`),
          axios.get(`${API_URL}/recommendations`)
        ]);

        const fName = resStats.data.firstName || resStats.data.name || "Student";
        const lName = resStats.data.lastName || "";
        const userInitials = (fName[0] + (lName[0] || "")).toUpperCase();

        setData({
          studentName: fName,
          initials: userInitials,
          stats: resStats.data || { enrolledCourses: 0, activeCourses: 0, quizzesCompleted: 0, streakDays: 0 },
          courses: resCourses.data || [],
          quizzes: resQuizzes.data || [],
          answers: resAnswers.data || [], 
          continueStudy: resCont.data?.cursId ? resCont.data : null,
          recommendation: resRec.data?.courseId ? resRec.data : null 
        });
      } catch (err) {
        console.warn("Backend offline");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F4EFE8] font-bold text-[#9b8ec7]">Se încarcă...</div>;

  return (
    <div className="min-h-screen pb-20 select-none bg-[#F4EFE8]">
      
      {/* NAVBAR RESPONSIVE */}
      <nav className="relative h-20 w-full bg-[#F4EFE8] flex items-center justify-center px-4 md:px-12">
        <div className="max-w-[1280px] w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#9b8ec7] rounded-[14px] flex items-center justify-center text-white shadow-sm">
              <GraduationCap size={22} />
            </div>
            <div className="flex font-bold text-xl tracking-[-0.5px]">
              <span className="text-[#9b8ec7]">FII</span>
              <span className="text-[#2d2a3e] ml-1">Smart</span>
            </div>
          </div>
          
          <div className="hidden lg:flex gap-10 text-[15px] font-semibold text-[#5a5470]">
            <a href="#">Cursuri</a> <a href="#">Funcționalități</a> <a href="#">Despre Noi</a> <a href="#">Contact</a>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <Bell size={20} className="text-gray-400 cursor-pointer hidden sm:block" />
            <div className="flex items-center gap-2.5 px-3 md:px-4 py-1.5 bg-white rounded-full border border-black/5 shadow-sm">
              <div className="w-[28px] h-[28px] bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-[#9b8ec7]">{data.initials}</div>
              <span className="text-[13.5px] font-bold text-[#333333] hidden xs:block">{data.studentName}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      {/* CONTAINER PRINCIPAL RESPONSIVE */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-12 pt-6 md:pt-10 flex flex-col gap-8 md:gap-10">
        
        <div>
          <h1 className="font-header text-[28px] md:text-[32px] font-bold text-[#1a1a2e]">Salut, {data.studentName}! 👋</h1>
          <p className="text-[14.5px] text-gray-500 font-medium opacity-80 mt-1">Continuă-ți parcursul de învățare pe FiiSmart.</p>
        </div>

        {/* STATS: 2 pe rând pe mobil, 4 pe rând pe desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <StatCard val={data.stats.enrolledCourses} label="ÎNROLATE" icon={<Users className="text-[#9b8ec7] opacity-70" />} />
          <StatCard val={data.stats.activeCourses} label="ACTIVE" icon={<BookOpen className="text-[#5EEAD4]" />} />
          <StatCard val={data.stats.quizzesCompleted?.toLocaleString()} label="QUIZ-URI" icon={<CheckSquare className="text-pink-400" />} />
          <StatCard val={data.stats.streakDays + " zile"} label="STREAK" icon={<BarChart2 className="text-green-500" />} />
        </div>

        {/* QUICK ACTIONS: 1 coloană pe mobil, 2 pe desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {data.continueStudy && (
            <div className="p-6 md:p-8 rounded-[20px] bg-gradient-to-r from-[#9b8ec7] to-[#bda6ce] flex items-center gap-6 border border-white/20 shadow-sm cursor-pointer hover:opacity-95 transition-all">
              <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white shrink-0">
                <Play fill="white" size={18} className="ml-1" />
              </div>
              <div>
                <h3 className="font-bold text-white text-[16px] md:text-[17px]">Continuă Învățarea</h3>
                <p className="text-white/80 text-[13px] md:text-[13.5px] font-medium">{data.continueStudy.titluCurs}</p>
              </div>
            </div>
          )}
          
          <div className="p-6 md:p-8 rounded-[20px] bg-gradient-to-r from-[#b4d3d9] to-[#2dd4bf] flex items-center gap-6 border border-white/20 shadow-sm cursor-pointer hover:opacity-95 transition-all">
            <div className="w-12 h-12 bg-white/50 backdrop-blur-md rounded-xl flex items-center justify-center text-[#1a1a2e] shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a2e] text-[16px] md:text-[17px]">Găsește un Tutore</h3>
              <p className="text-[#1a1a2e]/60 text-[12px] md:text-[13px] font-semibold">Ai nevoie de ajutor suplimentar?</p>
            </div>
          </div>
        </div>

        {/* CURSURI: 1 pe mobil, 2 pe tabletă, 3 pe desktop */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-[19px] text-[#1a1a2e]">Cursurile Mele</h2>
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-[13px] font-bold text-[#9b8ec7] hover:underline focus:outline-none">
              {isExpanded ? "Restrânge" : "Vezi toate"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isExpanded ? data.courses : data.courses.slice(0, 2)).map((c, i) => <CourseCard key={i} course={c} idx={i} />)}
            
            {data.recommendation && (
              <div className="bg-white/40 rounded-[22px] border-2 border-dashed border-[#bda6ce] p-8 flex flex-col items-center justify-center text-center">
                <span className="text-2xl mb-2">✨</span>
                <h4 className="font-bold text-[#1a1a2e] text-[15px] mb-2 uppercase tracking-wide">ARIA: {data.recommendation.title}</h4>
                <p className="text-[12.5px] text-gray-500 font-bold mb-6 max-w-[200px]">{data.recommendation.description}</p>
                <button className="px-7 py-2.5 border border-[#9b8ec7] rounded-lg text-[12.5px] font-bold text-[#9b8ec7] hover:bg-[#9b8ec7]/5 focus:outline-none">Descoperă cursuri</button>
              </div>
            )}
          </div>
        </section>

        {/* QUIZ-URI: Tabel cu scroll orizontal pe mobil */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-[19px] text-[#1a1a2e]">Quiz-urile Mele</h2>
            <button onClick={() => setIsQuizzesExpanded(!isQuizzesExpanded)} className="text-[13px] font-bold text-[#9b8ec7] hover:underline focus:outline-none">
              {isQuizzesExpanded ? "Restrânge" : "Vezi toate"}
            </button>
          </div>
          <div className="bg-white rounded-[20px] shadow-sm border border-black/5 overflow-hidden">
            <div className="overflow-x-auto"> {/* Wrapper pentru scroll pe mobil */}
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-50/60 border-b border-gray-100">
                  <tr className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">
                    <th className="px-8 py-4">Titlu Quiz</th>
                    <th className="px-8 py-4">Curs</th>
                    <th className="px-8 py-4 text-center">Incercari</th>
                    <th className="px-8 py-4 text-center">Scor</th>
                    <th className="px-8 py-4 text-center">Status</th>
                    <th className="px-8 py-4 text-right">Actiuni</th>
                  </tr>
                </thead>
                <tbody className="text-[13.5px] font-medium">
                  {(isQuizzesExpanded ? data.quizzes : data.quizzes.slice(0, 3)).map((q, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                      <td className="px-8 py-5 font-bold text-[#1a1a2e]">{q.titluQuiz}</td>
                      <td className="px-8 py-5 text-gray-500 font-semibold">{q.numeCurs}</td>
                      <td className="px-8 py-5 text-center font-bold">{q.incercari}</td>
                      <td className={`px-8 py-5 text-center font-bold ${q.scor < 70 ? 'text-orange-500' : 'text-[#22c55e]'}`}>{q.scor}%</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest ${q.status === 'Promovat' || q.status === 'ACTIV' ? 'bg-green-100 text-[#22c55e]' : 'bg-yellow-100 text-yellow-700'}`}>{q.status.toUpperCase()}</span>
                      </td>
                      <td className="px-8 py-5 text-right"><MoreVertical size={16} className="text-gray-300 ml-auto cursor-pointer" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ANSWERS RESPONSIVE */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-[19px] text-[#1a1a2e]">Răspunsuri</h2>
            <button className="text-[13px] font-bold text-[#9b8ec7] focus:outline-none">Vezi toate</button>
          </div>
          <div className="flex flex-col gap-4">
              {data.answers.map((ans, i) => (
                <div key={i} className="bg-white p-5 rounded-[20px] shadow-sm border border-black/5 flex flex-col sm:flex-row gap-4 sm:gap-5">
                   <div className="w-11 h-11 bg-[#b4d3d9] rounded-full flex items-center justify-center font-bold text-[#1a1a2e] text-[14px] shrink-0">
                     {ans.autorRaspuns?.charAt(0)}
                   </div>
                   <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-[15px]">{ans.autorRaspuns}</span>
                        <span className="text-[10px] md:text-[11.5px] text-gray-400 font-medium">RĂSPUNS NOU</span>
                        <span className="px-2.5 py-0.5 bg-[#9b8ec71a] text-[#9b8ec7] rounded-full text-[10px] font-black uppercase">Q&A</span>
                      </div>
                      <p className="text-[13px] md:text-[13.5px] text-gray-500 font-medium italic mb-1">Q: {ans.intrebare}</p>
                      <p className="text-[13px] md:text-[13.5px] text-[#1a1a2e] font-semibold">{ans.raspuns}</p>
                      <div className="flex gap-5 mt-3 text-[10.5px] font-black text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-red-400"><Star size={13} fill="#d1d5db" /> 0</div>
                        <span className="cursor-pointer hover:text-[#9b8ec7]">Raspunde</span>
                      </div>
                   </div>
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ val, label, icon }) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-[22px] flex flex-col md:flex-row items-center md:items-start lg:items-center gap-3 md:gap-5 shadow-sm border border-black/2 transition-all hover:translate-y-[-2px]">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-[16px] flex items-center justify-center shrink-0">{icon}</div>
      <div className="text-center md:text-left">
        <div className="text-[18px] md:text-[23px] font-extrabold text-[#1a1a2e] leading-none mb-1.5">{val}</div>
        <div className="text-[8px] md:text-[9.5px] text-gray-400 font-black tracking-[0.08em] uppercase">{label}</div>
      </div>
    </div>
  );
}

function CourseCard({ course, idx }) {
  const colors = ['bg-[#b1a7d1]', 'bg-[#8ad6cc]'];
  return (
    <div className="bg-white rounded-[22px] overflow-hidden shadow-sm border border-black/5 flex flex-col group h-full">
      <div className={`h-32 ${colors[idx % 2]} relative group-hover:h-36 transition-all duration-300`}>
        <div className="absolute top-3 right-3 bg-[#22c55e] text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">ACTIV</div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-[15.5px] text-[#1a1a2e] mb-1 truncate leading-tight tracking-tight">{course.title}</h3>
        <p className="text-[12.5px] text-gray-400 font-bold mb-6">Progres: {course.overallProgress}%</p>
        <div className="flex justify-between items-center py-3 border-b border-gray-50 mb-7 text-fii-gray font-bold text-[12px] mt-auto">
          <div className="flex items-center gap-2"><Users size={15} className="text-gray-300" />{course.enrollmentCount}</div>
          <div className="flex items-center gap-2 text-[#1a1a2e]"><Star size={15} className="text-yellow-400 fill-yellow-400" />{course.avgRating}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-[#9b8ec71a] text-[#9b8ec7] py-2.5 rounded-xl text-[10.5px] font-black hover:bg-[#9b8ec72a] transition-all uppercase tracking-tight focus:outline-none">QUIZ</button>
          <button className="bg-gray-100 text-gray-500 py-2.5 rounded-xl text-[10.5px] font-black hover:bg-gray-200 transition-all uppercase tracking-tight focus:outline-none">CURS</button>
        </div>
      </div>
    </div>
  );
}