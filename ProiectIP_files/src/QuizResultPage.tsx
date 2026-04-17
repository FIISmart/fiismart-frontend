import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header'; // Importăm Header-ul proiectului

// Definim ce date primește această pagină de la App.tsx
interface Props {
  score: number;
  correct: number;
  incorrect: number;
  total: number;
  onRetry: () => void;
}

// Componenta pentru cercul de progres (rămâne neschimbată)
const CircularProgress: React.FC<{ score: number; correct: number; total: number }> = ({
  score,
  correct,
  total,
}) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      {/* Background ring */}
      <circle
        cx="55"
        cy="55"
        r={radius}
        fill="none"
        stroke="#E5DDD4"
        strokeWidth="9"
      />
      {/* Progress ring */}
      <circle
        cx="55"
        cy="55"
        r={radius}
        fill="none"
        stroke="#9B8EC7"
        strokeWidth="9"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      {/* Score fraction */}
      <text
        x="55"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[18px] font-bold fill-[#9B8EC7] font-sans"
      >
        {correct}/{total}
      </text>
      {/* Percentage */}
      <text
        x="55"
        y="67"
        textAnchor="middle"
        className="text-[11px] fill-[#9B8EC7] font-sans"
      >
        {score}%
      </text>
    </svg>
  );
};

export default function QuizResultPage({ score, correct, incorrect, total, onRetry }: Props) {
  const navigate = useNavigate();

  // Generăm data curentă dinamic (Ex: "March 26, 2026")
  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Logica pentru mesaje în funcție de scorul obținut
  const getHeaderMessage = () => {
    if (score === 100) return { title: 'Perfect Score!', sub: 'Incredible! You got every single question right!' };
    if (score >= 80) return { title: 'Excellent Work!', sub: 'You have a strong grasp of the material. Just a couple more to go for perfection!' };
    if (score >= 60) return { title: 'Good Job!', sub: 'You have a solid understanding. Keep practicing to reach the top!' };
    return { title: 'Keep Practicing!', sub: 'A bit more practice and you will master this topic!' };
  };

  const { title, sub } = getHeaderMessage();

  // Funcțiile pentru butoanele care nu au încă o pagină asociată
  const handleShowBreakdown = () => console.log('Feature in development...');
  
  // Întoarcerea la meniul principal folosind router-ul
  const handleMainMenu = () => navigate('/');

  return (
    <div className="min-h-screen bg-[#F2EAE0] flex flex-col font-sans relative">
      
      {/* Header-ul aplicației */}
      <Header />

      <div className="flex-grow flex items-center justify-center p-4 py-8">
        
        {/* Cardul Principal */}
        <div className="w-full max-w-[340px] bg-white rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col">
          
          {/* 1. Purple Header (Partea de Sus) */}
          <div className="bg-[#9B8EC7] pt-7 pb-5 px-6 flex flex-col items-center gap-2">
            <div className="text-[22px] leading-none">⭐</div>
            <h1 className="text-white text-[18px] font-bold text-center m-0">
              {title}
            </h1>
            <p className="text-white/90 text-[12px] text-center leading-relaxed max-w-[260px] m-0">
              {sub}
            </p>
          </div>

          {/* 2. Secțiunea Cercului Grafic (Date dinamice) */}
          <div className="bg-[#F2EAE0] w-full flex justify-center py-6 border-b border-white/50">
            <CircularProgress score={score} correct={correct} total={total} />
          </div>

          {/* 3. Secțiunea de Statistici și Butoane */}
          <div className="bg-white p-5 pt-6 flex flex-col items-center">
            
            {/* Stats Row */}
            <div className="flex gap-2.5 w-full mb-5">
              {/* Correct Box */}
              <div className="flex-1 bg-[#B2D8D0] rounded-[12px] py-3 px-2 flex flex-col items-center gap-1">
                <span className="text-[24px] font-bold text-[#1E5F56] leading-none">
                  {correct}
                </span>
                <span className="text-[11px] font-medium text-[#2E6B62]">
                  Correct
                </span>
              </div>

              {/* Incorrect Box */}
              <div className="flex-1 bg-[#DDD0E8] rounded-[12px] py-3 px-2 flex flex-col items-center gap-1">
                <span className="text-[24px] font-bold text-[#5A2D82] leading-none">
                  {incorrect}
                </span>
                <span className="text-[11px] font-medium text-[#6B3E8A]">
                  Incorrect
                </span>
              </div>
            </div>

            {/* Butoanele */}
            <div className="w-full flex flex-col gap-2">
              
              <button
                onClick={handleShowBreakdown}
                className="w-full h-[44px] rounded-[14px] bg-white border-[1.5px] border-[#1E5F56] text-[#1E5F56] text-[14px] font-semibold hover:bg-[#F2F8F7] transition-colors"
              >
                Show Answer Breakdown
              </button>

              <button
                onClick={onRetry}
                className="w-full h-[44px] rounded-[14px] bg-[#9B8EC7] border-none text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                Retry Quiz
              </button>

              <button
                onClick={handleMainMenu}
                className="w-full h-[44px] rounded-[14px] bg-white border-[1.5px] border-[#C5B8DC] text-[#9B8EC7] text-[14px] font-semibold hover:bg-[#F9F6FD] transition-colors"
              >
                Main Menu
              </button>
            </div>

            {/* Completion date (Afișează data curentă reală) */}
            <p className="mt-[14px] text-[11px] text-[#B0A8C2] text-center">
              Quiz completed on {today}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}