import { useEffect, useRef, useState } from "react";
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

// Submitted answer in flight, before the BE grades it. `correct` is added
// server-side, so we omit it on the client.
type PendingAnswer = Omit<QuizAttemptAnswer, "correct">;

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
  const [answers, setAnswers] = useState<PendingAnswer[]>([]);
  const startedAtRef = useRef<number>(Date.now());

  // studentId is no longer needed on this page — the BE derives it from the
  // authenticated principal on both /quiz-attempts/student/me/... reads and
  // POST /quiz-attempts. The `user` is still read by useAuth so the page only
  // renders when authenticated.
  void user;
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
    if (!quizId) return;
    let cancelled = false;
    getLatestQuizAttempt(quizId).then((attempt) => {
      if (!cancelled) setLatestAttempt(attempt);
    });
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const total = quiz?.questions.length ?? 0;
  const passScore = quiz?.passingScore ?? 60;

  const handleStart = () => {
    setCurrentIndex(0);
    setAnswers([]);
    startedAtRef.current = Date.now();
    setPhase("question");
  };

  const submitAttempt = async (nextAnswers: PendingAnswer[]) => {
    // Double-submit guard: if a submission is already in flight, ignore further
    // calls. The last question's Next button is also disabled while submitting,
    // but a stale call path (or a double-click that races) is caught here too.
    if (submitting) return;
    if (!quiz || !courseId) {
      setError("Nu pot salva rezultatul: lipseste cursul.");
      setPhase("result");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // The BE grades the attempt server-side and returns score / passed.
      // We deliberately do NOT send score / passed / per-answer correct
      // flags — they'd be ignored, but stripping them client-side is the
      // defense-in-depth move.
      const saved = await createQuizAttempt({
        quizId: quiz.id,
        courseId,
        timeTakenSecs: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
        answers: nextAnswers,
      });
      setLatestAttempt(saved);
      setPhase("result");
    } catch (err) {
      console.error("Eroare la salvarea attempt-ului:", err);
      setError(err instanceof Error ? err.message : "Rezultatul quiz-ului nu a putut fi salvat.");
      setPhase("result");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = (answer: { selectedIdx: number; writtenAnswer?: string }) => {
    if (!quiz) return;

    const question = quiz.questions[currentIndex];
    const answerRecord: PendingAnswer = {
      questionId: question.id,
      selectedIdx: answer.selectedIdx,
      writtenAnswer: answer.writtenAnswer,
    };
    const nextAnswers = [...answers, answerRecord];
    setAnswers(nextAnswers);

    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      void submitAttempt(nextAnswers);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setAnswers((prev) => prev.slice(0, -1));
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setError(null);
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
          isSubmitting={submitting}
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
          {/* The result page renders BE-computed correct count and score.
              Falls back to 0 if the attempt didn't persist (error path). */}
          <QuizResultPage
            correct={latestAttempt
              ? latestAttempt.answers.filter((a) => a.correct).length
              : 0}
            total={total}
            onRetry={handleRetry}
          />
          {latestAttempt && (
            <p className="pb-8 text-center text-sm text-[#6A7282]">
              Rezultat salvat: {latestAttempt.score}%
              {latestAttempt.passed ? " (promovat)" : " (nepromovat)"}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
