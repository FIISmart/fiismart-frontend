/**
 * Dev-only in-memory + localStorage mock layer for the FIISmart app.
 *
 * Activated from `apiFetch` / `postMultipart` (in `./api.ts`) only when:
 *   - `import.meta.env.DEV === true`, AND
 *   - the real backend returned a non-OK response (e.g. 404, offline)
 *
 * In production builds this module is dynamically imported behind an
 * `import.meta.env.DEV` guard, so Vite tree-shakes it out of the bundle.
 *
 * Covers two surface areas:
 *   1. Teacher-side course builder endpoints (`/courses/...`).
 *   2. Student-facing endpoints used by the dashboard, the lesson-video page
 *      and the quiz player (`/dashboard/...`, `/students/...`, `/quizzes/...`).
 */
import type {
  CourseAPI,
  ModuleResponse,
  LectureAPI,
  QuizAPI,
  CommentAPI,
  QuizPayload,
  UploadResponse,
} from "./api";
import type {
  Answer,
  ContinueStudy,
  Recommendation,
  StudentCourse,
  StudentQuiz,
  StudentStats,
} from "@/features/dashboard-student/types";
import type {
  CourseComment,
  CourseHeader,
  LectureDetails,
  LectureProgressPayload,
  ModuleSummary,
  QuizStatus,
} from "@/features/lesson-video/types";
import type { Quiz, QuizQuestion } from "@/features/quiz/types";
import { MOCK_QUESTIONS } from "@/features/quiz/services/quiz.service";

// Mock-only: reintroduces the inline quiz the public ModuleResponse no longer carries.
type MockModuleResponse = Omit<ModuleResponse, "quizId"> & {
  quizId?: string | null;
  quiz?: QuizAPI | null;
};

// Mock-only: parallel CourseAPI whose modules carry the inline mock quiz.
type MockCourseAPI = Omit<CourseAPI, "modules"> & {
  modules?: MockModuleResponse[];
};

// ── Storage / DB ────────────────────────────────────────

const STORAGE_KEY = "fiismart_dev_mock_db";
// Bumped from 1 → 2 to invalidate teacher-only DBs that don't yet have
// student enrollments / lecture progress / lecture comments.
const SCHEMA_VERSION = 2;
const DEV_PROFESSOR_ID = "dev-professor-aaaaaaaaaaaaaaaaaaaaaa";
const DEV_STUDENT_ID = "dev-student-bbbbbbbbbbbbbbbbbbbbbbb";

/** Per-lecture playback state we persist for the demo "resume" flow. */
interface LectureProgress {
  positionSecs: number;
  watchedPercent: number;
  completed: boolean;
}

/** Lightweight comment shape used by `/students/.../lectures/.../comments`. */
interface MockLectureComment {
  commentId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  body: string;
  timestampSecs?: number;
  likeCount: number;
  /** ISO timestamp; we render via {@link timeAgo}. */
  createdAt: string;
  /** Set of student ids that liked this comment. */
  likedBy: string[];
  isPinned?: boolean;
}

export interface MockCourseDB {
  schemaVersion: number;
  courses: MockCourseAPI[];
  courseQuizzes: Record<string, QuizAPI>;
  /** Teacher-side comments, keyed by courseId. */
  comments: Record<string, CommentAPI[]>;
  /** studentId → enrolled courseIds. */
  enrollments: Record<string, string[]>;
  /** studentId → courseId → lectureId → progress. */
  progress: Record<string, Record<string, Record<string, LectureProgress>>>;
  /** courseId → lectureId → comments. */
  lectureComments: Record<string, Record<string, MockLectureComment[]>>;
}

function uuid(): string {
  // crypto.randomUUID is available in modern browsers + Vite dev.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `mock-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function isoMinutesAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60_000));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} z`;
}

