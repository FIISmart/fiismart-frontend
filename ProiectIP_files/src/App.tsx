import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import QuizStartPage from './QuizStartPage';
import QuizQuestionPage from './QuizQuestionPage';
import QuizResultPage from './QuizResultPage';
import { questions } from './quizData';

// Creăm o componentă "Wrapper" pentru a putea folosi hook-ul useNavigate
function QuizApp() {
  const navigate = useNavigate();
  
  // State-urile care țin minte progresul utilizatorului
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Funcție declanșată când începe quiz-ul
  const handleStartQuiz = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    navigate('/quiz');
  };

  // Funcție declanșată când se apasă pe "Next" la o întrebare
  const handleNextQuestion = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Dacă mai sunt întrebări, trecem la următoarea
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Dacă a fost ultima întrebare, mergem la rezultate
      navigate('/result');
    }
  };

  // Câte întrebări greșite are
  const incorrectAnswers = questions.length - correctAnswers;
  // Calculăm procentajul
  const score = Math.round((correctAnswers / questions.length) * 100);

  return (
    <Routes>
      <Route 
        path="/" 
        element={<QuizStartPage onStart={handleStartQuiz} />} 
      />
      <Route 
        path="/quiz" 
        element={
          <QuizQuestionPage 
            question={questions[currentIndex]} 
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            onNext={handleNextQuestion}
          />
        } 
      />
      <Route 
        path="/result" 
        element={
          <QuizResultPage 
            score={score}
            correct={correctAnswers}
            incorrect={incorrectAnswers}
            total={questions.length}
            onRetry={handleStartQuiz}
          />
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QuizApp />
    </BrowserRouter>
  );
}