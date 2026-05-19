import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import Header from "../components/Header";
import QuizStartPage from "../components/QuizStartPage";
import QuizQuestionPage from "../components/QuizQuestionPage";
import QuizResultPage from "../components/QuizResultPage";
import { createQuizAttempt, getLatestQuizAttempt, getQuiz } from "../services/quiz.service";
import type { Quiz, QuizAttempt, QuizAttemptAnswer } from "../types";

type Phase = "start" | "question" | "result";

export default function QuizPlayerPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAttemptAnswer[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const startedAtRef = useRef<number>(Date.now());

  const studentId = user?.id ?? "";
  const courseId = quiz?.courseId ?? searchParams.get("courseId") ?? "";

  useEffect(() => {
    if (!quizId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setLatestAttempt(null);

    getQuiz(quizId)
      .then((data) => {
        if (cancelled) return;
        setQuiz(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Quiz-ul nu poate fi incarcat.";
        setError(message);
        setQuiz(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  useEffect(() => {
    if (!studentId || !quizId) return;
    let cancelled = false;
    getLatestQuizAttempt(studentId, quizId).then((attempt) => {
      if (!cancelled) setLatestAttempt(attempt);
    });
    return () => {
      cancelled = true;
    };
  }, [quizId, studentId]);

  const total = quiz?.questions.length ?? 0;
  const passScore = quiz?.passingScore ?? 60;
  const score = useMemo(
    () => (total > 0 ? Math.round((correctAnswers / total) * 100) : 0),
    [correctAnswers, total],
  );

  const handleStart = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setAnswers([]);
    startedAtRef.current = Date.now();
    setPhase("question");
  };

  const submitAttempt = async (nextAnswers: QuizAttemptAnswer[], nextCorrect: number) => {
    if (!quiz || !studentId || !courseId) {
      setError("Nu pot salva rezultatul: lipseste cursul sau studentul.");
      setPhase("result");
      return;
    }

    const finalScore = total > 0 ? Math.round((nextCorrect / total) * 100) : 0;
    setSubmitting(true);
    try {
      const saved = await createQuizAttempt({
        quizId: quiz.id,
        courseId,
        studentId,
        score: finalScore,
        passed: finalScore >= passScore,
        timeTakenSecs: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
        answers: nextAnswers,
      });
      setLatestAttempt(saved);
    } catch (err) {
      console.error("Eroare la salvarea attempt-ului:", err);
      setError(err instanceof Error ? err.message : "Rezultatul quiz-ului nu a putut fi salvat.");
    } finally {
      setSubmitting(false);
      setPhase("result");
    }
  };

  const handleNext = (answer: { selectedIdx: number; writtenAnswer?: string; isCorrect: boolean }) => {
    if (!quiz) return;

    const question = quiz.questions[currentIndex];
    const answerRecord: QuizAttemptAnswer = {
      questionId: question.id,
      selectedIdx: answer.selectedIdx,
      writtenAnswer: answer.writtenAnswer,
      correct: answer.isCorrect,
    };
    const nextAnswers = [...answers, answerRecord];
    const nextCorrect = answer.isCorrect ? correctAnswers + 1 : correctAnswers;

    setAnswers(nextAnswers);
    setCorrectAnswers(nextCorrect);

    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      void submitAttempt(nextAnswers, nextCorrect);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setAnswers([]);
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
        <div className="flex-grow flex items-center justify-center px-4 text-center">
          <p className="text-[#5A4A3A]">
            {error ?? "Quiz-ul nu este disponibil."}
          </p>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#F2EAE0] flex flex-col font-sans">
      <Header />
      {phase === "start" && (
        <div className="flex flex-grow flex-col">
          {latestAttempt && (
            <div className="mx-auto mt-6 w-full max-w-[512px] rounded-2xl border border-[#9B8EC7]/25 bg-white px-5 py-3 text-sm text-[#5A4A3A]">
              Ultimul rezultat: <strong>{latestAttempt.score}%</strong>{" "}
              ({latestAttempt.passed ? "promovat" : "nepromovat"})
            </div>
          )}
          <QuizStartPage
            onStart={handleStart}
            quizTitle={quiz.title}
            questionCount={total}
            durationMinutes={quiz.timeLimit ?? 10}
            passScore={passScore}
          />
        </div>
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
        <div className="flex flex-grow flex-col">
          {submitting && (
            <div className="mx-auto mt-6 w-full max-w-[340px] rounded-2xl bg-white px-5 py-3 text-center text-sm text-[#5A4A3A]">
              Se salveaza rezultatul...
            </div>
          )}
          {error && (
            <div className="mx-auto mt-6 w-full max-w-[512px] rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <QuizResultPage
            correct={correctAnswers}
            total={total}
            onRetry={handleRetry}
          />
          {latestAttempt && (
            <p className="pb-8 text-center text-sm text-[#6A7282]">
              Rezultat salvat: {latestAttempt.score}%.
            </p>
          )}
          {!latestAttempt && phase === "result" && !submitting && (
            <p className="pb-8 text-center text-sm text-[#6A7282]">
              Scor local: {score}%.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