function makeSeedDB(): MockCourseDB {
  const courseAId = uuid();
  const courseBId = uuid();

  // Pick stable lecture ids so we can use one as the "real" YouTube lecture.
  const lectureA1aId = uuid();
  const lectureA1bId = uuid();
  const lectureA2aId = uuid();
  const lectureA3aId = uuid();
  const lectureB1aId = uuid();
  const lectureB1bId = uuid();
  const lectureB2aId = uuid();

  const moduleA1: MockModuleResponse = {
    id: uuid(),
    title: "Getting Started with TypeScript",
    description: "Setup, tooling, and the type system fundamentals.",
    order: 0,
    lectures: [
      {
        id: lectureA1aId,
        title: "Why TypeScript?",
        // Real YouTube embed so the player has something to render in dev.
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        order: 0,
        durationSecs: 420,
      },
      {
        id: lectureA1bId,
        title: "Installing the toolchain",
        videoUrl: null,
        order: 1,
        durationSecs: 360,
      },
    ],
    quiz: null,
  };

  const moduleA2: MockModuleResponse = {
    id: uuid(),
    title: "Generics & Conditional Types",
    description: "Reusable, type-safe abstractions.",
    order: 1,
    lectures: [
      {
        id: lectureA2aId,
        title: "Intro to generics",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        order: 0,
        durationSecs: 540,
      },
    ],
    quiz: null,
  };

  // Quiz attached to the third module of course A.
  const moduleA3QuizId = uuid();
  const moduleA3: MockModuleResponse = {
    id: uuid(),
    title: "Practical Patterns",
    description: "Patterns you will use every day.",
    order: 2,
    lectures: [
      {
        id: lectureA3aId,
        title: "Discriminated unions",
        videoUrl: null,
        order: 0,
        durationSecs: 600,
      },
    ],
    quiz: {
      id: moduleA3QuizId,
      courseId: courseAId,
      moduleId: "", // patched below
      title: "Patterns checkpoint",
      passingScore: 70,
      timeLimit: 600,
      shuffleQuestions: false,
      questions: [
        {
          id: uuid(),
          text: "Which keyword narrows a discriminated union?",
          type: "multiple_choice",
          options: ["typeof", "in", "switch on the tag", "instanceof"],
          correctIdx: 2,
          explanation: "Switching on the discriminant tag is the canonical narrowing pattern.",
        },
      ],
    },
  };
  if (moduleA3.quiz) moduleA3.quiz.moduleId = moduleA3.id;

  const courseA: MockCourseAPI = {
    id: courseAId,
    title: "TypeScript Mastery",
    description: "From zero to production-grade TypeScript.",
    teacherId: DEV_PROFESSOR_ID,
    status: "published",
    tags: ["typescript", "frontend"],
    thumbnailUrl: "https://placehold.co/640x360",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    modules: [moduleA1, moduleA2, moduleA3],
  };

  const moduleB1: MockModuleResponse = {
    id: uuid(),
    title: "React Fundamentals",
    description: "Components, props, and state.",
    order: 0,
    lectures: [
      {
        id: lectureB1aId,
        title: "JSX in 10 minutes",
        videoUrl: null,
        order: 0,
        durationSecs: 600,
      },
      {
        id: lectureB1bId,
        title: "Hooks 101",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        order: 1,
        durationSecs: 720,
      },
    ],
    quiz: null,
  };

  const moduleB2: MockModuleResponse = {
    id: uuid(),
    title: "State Management",
    description: "Local, lifted, and global state.",
    order: 1,
    lectures: [
      {
        id: lectureB2aId,
        title: "useReducer in practice",
        videoUrl: null,
        order: 0,
        durationSecs: 480,
      },
    ],
    quiz: null,
  };

  const courseB: MockCourseAPI = {
    id: courseBId,
    title: "Building Modern React Apps",
    description: "A draft course on React + Vite + TypeScript.",
    teacherId: DEV_PROFESSOR_ID,
    status: "draft",
    tags: ["react", "vite"],
    thumbnailUrl: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    modules: [moduleB1, moduleB2],
  };

  // Seed lecture comments so the lesson-video page has something to render.
  const seededLectureComments: Record<string, Record<string, MockLectureComment[]>> = {
    [courseAId]: {
      [lectureA1aId]: [
        {
          commentId: uuid(),
          authorId: DEV_PROFESSOR_ID,
          authorName: "Prof. Ana Popescu",
          authorRole: "TEACHER",
          body: "Bun venit la primul curs! Lasă întrebări mai jos pe parcursul lecturii.",
          timestampSecs: 12,
          likeCount: 4,
          createdAt: isoMinutesAgo(60 * 24),
          likedBy: [],
          isPinned: true,
        },
        {
          commentId: uuid(),
          authorId: "dev-student-cccccccccccccccccccccccc",
          authorName: "Mihai Ionescu",
          authorRole: "STUDENT",
          body: "La 0:45 nu am înțeles distincția dintre `any` și `unknown`. Cineva poate explica?",
          timestampSecs: 45,
          likeCount: 2,
          createdAt: isoMinutesAgo(180),
          likedBy: [DEV_STUDENT_ID],
        },
        {
          commentId: uuid(),
          authorId: "dev-student-dddddddddddddddddddddddd",
          authorName: "Elena Marin",
          authorRole: "STUDENT",
          body: "Mulțumesc! Foarte clar explicat, am înțeles imediat.",
          timestampSecs: 120,
          likeCount: 1,
          createdAt: isoMinutesAgo(45),
          likedBy: [],
        },
      ],
      [lectureA2aId]: [
        {
          commentId: uuid(),
          authorId: "dev-student-cccccccccccccccccccccccc",
          authorName: "Mihai Ionescu",
          authorRole: "STUDENT",
          body: "Genericii sunt magici, mai ales constraint-urile cu `extends`.",
          timestampSecs: 30,
          likeCount: 3,
          createdAt: isoMinutesAgo(90),
          likedBy: [],
        },
      ],
    },
    [courseBId]: {
      [lectureB1bId]: [
        {
          commentId: uuid(),
          authorId: DEV_PROFESSOR_ID,
          authorName: "Prof. Ana Popescu",
          authorRole: "TEACHER",
          body: "Atenție la dependency array — exemplul de la 2:10 e foarte des întâlnit la interviuri.",
          timestampSecs: 130,
          likeCount: 5,
          createdAt: isoMinutesAgo(60 * 6),
          likedBy: [],
          isPinned: true,
        },
        {
          commentId: uuid(),
          authorId: "dev-student-eeeeeeeeeeeeeeeeeeeeeeee",
          authorName: "Andrei Pop",
          authorRole: "STUDENT",
          body: "Există un repo oficial cu exemplele din lecție?",
          likeCount: 0,
          createdAt: isoMinutesAgo(20),
          likedBy: [],
        },
      ],
    },
  };

  // Seed some "in-progress" playback so the sidebar shows watched-percent bars
  // and the player resumes from a reasonable spot.
  const seededProgress: Record<string, Record<string, Record<string, LectureProgress>>> = {
    [DEV_STUDENT_ID]: {
      [courseAId]: {
        [lectureA1aId]: { positionSecs: 78, watchedPercent: 35, completed: false },
        [lectureA1bId]: { positionSecs: 360, watchedPercent: 100, completed: true },
      },
      [courseBId]: {
        [lectureB1aId]: { positionSecs: 120, watchedPercent: 20, completed: false },
      },
    },
  };

  return {
    schemaVersion: SCHEMA_VERSION,
    courses: [courseA, courseB],
    courseQuizzes: {
      [courseAId]: {
        id: uuid(),
        courseId: courseAId,
        title: "TypeScript final quiz",
        passingScore: 70,
        timeLimit: 30,
        shuffleQuestions: false,
        questions: [
          {
            id: uuid(),
            text: "What does TypeScript add to JavaScript?",
            type: "multiple_choice",
            options: ["Static typing", "A database", "A browser", "A package manager"],
            correctIdx: 0,
            explanation: "TypeScript adds static type checking on top of JavaScript.",
          },
        ],
      },
    },
    comments: {
      [courseAId]: [],
      [courseBId]: [],
    },
    enrollments: {
      [DEV_STUDENT_ID]: [courseAId, courseBId],
    },
    progress: seededProgress,
    lectureComments: seededLectureComments,
  };
}

