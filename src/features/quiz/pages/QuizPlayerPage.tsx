import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import Header from "../components/Header";
import QuizStartPage from "../components/QuizStartPage";
import QuizQuestionPage from "../components/QuizQuestionPage";
import QuizResultPage from "../components/QuizResultPage";
import { getQuiz, MOCK_QUESTIONS } from "../services/quiz.service";
import { submitQuizAttempt } from "@/lib/api";
import type { Quiz } from "../types";

type Phase = "start" | "question" | "result";

export default function QuizPlayerPage() {
  const { quizId } = useParams<{ quizId: string }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!quizId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getQuiz(quizId)
      .then((data) => {
        if (cancelled) return;
        setQuiz(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Fall back to local mock so the player remains usable in offline dev.
        const message = err instanceof Error ? err.message : "Failed to load quiz";
        setError(message);
        setQuiz({
          id: quizId,
          title: "Web Development Quiz",
          questions: MOCK_QUESTIONS,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const handleStart = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    startTimeRef.current = Date.now();
    setPhase("question");
  };

  const handleNext = (isCorrect: boolean) => {
    if (!quiz) return;
    const nextCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;
    setCorrectAnswers(nextCorrect);

    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const totalQ = quiz.questions.length;
      const scorePercent = Math.round((nextCorrect / totalQ) * 100);
      const passed = scorePercent >= (quiz.passingScore ?? 60);
      const timeTakenSecs = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (quiz.courseId) {
        void submitQuizAttempt({
          quizId: quiz.id,
          courseId: quiz.courseId,
          score: scorePercent,
          passed,
          timeTakenSecs,
        }).catch(() => {});
      }
      setPhase("result");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setPhase("start");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2EAE0] flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Spinner className="size-8 text-[#9B8EC7]" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#F2EAE0] flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-[#5A4A3A]">
            {error ?? "Quiz unavailable."}
          </p>
        </div>
      </div>
    );
  }

  const total = quiz.questions.length;
  const question = quiz.questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#F2EAE0] flex flex-col font-sans">
      <Header />
      {phase === "start" && (
        <QuizStartPage
          onStart={handleStart}
          quizTitle={quiz.title}
          questionCount={quiz.questions.length}
          durationMinutes={quiz.timeLimit ? Math.ceil(quiz.timeLimit / 60) : undefined}
          passScore={quiz.passingScore}
        />
      )}
      {phase === "question" && question && (
        <QuizQuestionPage
          question={question}
          onNext={handleNext}
          onPrev={handlePrev}
          index={currentIndex}
          total={total}
        />
      )}
      {phase === "result" && (
        <QuizResultPage
          correct={correctAnswers}
          total={total}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
