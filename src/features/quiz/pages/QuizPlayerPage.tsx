import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import Header from "../components/Header";
import QuizStartPage from "../components/QuizStartPage";
import QuizQuestionPage from "../components/QuizQuestionPage";
import QuizResultPage from "../components/QuizResultPage";
import { FreezeOverlay } from "../components/FreezeOverlay";
import { getLatestQuizAttempt, getQuiz } from "../services/quiz.service";
import {
  abandonQuizAttempt,
  startQuizAttempt,
  submitQuizAttempt,
  type SubmitQuizAttemptAnswer,
} from "@/lib/api";
import { useQuizTimer } from "../hooks/useQuizTimer";
import { useFreeze } from "../hooks/useFreeze";
import { useAntiCheat } from "../hooks/useAntiCheat";
import type { Quiz, QuizAttempt } from "../types";

type Phase = "start" | "question" | "result";

interface LocalAnswer {
  questionId: string;
  selectedIdx: number;
  writtenAnswer?: string;
  isCorrect: boolean;
}

export default function QuizPlayerPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<LocalAnswer[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(0);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const startedAtRef = useRef<number>(Date.now());
  const answersRef = useRef<LocalAnswer[]>([]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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
        const message =
          err instanceof Error ? err.message : "Quiz-ul nu poate fi incarcat.";
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
  const localScore = useMemo(
    () => (total > 0 ? Math.round((correctAnswers / total) * 100) : 0),
    [correctAnswers, total],
  );

  const submitAttempt = useCallback(
    async (finalAnswers: LocalAnswer[]) => {
      if (submittedRef.current) return;
      if (!attemptId) {
        setError("Nu pot trimite raspunsurile: lipseste attempt-ul.");
        setPhase("result");
        return;
      }
      submittedRef.current = true;
      setSubmitting(true);

      const payloadAnswers: SubmitQuizAttemptAnswer[] = finalAnswers.map((a) => ({
        questionId: a.questionId,
        selectedIdx: a.selectedIdx,
        writtenAnswer: a.writtenAnswer,
      }));

      try {
        const result = await submitQuizAttempt(attemptId, {
          answers: payloadAnswers,
        });
        setLatestAttempt({
          id: result.id,
          quizId: quiz?.id ?? "",
          courseId,
          studentId,
          attemptedAt: new Date().toISOString(),
          score: result.score,
          passed: result.passed,
          timeTakenSecs:
            result.timeTakenSecs ??
            Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
          answers: finalAnswers.map((a) => ({
            questionId: a.questionId,
            selectedIdx: a.selectedIdx,
            writtenAnswer: a.writtenAnswer,
            correct: a.isCorrect,
          })),
        });
      } catch (err) {
        console.error("Eroare la trimiterea raspunsurilor:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "Rezultatul quiz-ului nu a putut fi salvat.";
        setError(msg);
        toast.error(msg);
        submittedRef.current = false;
      } finally {
        setSubmitting(false);
        setPhase("result");
      }
    },
    [attemptId, quiz?.id, courseId, studentId],
  );

  const onTimeout = useCallback(() => {
    if (submittedRef.current) return;
    toast.message("Timpul a expirat — trimit raspunsurile.");
    void submitAttempt(answersRef.current);
  }, [submitAttempt]);

  const remainingSeconds = useQuizTimer(
    timeLimitSeconds,
    onTimeout,
    /* enabled */ phase === "question" && timeLimitSeconds > 0,
  );

  const freeze = useFreeze(30);

  useAntiCheat({
    enabled: phase === "question",
    onViolation: ({ kind }) => {
      if (kind === "pagehide") {
        if (attemptId && !submittedRef.current) {
          void abandonQuizAttempt(attemptId).catch(() => {});
        }
        return;
      }
      freeze.freeze();
    },
  });

  const handleStart = useCallback(async () => {
    if (!quizId) return;
    setStarting(true);
    setError(null);
    try {
      const res = await startQuizAttempt(quizId);
      setAttemptId(res.attemptId);
      setTimeLimitSeconds(res.timeLimitSeconds);
      setCurrentIndex(0);
      setCorrectAnswers(0);
      setAnswers([]);
      submittedRef.current = false;
      startedAtRef.current = Date.now();
      setPhase("question");
    } catch (err) {
      console.error("Failed to start quiz attempt:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Nu pot porni quiz-ul acum. Incearca din nou.";
      toast.error(msg);
      setError(msg);
    } finally {
      setStarting(false);
    }
  }, [quizId]);

  const handleNext = useCallback(
    (answer: {
      selectedIdx: number;
      writtenAnswer?: string;
      isCorrect: boolean;
    }) => {
      if (!quiz) return;
      if (submittedRef.current) return;

      const question = quiz.questions[currentIndex];
      const record: LocalAnswer = {
        questionId: question.id,
        selectedIdx: answer.selectedIdx,
        writtenAnswer: answer.writtenAnswer,
        isCorrect: answer.isCorrect,
      };
      const nextAnswers = [...answers, record];
      const nextCorrect = answer.isCorrect
        ? correctAnswers + 1
        : correctAnswers;

      setAnswers(nextAnswers);
      setCorrectAnswers(nextCorrect);

      if (currentIndex + 1 < quiz.questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        void submitAttempt(nextAnswers);
      }
    },
    [quiz, currentIndex, answers, correctAnswers, submitAttempt],
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setAnswers([]);
    setAttemptId(null);
    setTimeLimitSeconds(0);
    submittedRef.current = false;
    setError(null);
    setPhase("start");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center px-4 text-center">
          <p className="text-foreground">
            {error ?? "Quiz-ul nu este disponibil."}
          </p>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timerLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      {phase === "start" && (
        <div className="flex flex-grow flex-col">
          {latestAttempt && (
            <div className="mx-auto mt-6 w-full max-w-[512px] rounded-2xl border border-primary/25 bg-card px-5 py-3 text-sm text-foreground">
              Ultimul rezultat: <strong>{latestAttempt.score}%</strong>{" "}
              ({latestAttempt.passed ? "promovat" : "nepromovat"})
            </div>
          )}
          {error && (
            <div className="mx-auto mt-6 w-full max-w-[512px] rounded-2xl border border-red-200 bg-card px-5 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <QuizStartPage
            onStart={() => void handleStart()}
            quizTitle={quiz.title}
            questionCount={total}
            durationMinutes={quiz.timeLimit ?? 10}
            passScore={passScore}
          />
          {starting && (
            <p className="pb-8 text-center text-sm text-muted-foreground">
              Pornesc quiz-ul...
            </p>
          )}
        </div>
      )}

      {phase === "question" && question && (
        <>
          {timeLimitSeconds > 0 && (
            <div className="mx-auto mt-4 w-full max-w-[800px] px-4">
              <div
                className="rounded-2xl border border-primary/25 bg-card px-4 py-2 text-center text-sm font-semibold text-foreground"
                aria-live="polite"
              >
                Timp ramas:{" "}
                <span className="tabular-nums">{timerLabel}</span>
              </div>
            </div>
          )}
          <QuizQuestionPage
            question={question}
            onNext={handleNext}
            onPrev={handlePrev}
            index={currentIndex}
            total={total}
          />
          <FreezeOverlay
            frozen={freeze.frozen}
            secondsLeft={freeze.secondsLeft}
            onDismiss={() => {
              /* Acknowledgement only */
            }}
          />
        </>
      )}

      {phase === "result" && (
        <div className="flex flex-grow flex-col">
          {submitting && (
            <div className="mx-auto mt-6 w-full max-w-[340px] rounded-2xl bg-card px-5 py-3 text-center text-sm text-foreground">
              Se salveaza rezultatul...
            </div>
          )}
          {error && (
            <div className="mx-auto mt-6 w-full max-w-[512px] rounded-2xl border border-red-200 bg-card px-5 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <QuizResultPage
            correct={correctAnswers}
            total={total}
            onRetry={handleRetry}
          />
          {latestAttempt && (
            <p className="pb-8 text-center text-sm text-muted-foreground">
              Rezultat salvat: {latestAttempt.score}%.
            </p>
          )}
          {!latestAttempt && phase === "result" && !submitting && (
            <p className="pb-8 text-center text-sm text-muted-foreground">
              Scor local: {localScore}%.
            </p>
          )}
        </div>
      )}
    </div>
  );
}