function loadDB(): MockCourseDB {
  if (typeof window === "undefined") return makeSeedDB();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = makeSeedDB();
      persistDB(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as MockCourseDB;
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) {
      const seeded = makeSeedDB();
      persistDB(seeded);
      return seeded;
    }
    parsed.courseQuizzes = parsed.courseQuizzes ?? {};
    return parsed;
  } catch {
    const seeded = makeSeedDB();
    persistDB(seeded);
    return seeded;
  }
}

function persistDB(next: MockCourseDB): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota or serialization error — ignored in dev.
  }
}

let db: MockCourseDB = loadDB();

function commit(): void {
  persistDB(db);
}

/** Wipe the mock DB and re-seed from defaults. Useful for a debug button. */
export function resetDevMockDB(): void {
  db = makeSeedDB();
  persistDB(db);
}

// ── Helpers ─────────────────────────────────────────────

function findCourse(id: string): MockCourseAPI | undefined {
  return db.courses.find((c) => c.id === id);
}

function findModule(course: MockCourseAPI, moduleId: string): MockModuleResponse | undefined {
  return (course.modules ?? []).find((m) => m.id === moduleId);
}

function findLecture(
  course: MockCourseAPI,
  lectureId: string,
): { module: MockModuleResponse; lecture: LectureAPI } | undefined {
  for (const mod of course.modules ?? []) {
    const lecture = mod.lectures.find((l) => l.id === lectureId);
    if (lecture) return { module: mod, lecture };
  }
  return undefined;
}

function getProgress(
  studentId: string,
  courseId: string,
  lectureId: string,
): LectureProgress | undefined {
  return db.progress[studentId]?.[courseId]?.[lectureId];
}

function setProgress(
  studentId: string,
  courseId: string,
  lectureId: string,
  next: LectureProgress,
): void {
  if (!db.progress[studentId]) db.progress[studentId] = {};
  if (!db.progress[studentId][courseId]) db.progress[studentId][courseId] = {};
  db.progress[studentId][courseId][lectureId] = next;
}

/** Find a comment by id across every lecture; returns the parent course/lecture too. */
function findLectureComment(
  commentId: string,
): { courseId: string; lectureId: string; comment: MockLectureComment } | undefined {
  for (const courseId of Object.keys(db.lectureComments)) {
    const byLecture = db.lectureComments[courseId];
    for (const lectureId of Object.keys(byLecture)) {
      const comment = byLecture[lectureId].find((c) => c.commentId === commentId);
      if (comment) return { courseId, lectureId, comment };
    }
  }
  return undefined;
}

function toCourseComment(
  c: MockLectureComment,
  studentId: string,
): CourseComment {
  return {
    commentId: c.commentId,
    authorName: c.authorName,
    authorRole: c.authorRole,
    body: c.body,
    timestampSecs: c.timestampSecs,
    likeCount: c.likeCount,
    timeAgo: timeAgo(c.createdAt),
    likedByMe: c.likedBy.includes(studentId),
    isPinned: c.isPinned,
  };
}

function lectureToSummary(
  lecture: LectureAPI,
  studentId: string,
  courseId: string,
): ModuleSummary["lectures"][number] {
  const progress = getProgress(studentId, courseId, lecture.id);
  return {
    lectureId: lecture.id,
    title: lecture.title,
    order: lecture.order,
    durationSecs: lecture.durationSecs,
    completed: progress?.completed ?? false,
    watchedPercent: progress?.watchedPercent ?? 0,
    lastPositionSecs: progress?.positionSecs ?? 0,
  };
}

function quizToStatus(quiz: QuizAPI): QuizStatus {
  return {
    quizId: quiz.id,
    attemptCount: 0,
    lastScore: 0,
    passed: false,
    statusLabel: "Disponibil",
  };
}

