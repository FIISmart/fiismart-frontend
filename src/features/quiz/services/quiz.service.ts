import { apiFetch } from "@/lib/api";
import type { Quiz, QuizAttempt, QuizAttemptAnswer, QuizQuestion } from "../types";

type QuizApiQuestion = {
  id?: string;
  text?: string;
  type?: string;
  points?: number;
  options?: string[];
  correctIdx?: number | null;
  correctText?: string | null;
  explanation?: string | null;
  // Free-text (AI-graded) fields. Optional — only present when type === 'free_text'.
  sampleAnswer?: string | null;
  keyConcepts?: string[] | null;
  passThreshold?: number | null;
};

type QuizApiResponse = {
  id: string;
  courseId?: string;
  moduleId?: string | null;
  lectureId?: string | null;
  quizScope?: string;
  title: string;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  questions?: QuizApiQuestion[];
};

function mapQuiz(data: QuizApiResponse): Quiz {
  return {
    id: data.id,
    courseId: data.courseId,
    moduleId: data.moduleId,
    lectureId: data.lectureId,
    quizScope: data.quizScope,
    title: data.title,
    passingScore: data.passingScore,
    timeLimit: data.timeLimit,
    shuffleQuestions: data.shuffleQuestions,
    questions: (data.questions ?? []).map((question, index) => {
      const normalizedType: "multiple_choice" | "written" | "free_text" =
        question.type === "free_text"
          ? "free_text"
          : question.type === "written"
            ? "written"
            : "multiple_choice";
      return {
        id: question.id ?? `question-${index}`,
        text: question.text ?? "",
        type: normalizedType,
        options: question.options ?? [],
        correctIdx: question.correctIdx ?? undefined,
        correctText: question.correctText,
        points: question.points,
        explanation: question.explanation ?? undefined,
        sampleAnswer: question.sampleAnswer ?? undefined,
        keyConcepts: Array.isArray(question.keyConcepts) ? question.keyConcepts : undefined,
        passThreshold:
          typeof question.passThreshold === "number" ? question.passThreshold : undefined,
      };
    }),
  };
}

/** Fetches a single quiz by id. */
export function getQuiz(quizId: string): Promise<Quiz> {
  return apiFetch<QuizApiResponse>(`/student-quizzes/${quizId}`).then(mapQuiz);
}

export function createQuizAttempt(payload: {
  quizId: string;
  courseId: string;
  studentId: string;
  score: number;
  passed: boolean;
  timeTakenSecs: number;
  answers: QuizAttemptAnswer[];
}): Promise<QuizAttempt> {
  return apiFetch<QuizAttempt>("/quiz-attempts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getLatestQuizAttempt(studentId: string, quizId: string): Promise<QuizAttempt | null> {
  return apiFetch<QuizAttempt>(`/quiz-attempts/student/${studentId}/quiz/${quizId}/latest`)
    .catch(() => null);
}

/**
 * Offline / dev mock derived from the original `quizData.ts`. The shape was
 * normalized to match the unified `QuizQuestion` interface (string id, the
 * answer key as `correctIdx`, options as a flat string array).
 *
 * REVIEW #7: gated behind `import.meta.env.DEV`. In a production build the
 * `MOCK_QUESTIONS` export resolves to an empty array, so any code path that
 * accidentally falls back to the mock will surface immediately ("quiz has no
 * questions") instead of silently serving fake data to real students.
 */
const _MOCK_QUESTIONS_DEV: QuizQuestion[] = [
  {
    id: "1",
    text: "What does HTML stand for?",
    options: [
      "Hyper Text Preprocessor",
      "Hyper Text Markup Language",
      "Hyper Text Multiple Language",
      "Hyper Tool Multi Language",
    ],
    correctIdx: 1,
    explanation:
      "HTML stands for HyperText Markup Language, the standard markup language for creating web pages.",
  },
  {
    id: "2",
    text: "Which property is used to change the background color?",
    options: ["color", "bgcolor", "background-color", "background"],
    correctIdx: 2,
    explanation:
      "The 'background-color' property is used to set the background color of an HTML element.",
  },
  {
    id: "3",
    text: "Inside which HTML element do we put the JavaScript?",
    options: ["<script>", "<javascript>", "<js>", "<scripting>"],
    correctIdx: 0,
    explanation:
      "The <script> tag is used to embed a client-side script (JavaScript).",
  },
  {
    id: "4",
    text: "What is used in React to keep track of a component's internal state?",
    options: ["ComponentData", "props", "useEffect", "useState"],
    correctIdx: 3,
    explanation:
      "The useState hook lets you add React state to function components.",
  },
  {
    id: "5",
    text: "How do you select an element with id 'demo' in CSS?",
    options: [".demo", "#demo", "demo", "*demo"],
    correctIdx: 1,
    explanation: "The hash (#) symbol is used to select an element by its ID.",
  },
  {
    id: "6",
    text: "Choose the correct HTML element for the largest heading:",
    options: ["<h1>", "<heading>", "<h6>", "<head>"],
    correctIdx: 0,
    explanation:
      "<h1> defines the most important heading. <h6> defines the least important heading.",
  },
  {
    id: "7",
    text: "How do you write 'Hello World' in an alert box?",
    options: [
      'msg("Hello World");',
      'alertBox("Hello World");',
      'alert("Hello World");',
      'console.log("Hello World");',
    ],
    correctIdx: 2,
    explanation:
      "The alert() method displays an alert box with a specified message.",
  },
  {
    id: "8",
    text: "In React, what are the arguments passed into a component called?",
    options: ["Methods", "Props", "States", "Attributes"],
    correctIdx: 1,
    explanation:
      "Props (short for properties) are how components talk to each other in React.",
  },
  {
    id: "9",
    text: "What does API stand for?",
    options: [
      "Apple Programming Interface",
      "Application Pre-Interface",
      "Automated Programming Interface",
      "Application Programming Interface",
    ],
    correctIdx: 3,
    explanation: "API stands for Application Programming Interface.",
  },
  {
    id: "10",
    text: "Which keyword is used to declare a constant variable in JavaScript?",
    options: ["let", "const", "var", "constant"],
    correctIdx: 1,
    explanation:
      "The 'const' keyword is used to declare variables whose values cannot be reassigned.",
  },
];

export const MOCK_QUESTIONS: QuizQuestion[] = import.meta.env.DEV
  ? _MOCK_QUESTIONS_DEV
  : [];
