export interface Option {
  id: string;
  text: string;
}

export interface QuestionData {
  id: number;
  category: string;
  questionText: string;
  options: Option[];
  correctAnswerId: string;
  explanation: string;
}

export const questions: QuestionData[] = [
  {
    id: 1, category: "HTML", correctAnswerId: 'B',
    questionText: "What does HTML stand for?",
    explanation: "HTML stands for HyperText Markup Language, the standard markup language for creating web pages.",
    options: [
      { id: 'A', text: 'Hyper Text Preprocessor' },
      { id: 'B', text: 'Hyper Text Markup Language' },
      { id: 'C', text: 'Hyper Text Multiple Language' },
      { id: 'D', text: 'Hyper Tool Multi Language' }
    ]
  },
  {
    id: 2, category: "CSS", correctAnswerId: 'C',
    questionText: "Which property is used to change the background color?",
    explanation: "The 'background-color' property is used to set the background color of an HTML element.",
    options: [
      { id: 'A', text: 'color' },
      { id: 'B', text: 'bgcolor' },
      { id: 'C', text: 'background-color' },
      { id: 'D', text: 'background' }
    ]
  },
  {
    id: 3, category: "JavaScript", correctAnswerId: 'A',
    questionText: "Inside which HTML element do we put the JavaScript?",
    explanation: "The <script> tag is used to embed a client-side script (JavaScript).",
    options: [
      { id: 'A', text: '<script>' },
      { id: 'B', text: '<javascript>' },
      { id: 'C', text: '<js>' },
      { id: 'D', text: '<scripting>' }
    ]
  },
  {
    id: 4, category: "React", correctAnswerId: 'D',
    questionText: "What is used in React to keep track of a component's internal state?",
    explanation: "The useState hook lets you add React state to function components.",
    options: [
      { id: 'A', text: 'ComponentData' },
      { id: 'B', text: 'props' },
      { id: 'C', text: 'useEffect' },
      { id: 'D', text: 'useState' }
    ]
  },
  {
    id: 5, category: "CSS", correctAnswerId: 'B',
    questionText: "How do you select an element with id 'demo' in CSS?",
    explanation: "The hash (#) symbol is used to select an element by its ID.",
    options: [
      { id: 'A', text: '.demo' },
      { id: 'B', text: '#demo' },
      { id: 'C', text: 'demo' },
      { id: 'D', text: '*demo' }
    ]
  },
  {
    id: 6, category: "HTML", correctAnswerId: 'A',
    questionText: "Choose the correct HTML element for the largest heading:",
    explanation: "<h1> defines the most important heading. <h6> defines the least important heading.",
    options: [
      { id: 'A', text: '<h1>' },
      { id: 'B', text: '<heading>' },
      { id: 'C', text: '<h6>' },
      { id: 'D', text: '<head>' }
    ]
  },
  {
    id: 7, category: "JavaScript", correctAnswerId: 'C',
    questionText: "How do you write 'Hello World' in an alert box?",
    explanation: "The alert() method displays an alert box with a specified message.",
    options: [
      { id: 'A', text: 'msg("Hello World");' },
      { id: 'B', text: 'alertBox("Hello World");' },
      { id: 'C', text: 'alert("Hello World");' },
      { id: 'D', text: 'console.log("Hello World");' }
    ]
  },
  {
    id: 8, category: "React", correctAnswerId: 'B',
    questionText: "In React, what are the arguments passed into a component called?",
    explanation: "Props (short for properties) are how components talk to each other in React.",
    options: [
      { id: 'A', text: 'Methods' },
      { id: 'B', text: 'Props' },
      { id: 'C', text: 'States' },
      { id: 'D', text: 'Attributes' }
    ]
  },
  {
    id: 9, category: "General Web", correctAnswerId: 'D',
    questionText: "What does API stand for?",
    explanation: "API stands for Application Programming Interface.",
    options: [
      { id: 'A', text: 'Apple Programming Interface' },
      { id: 'B', text: 'Application Pre-Interface' },
      { id: 'C', text: 'Automated Programming Interface' },
      { id: 'D', text: 'Application Programming Interface' }
    ]
  },
  {
    id: 10, category: "JavaScript", correctAnswerId: 'B',
    questionText: "Which keyword is used to declare a constant variable in JavaScript?",
    explanation: "The 'const' keyword is used to declare variables whose values cannot be reassigned.",
    options: [
      { id: 'A', text: 'let' },
      { id: 'B', text: 'const' },
      { id: 'C', text: 'var' },
      { id: 'D', text: 'constant' }
    ]
  }
];