/**
 * Build a stable mock {@link Quiz} for the player. Returns the seeded quiz from
 * a course if `quizId` matches one, otherwise falls back to {@link MOCK_QUESTIONS}
 * so any unknown id still produces a usable 5-question quiz.
 */
function buildMockQuiz(quizId: string): Quiz {
  for (const course of db.courses) {
    for (const mod of course.modules ?? []) {
      if (mod.quiz?.id === quizId) {
        const questions: QuizQuestion[] = mod.quiz.questions
          .filter((q) => typeof q.correctIdx === "number")
          .map((q) => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctIdx: q.correctIdx as number,
            explanation: q.explanation ?? undefined,
          }));
        if (questions.length === 0) {
          return {
            id: mod.quiz.id,
            title: mod.quiz.title,
            questions: MOCK_QUESTIONS.slice(0, 5),
          };
        }
        return { id: mod.quiz.id, title: mod.quiz.title, questions };
      }
    }
  }
  return {
    id: quizId,
    title: "Web Development Quiz",
    questions: MOCK_QUESTIONS.slice(0, 5),
  };
}

function parseBody<T>(init?: RequestInit): T | undefined {
  if (!init || init.body === undefined || init.body === null) return undefined;
  if (typeof init.body !== "string") return undefined;
  try {
    return JSON.parse(init.body) as T;
  } catch {
    return undefined;
  }
}

function method(init?: RequestInit): string {
  return (init?.method ?? "GET").toUpperCase();
}

// ── Route matchers ──────────────────────────────────────

interface ParsedPath {
  pathname: string;
  query: URLSearchParams;
}

function parsePath(path: string): ParsedPath {
  // path is the part after API_BASE, e.g. "/courses?teacherId=X" or "/courses/abc".
  const [pathname, search = ""] = path.split("?");
  return { pathname, query: new URLSearchParams(search) };
}

type Handler = (
  match: RegExpMatchArray,
  parsed: ParsedPath,
  init?: RequestInit,
) => unknown;

interface Route {
  method: string;
  pattern: RegExp;
  handle: Handler;
}

