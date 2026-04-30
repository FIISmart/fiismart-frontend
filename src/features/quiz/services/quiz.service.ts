import { apiFetch } from "@/lib/api";
import type { Quiz, QuizQuestion } from "../types";

/** Fetches a single quiz by id. */
export function getQuiz(quizId: string): Promise<Quiz> {
  return apiFetch<Quiz>(`/quizzes/${quizId}`);
}

/**
 * Offline / dev mock derived from the original `quizData.ts`. The shape was
 * normalized to match the unified `QuizQuestion` interface (string id, the
 * answer key as `correctIdx`, options as a flat string array).
 */
export const MOCK_QUESTIONS: QuizQuestion[] = [
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
