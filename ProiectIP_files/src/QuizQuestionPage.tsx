import { useState, useEffect } from 'react';
import Header from './Header';
import type { QuestionData } from './quizData'; // Importăm structura din fișierul nostru de date

// Definim ce date va primi această pagină de la "Creierul" aplicației (App.tsx)
interface Props {
  question: QuestionData;
  currentIndex: number;
  totalQuestions: number;
  onNext: (isCorrect: boolean) => void;
}

export default function QuizQuestionPage({ question, currentIndex, totalQuestions, onNext }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Acest useEffect resetează pagina la starea inițială 
  // ori de câte ori primim o întrebare nouă (când dăm Next)
  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
  }, [question]);

  const handleConfirm = () => {
    if (!isSubmitted && selectedOption) {
      // Pasul 1: Confirmăm răspunsul și afișăm culorile (Verde/Roșu) și explicația
      setIsSubmitted(true);
    } else if (isSubmitted) {
      // Pasul 2: Am văzut explicația, mergem la întrebarea următoare
      // Trimitem către App.tsx informația dacă utilizatorul a nimerit răspunsul
      onNext(selectedOption === question.correctAnswerId);
    }
  };

  const isCorrect = selectedOption === question.correctAnswerId;

  return (
    <div className="min-h-screen bg-[#F2EAE0] flex flex-col font-sans">
      <Header />

      <div className="flex-grow flex flex-col justify-center items-center w-full max-w-[800px] mx-auto px-4 py-8">
        <div className="w-full">
          
          {/* Bara de sus (Navigare și status) */}
          <div className="flex justify-between items-center text-[#6A7282] text-sm font-medium mb-4 px-2">
            <button className="flex items-center gap-1 hover:text-[#9B8EC7] transition-colors">
              <span>&lt;</span> Exit
            </button>
            <span className="text-gray-800 font-bold">
              {currentIndex + 1} / {totalQuestions}
            </span>
            <span>{currentIndex} answered</span>
          </div>

          {/* Progress Bar (Se umple dinamic) */}
          <div className="w-full h-2 bg-[#E5E7EB] rounded-full mb-6 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#B4D3D9] to-[#9B8EC7] transition-all duration-500" 
              style={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
            ></div>
          </div>

          {/* Cardul Principal */}
          <div className="bg-white w-full rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] p-8 sm:p-10 relative">
            
            <div className="flex gap-3 mb-6">
              <div className="bg-[#9B8EC7] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
                {question.category}
              </div>
              
              {/* Badge-ul de evaluare: Verde pt Corect, Roșu pt Greșit */}
              {isSubmitted && (
                <div className={`text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm ${
                  isCorrect ? 'bg-[#84C5C4]' : 'bg-[#E57373]'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </div>
              )}
            </div>

            <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900 mb-8 leading-snug">
              {question.questionText}
            </h2>

            {/* Opțiunile de Răspuns */}
            <div className="flex flex-col gap-4 mb-8">
              {question.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const isThisTheCorrectAnswer = option.id === question.correctAnswerId;
                
                // Variabile de stil standard
                let containerClasses = "border-[#E5E7EB] bg-white hover:border-[#BDA6CE]";
                let circleClasses = "bg-[#F2EAE0] text-[#6A7282]";
                let textClasses = "text-[#4B5563]";
                let content = <>{option.id}</>;

                // SUPRASCRIEM STILURILE DACA S-A DAT SUBMIT
                if (isSubmitted) {
                  if (isThisTheCorrectAnswer) {
                    // Varianta corectă se face verde
                    containerClasses = "border-[#84C5C4] bg-[#F2F8F8]";
                    circleClasses = "bg-[#84C5C4] text-white";
                    textClasses = "text-[#31706E] font-semibold";
                    content = (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    );
                  } else if (isSelected && !isThisTheCorrectAnswer) {
                    // Varianta aleasă greșit se face roșie
                    containerClasses = "border-[#E57373] bg-[#FDF6F6]";
                    circleClasses = "bg-[#E57373] text-white";
                    textClasses = "text-[#C62828] font-semibold";
                    content = (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    );
                  } else {
                    // Variantele neutre nealese devin ușor mai transparente
                    containerClasses = "border-[#E5E7EB] bg-white opacity-60";
                  }
                } 
                // STILUL PENTRU CAND USERUL DOAR SELECTEAZA (INAINTE DE SUBMIT)
                else if (isSelected) {
                  containerClasses = "border-[#9B8EC7] bg-[#F9F7FA]";
                  circleClasses = "bg-[#9B8EC7] text-white";
                  textClasses = "text-[#333333]";
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => !isSubmitted && setSelectedOption(option.id)}
                    disabled={isSubmitted}
                    className={`w-full flex items-center text-left p-4 rounded-[16px] border-2 transition-all duration-200 ${containerClasses}`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 font-bold text-sm transition-colors shrink-0 ${circleClasses}`}>
                      {content}
                    </div>
                    <span className={`text-[16px] ${textClasses}`}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explicația */}
            {isSubmitted && (
              <div className="bg-[#EBE3D8] rounded-[16px] p-6 mb-8 border border-[#E0D6C8]">
                <p className="text-[#5A4A3A] text-[15px] leading-relaxed">
                  <span className="font-bold text-[#3E3228]">Explanation: </span> 
                  {question.explanation}
                </p>
              </div>
            )}

            {/* Butoanele de Footer */}
            <div className="flex justify-between items-center">
              <button 
                className="px-6 py-3 border-2 border-[#E5E7EB] text-[#A0AABF] font-semibold rounded-[16px] hover:bg-gray-50 transition-colors flex items-center gap-2"
                disabled={isSubmitted || currentIndex === 0}
              >
                <span>&lt;</span> Prev
              </button>
              
              <button 
                onClick={handleConfirm}
                disabled={!selectedOption}
                className={`px-8 py-3 rounded-[16px] font-semibold text-white transition-all flex items-center justify-center
                  ${selectedOption 
                    ? 'bg-[#9B8EC7] hover:opacity-90 shadow-md' 
                    : 'bg-[#D1D5DB] cursor-not-allowed'
                  }
                `}
              >
                {isSubmitted ? (
                  <>
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                ) : (
                  "Confirm Answer"
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}