const routes: Route[] = [
  // GET /courses?teacherId=X
  {
    method: "GET",
    pattern: /^\/courses$/,
    handle: (_m, parsed) => {
      const teacherId = parsed.query.get("teacherId");
      if (teacherId) return db.courses.filter((c) => c.teacherId === teacherId);
      return db.courses;
    },
  },
  // POST /courses
  {
    method: "POST",
    pattern: /^\/courses$/,
    handle: (_m, _p, init) => {
      const body = parseBody<{
        title?: string;
        description?: string;
        teacherId?: string;
        tags?: string[];
      }>(init) ?? {};
      const created: CourseAPI = {
        id: uuid(),
        title: body.title ?? "Untitled course",
        description: body.description ?? "",
        teacherId: body.teacherId ?? DEV_PROFESSOR_ID,
        status: "draft",
        tags: body.tags ?? [],
        thumbnailUrl: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        modules: [],
      };
      db.courses.push(created);
      db.comments[created.id] = [];
      commit();
      return created;
    },
  },
  // GET /courses/:id
  {
    method: "GET",
    pattern: /^\/courses\/([^/]+)$/,
    handle: (m) => findCourse(m[1]),
  },
  // PUT /courses/:id
  {
    method: "PUT",
    pattern: /^\/courses\/([^/]+)$/,
    handle: (m, _p, init) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const body = parseBody<Partial<CourseAPI>>(init) ?? {};
      Object.assign(course, body, { id: course.id, updatedAt: nowIso() });
      commit();
      return course;
    },
  },
  // DELETE /courses/:id
  {
    method: "DELETE",
    pattern: /^\/courses\/([^/]+)$/,
    handle: (m) => {
      const idx = db.courses.findIndex((c) => c.id === m[1]);
      if (idx === -1) return undefined;
      db.courses.splice(idx, 1);
      delete db.comments[m[1]];
      commit();
      return undefined;
    },
  },
  // PATCH /courses/:id/draft
  {
    method: "PATCH",
    pattern: /^\/courses\/([^/]+)\/draft$/,
    handle: (m) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      course.status = "draft";
      course.updatedAt = nowIso();
      commit();
      return course;
    },
  },
  // PATCH /courses/:id/publish
  {
    method: "PATCH",
    pattern: /^\/courses\/([^/]+)\/publish$/,
    handle: (m) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      course.status = "published";
      course.updatedAt = nowIso();
      commit();
      return course;
    },
  },
  // GET /courses/:id/comments
  {
    method: "GET",
    pattern: /^\/courses\/([^/]+)\/comments$/,
    handle: (m) => db.comments[m[1]] ?? [],
  },
  // GET /courses/:id/quiz
  {
    method: "GET",
    pattern: /^\/courses\/([^/]+)\/quiz$/,
    handle: (m) => db.courseQuizzes[m[1]],
  },
  // POST /courses/:id/quiz
  {
    method: "POST",
    pattern: /^\/courses\/([^/]+)\/quiz$/,
    handle: (m, _p, init) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const body = parseBody<QuizPayload>(init);
      if (!body) return undefined;
      const quiz: QuizAPI = {
        id: uuid(),
        courseId: course.id,
        title: body.title,
        passingScore: body.passingScore ?? 70,
        timeLimit: body.timeLimit ?? 30,
        shuffleQuestions: body.shuffleQuestions ?? false,
        questions: [],
      };
      db.courseQuizzes[course.id] = quiz;
      course.updatedAt = nowIso();
      commit();
      return quiz;
    },
  },
  // DELETE /courses/:id/quiz
  {
    method: "DELETE",
    pattern: /^\/courses\/([^/]+)\/quiz$/,
    handle: (m) => {
      delete db.courseQuizzes[m[1]];
      commit();
      return undefined;
    },
  },
  // POST /courses/:id/quiz/questions
  {
    method: "POST",
    pattern: /^\/courses\/([^/]+)\/quiz\/questions$/,
    handle: (m, _p, init) => {
      const quiz = db.courseQuizzes[m[1]];
      if (!quiz) return undefined;
      const body = parseBody<QuizPayload["questions"][number]>(init);
      if (!body) return undefined;
      const question = {
        id: uuid(),
        text: body.text,
        type: body.type === "written" ? "written" as const : "multiple_choice" as const,
        options: body.options ?? [],
        correctIdx: body.correctIdx ?? 0,
        correctText: body.correctText,
        explanation: body.explanation ?? null,
      };
      quiz.questions.push(question);
      commit();
      return question;
    },
  },
  // GET /courses/:id/builder/modules
  {
    method: "GET",
    pattern: /^\/courses\/([^/]+)\/builder\/modules$/,
    handle: (m) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      return course.modules ?? [];
    },
  },
  // GET /courses/:id/builder/quizzes
  {
    method: "GET",
    pattern: /^\/courses\/([^/]+)\/builder\/quizzes$/,
    handle: (m) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      return (course.modules ?? [])
        .filter((mod) => mod.quiz)
        .map((mod) => ({
          ...mod.quiz,
          moduleId: mod.id,
          lectureId: null,
          quizScope: "module",
        }));
    },
  },
  // POST /courses/:id/builder/modules
  {
    method: "POST",
    pattern: /^\/courses\/([^/]+)\/builder\/modules$/,
    handle: (m, _p, init) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const body = parseBody<{ title?: string; description?: string }>(init) ?? {};
      course.modules = course.modules ?? [];
      const created: MockModuleResponse = {
        id: uuid(),
        title: body.title ?? "Untitled module",
        description: body.description ?? "",
        order: course.modules.length,
        lectures: [],
        quiz: null,
      };
      course.modules.push(created);
      course.updatedAt = nowIso();
      commit();
      return created;
    },
  },
  // PUT /courses/:id/builder/modules/:moduleId
  {
    method: "PUT",
    pattern: /^\/courses\/([^/]+)\/builder\/modules\/([^/]+)$/,
    handle: (m, _p, init) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const mod = findModule(course, m[2]);
      if (!mod) return undefined;
      const body = parseBody<{ title?: string; description?: string }>(init) ?? {};
      if (body.title !== undefined) mod.title = body.title;
      if (body.description !== undefined) mod.description = body.description;
      course.updatedAt = nowIso();
      commit();
      return mod;
    },
  },
  // DELETE /courses/:id/builder/modules/:moduleId
  {
    method: "DELETE",
    pattern: /^\/courses\/([^/]+)\/builder\/modules\/([^/]+)$/,
    handle: (m) => {
      const course = findCourse(m[1]);
      if (!course || !course.modules) return undefined;
      const idx = course.modules.findIndex((mod) => mod.id === m[2]);
      if (idx === -1) return undefined;
      course.modules.splice(idx, 1);
      course.updatedAt = nowIso();
      commit();
      return undefined;
    },
  },
  // POST /courses/:id/builder/modules/:moduleId/lectures
  {
    method: "POST",
    pattern: /^\/courses\/([^/]+)\/builder\/modules\/([^/]+)\/lectures$/,
    handle: (m, _p, init) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const mod = findModule(course, m[2]);
      if (!mod) return undefined;
      const body = parseBody<{
        title?: string;
        videoUrl?: string | null;
        order?: number;
        durationSecs?: number;
      }>(init) ?? {};
      const created: LectureAPI = {
        id: uuid(),
        title: body.title ?? "Untitled lecture",
        videoUrl: body.videoUrl ?? null,
        order: body.order ?? mod.lectures.length,
        durationSecs: body.durationSecs ?? 0,
      };
      mod.lectures.push(created);
      course.updatedAt = nowIso();
      commit();
      return created;
    },
  },
  // PUT /courses/:id/builder/modules/:moduleId/lectures/:lectureId
  {
    method: "PUT",
    pattern: /^\/courses\/([^/]+)\/builder\/modules\/([^/]+)\/lectures\/([^/]+)$/,
    handle: (m, _p, init) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const mod = findModule(course, m[2]);
      if (!mod) return undefined;
      const lecture = mod.lectures.find((l) => l.id === m[3]);
      if (!lecture) return undefined;
      const body = parseBody<Partial<LectureAPI>>(init) ?? {};
      Object.assign(lecture, body, { id: lecture.id });
      course.updatedAt = nowIso();
      commit();
      return lecture;
    },
  },
  // DELETE /courses/:id/builder/modules/:moduleId/lectures/:lectureId
  {
    method: "DELETE",
    pattern: /^\/courses\/([^/]+)\/builder\/modules\/([^/]+)\/lectures\/([^/]+)$/,
    handle: (m) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const mod = findModule(course, m[2]);
      if (!mod) return undefined;
      const idx = mod.lectures.findIndex((l) => l.id === m[3]);
      if (idx === -1) return undefined;
      mod.lectures.splice(idx, 1);
      course.updatedAt = nowIso();
      commit();
      return undefined;
    },
  },
  // GET /courses/:id/builder/modules/:moduleId/quiz
  {
    method: "GET",
    pattern: /^\/courses\/([^/]+)\/builder\/modules\/([^/]+)\/quiz$/,
    handle: (m) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const mod = findModule(course, m[2]);
      if (!mod) return undefined;
      return mod.quiz ?? null;
    },
  },
  // POST /courses/:id/builder/modules/:moduleId/quiz
  {
    method: "POST",
    pattern: /^\/courses\/([^/]+)\/builder\/modules\/([^/]+)\/quiz$/,
    handle: (m, _p, init) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const mod = findModule(course, m[2]);
      if (!mod) return undefined;
      const body = parseBody<QuizPayload>(init);
      if (!body) return undefined;
      const quiz: QuizAPI = {
        id: mod.quiz?.id ?? uuid(),
        courseId: course.id,
        moduleId: mod.id,
        quizScope: "module",
        title: body.title,
        passingScore: body.passingScore ?? 70,
        timeLimit: body.timeLimit ?? 0,
        shuffleQuestions: body.shuffleQuestions ?? false,
        questions: body.questions.map((q) => ({
          id: uuid(),
          text: q.text,
          type: q.type === "written" ? "written" : "multiple_choice",
          options: q.options ?? [],
          correctIdx: q.correctIdx,
          correctText: q.correctText,
          explanation: q.explanation ?? null,
        })),
      };
      mod.quiz = quiz;
      course.updatedAt = nowIso();
      commit();
      return quiz;
    },
  },
  // DELETE /courses/:id/builder/modules/:moduleId/quiz
  {
    method: "DELETE",
    pattern: /^\/courses\/([^/]+)\/builder\/modules\/([^/]+)\/quiz$/,
    handle: (m) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const mod = findModule(course, m[2]);
      if (!mod) return undefined;
      mod.quiz = null;
      course.updatedAt = nowIso();
      commit();
      return undefined;
    },
  },
  // POST /files/thumbnail and /files/lecture (multipart) → stub URL
  {
    method: "POST",
    pattern: /^\/files\/(thumbnail|lecture)$/,
    handle: (m) => {
      const kind = m[1];
      const response: UploadResponse = {
        id: uuid(),
        url: "https://placehold.co/640x360",
        filename: `mock-${kind}-${Date.now()}`,
        contentType: kind === "thumbnail" ? "image/png" : "application/pdf",
        size: 1024,
      };
      return response;
    },
  },

  // ── Teacher dashboard ──────────────────────────────────
  // GET /teacher-dashboard/me/overview
  {
    method: "GET",
    pattern: /^\/teacher-dashboard\/me\/overview$/,
    handle: () => {
      return {
        stats: {
          studentsEnrolled: 156,
          activeCourses: 3,
          quizzesCompleted: 42,
          completionRatePct: 78,
        },
        coursesPreview: db.courses.slice(0, 3).map(c => ({
          courseId: c.id,
          title: c.title,
          description: c.description,
          status: c.status,
          enrollmentCount: 52,
          avgRating: 4.8,
        })),
        quizzesPreview: [],
        commentsPreview: [],
      };
    },
  },

  // ── Landing ────────────────────────────────────────────
  // GET /landing/statistics
  {
    method: "GET",
    pattern: /^\/landing\/statistics$/,
    handle: () => ({
      activeStudents: 5432,
      totalTeachers: 142,
      freeCourses: 324,
      satisfactionRate: "99%",
    }),
  },
  // GET /landing/categories
  {
    method: "GET",
    pattern: /^\/landing\/categories$/,
    handle: () => ({
      "Toate": 324,
      "Programare": 150,
      "Design": 80,
      "Marketing": 45,
      "Business": 49,
    }),
  },
  // GET /landing/courses/popular
  {
    method: "GET",
    pattern: /^\/landing\/courses\/popular$/,
    handle: () => {
      return db.courses.slice(0, 4).map(c => ({
        title: c.title,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        avgRating: 4.8 + (Math.random() * 0.2),
        enrollmentCount: Math.floor(Math.random() * 5000) + 100,
      }));
    },
  },

  // ── Student dashboard ──────────────────────────────────
  // GET /student-dashboard/:studentId/stats
  {
    method: "GET",
    pattern: /^\/student-dashboard\/([^/]+)\/stats$/,
    handle: (m) => {
      const enrolled = db.enrollments[m[1]] ?? [];
      const stats: StudentStats = {
        firstName: "Teo",
        lastName: "Student",
        name: "Teo Student",
        enrolledCourses: Math.max(enrolled.length, 5),
        activeCourses: 3,
        quizzesCompleted: 12,
        streakDays: 7,
      };
      return stats;
    },
  },
  // GET /student-dashboard/:studentId/courses
  {
    method: "GET",
    pattern: /^\/student-dashboard\/([^/]+)\/courses$/,
    handle: (m) => {
      const studentId = m[1];
      const ids = db.enrollments[studentId] ?? [];
      const enrolled = ids
        .map((id) => findCourse(id))
        .filter((c): c is CourseAPI => Boolean(c));
      const list: StudentCourse[] = enrolled.map((c, idx) => {
        // Derive a rough overall progress from per-lecture watched %s.
        const lectures = (c.modules ?? []).flatMap((mod) => mod.lectures);
        const watched = lectures.reduce((sum, l) => {
          const p = getProgress(studentId, c.id, l.id)?.watchedPercent ?? 0;
          return sum + p;
        }, 0);
        const overall =
          lectures.length === 0 ? 0 : Math.round(watched / lectures.length);
        return {
          title: c.title,
          overallProgress: overall,
          enrollmentCount: 120 + idx * 37,
          avgRating: 4.5 + idx * 0.2,
        };
      });
      return list;
    },
  },
  // GET /student-dashboard/:studentId/quizzes
  {
    method: "GET",
    pattern: /^\/student-dashboard\/([^/]+)\/quizzes$/,
    handle: () => {
      const list: StudentQuiz[] = [
        {
          titluQuiz: "Patterns checkpoint",
          numeCurs: "TypeScript Mastery",
          incercari: 2,
          scor: 85,
          status: "Promovat",
        },
        {
          titluQuiz: "React Fundamentals quiz",
          numeCurs: "Building Modern React Apps",
          incercari: 1,
          scor: 60,
          status: "Repetă",
        },
        {
          titluQuiz: "JavaScript essentials",
          numeCurs: "Web Development",
          incercari: 3,
          scor: 92,
          status: "Promovat",
        },
      ];
      return list;
    },
  },
  // GET /student-dashboard/:studentId/answers
  {
    method: "GET",
    pattern: /^\/student-dashboard\/([^/]+)\/answers$/,
    handle: () => {
      const list: Answer[] = [
        {
          autorRaspuns: "Prof. Ana Popescu",
          intrebare: "Care e diferența dintre `interface` și `type` în TS?",
          raspuns:
            "Pe scurt: `interface` se poate extinde declarativ și e gândită pentru forme de obiecte; `type` e mai general (uniuni, tupluri, mapped types).",
        },
        {
          autorRaspuns: "Mihai Ionescu",
          intrebare: "Unde găsesc exemplele din lecția 2?",
          raspuns: "În repo-ul cursului, folder `examples/module-2/`.",
        },
      ];
      return list;
    },
  },
  // GET /student-dashboard/:studentId/continue
  {
    method: "GET",
    pattern: /^\/student-dashboard\/([^/]+)\/continue$/,
    handle: (m) => {
      const ids = db.enrollments[m[1]] ?? [];
      const first = ids.map((id) => findCourse(id)).find((c) => Boolean(c));
      if (!first) return null;
      const cont: ContinueStudy = {
        titluCurs: first.title,
        cursId: first.id,
      };
      return cont;
    },
  },
  // GET /student-dashboard/:studentId/recommendations
  {
    method: "GET",
    pattern: /^\/student-dashboard\/([^/]+)\/recommendations$/,
    handle: () => {
      const featured = db.courses[1] ?? db.courses[0];
      if (!featured) return null;
      const rec: Recommendation = {
        title: featured.title,
        description: featured.description,
        courseId: featured.id,
      };
      return rec;
    },
  },

  // ── Lesson video ───────────────────────────────────────
  // GET /students/:studentId/courses/:courseId
  {
    method: "GET",
    pattern: /^\/students\/([^/]+)\/courses\/([^/]+)$/,
    handle: (m) => {
      const studentId = m[1];
      const course = findCourse(m[2]);
      if (!course) return undefined;
      const lectures = (course.modules ?? []).flatMap((mod) => mod.lectures);
      const watched = lectures.reduce((sum, l) => {
        const p = getProgress(studentId, course.id, l.id)?.watchedPercent ?? 0;
        return sum + p;
      }, 0);
      const overall =
        lectures.length === 0 ? 0 : Math.round(watched / lectures.length);
      const header: CourseHeader = {
        courseId: course.id,
        title: course.title,
        description: course.description,
        teacher: {
          teacherId: course.teacherId,
          displayName: "Prof. Ana Popescu",
        },
        overallProgress: overall,
      };
      return header;
    },
  },
  // GET /students/:studentId/courses/:courseId/modules
  {
    method: "GET",
    pattern: /^\/students\/([^/]+)\/courses\/([^/]+)\/modules$/,
    handle: (m) => {
      const studentId = m[1];
      const course = findCourse(m[2]);
      if (!course) return undefined;
      const summaries: ModuleSummary[] = (course.modules ?? []).map((mod) => ({
        moduleId: mod.id,
        title: mod.title,
        order: mod.order + 1,
        lectures: mod.lectures.map((l) => lectureToSummary(l, studentId, course.id)),
        quiz: mod.quiz ? quizToStatus(mod.quiz) : undefined,
      }));
      return summaries;
    },
  },
  // GET /students/:studentId/courses/:courseId/lectures/:lectureId
  {
    method: "GET",
    pattern: /^\/students\/([^/]+)\/courses\/([^/]+)\/lectures\/([^/]+)$/,
    handle: (m) => {
      const studentId = m[1];
      const course = findCourse(m[2]);
      if (!course) return undefined;
      const found = findLecture(course, m[3]);
      if (!found) return undefined;
      const progress = getProgress(studentId, course.id, found.lecture.id);
      const details: LectureDetails = {
        lectureId: found.lecture.id,
        title: found.lecture.title,
        videoUrl: found.lecture.videoUrl ?? "https://www.youtube.com/embed/dQw4w9WgXcQ",
        durationSecs: found.lecture.durationSecs,
        order: found.lecture.order,
        positionSecs: progress?.positionSecs ?? 0,
        watchedPercent: progress?.watchedPercent ?? 0,
        completed: progress?.completed ?? false,
      };
      return details;
    },
  },
  // GET /students/:studentId/courses/:courseId/lectures/:lectureId/comments
  {
    method: "GET",
    pattern: /^\/students\/([^/]+)\/courses\/([^/]+)\/lectures\/([^/]+)\/comments$/,
    handle: (m, parsed) => {
      const studentId = m[1];
      const courseId = m[2];
      const lectureId = m[3];
      const list = db.lectureComments[courseId]?.[lectureId] ?? [];
      const sortBy = parsed.query.get("sortBy") ?? "recent";
      const sorted = [...list].sort((a, b) => {
        if (sortBy === "popular") return b.likeCount - a.likeCount;
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // default: recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      // Pinned items always float to the top.
      sorted.sort((a, b) => Number(b.isPinned ?? false) - Number(a.isPinned ?? false));
      return sorted.map((c) => toCourseComment(c, studentId));
    },
  },
  // POST /students/:studentId/courses/:courseId/lectures/:lectureId/comments
  {
    method: "POST",
    pattern: /^\/students\/([^/]+)\/courses\/([^/]+)\/lectures\/([^/]+)\/comments$/,
    handle: (m, _p, init) => {
      const studentId = m[1];
      const courseId = m[2];
      const lectureId = m[3];
      const body = parseBody<{
        body?: string;
        timestampSecs?: number;
        videoTimestamp?: number;
      }>(init) ?? {};
      const created: MockLectureComment = {
        commentId: uuid(),
        authorId: studentId,
        authorName: "Teo Student",
        authorRole: "STUDENT",
        body: body.body ?? "",
        timestampSecs: body.timestampSecs ?? body.videoTimestamp,
        likeCount: 0,
        createdAt: nowIso(),
        likedBy: [],
      };
      if (!db.lectureComments[courseId]) db.lectureComments[courseId] = {};
      if (!db.lectureComments[courseId][lectureId]) {
        db.lectureComments[courseId][lectureId] = [];
      }
      db.lectureComments[courseId][lectureId].unshift(created);
      commit();
      return toCourseComment(created, studentId);
    },
  },
  // POST /students/:studentId/comments/:commentId/like
  {
    method: "POST",
    pattern: /^\/students\/([^/]+)\/comments\/([^/]+)\/like$/,
    handle: (m) => {
      const studentId = m[1];
      const commentId = m[2];
      const found = findLectureComment(commentId);
      if (!found) return undefined;
      const { comment } = found;
      const idx = comment.likedBy.indexOf(studentId);
      if (idx >= 0) {
        comment.likedBy.splice(idx, 1);
        comment.likeCount = Math.max(0, comment.likeCount - 1);
      } else {
        comment.likedBy.push(studentId);
        comment.likeCount += 1;
      }
      commit();
      return undefined;
    },
  },
  // PUT /students/:studentId/courses/:courseId/lectures/:lectureId/progress
  {
    method: "PUT",
    pattern: /^\/students\/([^/]+)\/courses\/([^/]+)\/lectures\/([^/]+)\/progress$/,
    handle: (m, _p, init) => {
      const studentId = m[1];
      const courseId = m[2];
      const lectureId = m[3];
      const body = parseBody<LectureProgressPayload>(init);
      if (!body) return undefined;
      setProgress(studentId, courseId, lectureId, {
        positionSecs: Math.max(0, Math.floor(body.positionSecs ?? 0)),
        watchedPercent: Math.max(0, Math.min(100, Math.floor(body.watchedPercent ?? 0))),
        completed: Boolean(body.completed),
      });
      commit();
      return undefined;
    },
  },

  // ── Quiz player ────────────────────────────────────────
  // GET /quizzes/:quizId
  {
    method: "GET",
    pattern: /^\/quizzes\/([^/]+)$/,
    handle: (m) => buildMockQuiz(m[1]),
  },
];

/**
 * Try to resolve a request against the mock DB.
 *
 * Contract:
 *   - returns `undefined` when no rule matches → the caller should fall through
 *     to the original error.
 *   - returns the mocked response body (any non-`undefined` value, possibly
 *     `null`) when a rule matches. Routes that semantically return "no body"
 *     (DELETE, etc.) return `null` so the caller can distinguish them from
 *     "no match".
 */
export function tryDevMock(
  path: string,
  init?: RequestInit,
): unknown | undefined {
  const parsed = parsePath(path);
  const m = method(init);
  for (const route of routes) {
    if (route.method !== m) continue;
    const match = parsed.pathname.match(route.pattern);
    if (!match) continue;
    const result = route.handle(match, parsed, init);
    return result === undefined ? null : result;
  }
  return undefined;
}
