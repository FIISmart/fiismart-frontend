/**
 * Dev-only in-memory + localStorage mock layer for the FIISmart course-builder.
 *
 * Activated from `apiFetch` / `postMultipart` (in `./api.ts`) only when:
 *   - `import.meta.env.DEV === true`, AND
 *   - the real backend returned a non-OK response (e.g. 404, offline)
 *
 * In production builds this module is dynamically imported behind an
 * `import.meta.env.DEV` guard, so Vite tree-shakes it out of the bundle.
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

// ── Storage / DB ────────────────────────────────────────

const STORAGE_KEY = "fiismart_dev_mock_db";
const SCHEMA_VERSION = 1;
const DEV_PROFESSOR_ID = "dev-professor-aaaaaaaaaaaaaaaaaaaaaa";

export interface MockCourseDB {
  schemaVersion: number;
  courses: CourseAPI[];
  comments: Record<string, CommentAPI[]>; // by courseId
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

function makeSeedDB(): MockCourseDB {
  const courseAId = uuid();
  const courseBId = uuid();

  const moduleA1: ModuleResponse = {
    id: uuid(),
    title: "Getting Started with TypeScript",
    description: "Setup, tooling, and the type system fundamentals.",
    order: 0,
    lectures: [
      {
        id: uuid(),
        title: "Why TypeScript?",
        videoUrl: "https://placehold.co/640x360",
        order: 0,
        durationSecs: 420,
      },
      {
        id: uuid(),
        title: "Installing the toolchain",
        videoUrl: null,
        order: 1,
        durationSecs: 360,
      },
    ],
    quiz: null,
  };

  const moduleA2: ModuleResponse = {
    id: uuid(),
    title: "Generics & Conditional Types",
    description: "Reusable, type-safe abstractions.",
    order: 1,
    lectures: [
      {
        id: uuid(),
        title: "Intro to generics",
        videoUrl: "https://placehold.co/640x360",
        order: 0,
        durationSecs: 540,
      },
    ],
    quiz: null,
  };

  // Quiz attached to the third module of course A.
  const moduleA3QuizId = uuid();
  const moduleA3: ModuleResponse = {
    id: uuid(),
    title: "Practical Patterns",
    description: "Patterns you will use every day.",
    order: 2,
    lectures: [
      {
        id: uuid(),
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

  const courseA: CourseAPI = {
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

  const moduleB1: ModuleResponse = {
    id: uuid(),
    title: "React Fundamentals",
    description: "Components, props, and state.",
    order: 0,
    lectures: [
      {
        id: uuid(),
        title: "JSX in 10 minutes",
        videoUrl: null,
        order: 0,
        durationSecs: 600,
      },
      {
        id: uuid(),
        title: "Hooks 101",
        videoUrl: "https://placehold.co/640x360",
        order: 1,
        durationSecs: 720,
      },
    ],
    quiz: null,
  };

  const moduleB2: ModuleResponse = {
    id: uuid(),
    title: "State Management",
    description: "Local, lifted, and global state.",
    order: 1,
    lectures: [
      {
        id: uuid(),
        title: "useReducer in practice",
        videoUrl: null,
        order: 0,
        durationSecs: 480,
      },
    ],
    quiz: null,
  };

  const courseB: CourseAPI = {
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

  return {
    schemaVersion: SCHEMA_VERSION,
    courses: [courseA, courseB],
    comments: {
      [courseAId]: [],
      [courseBId]: [],
    },
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

function findCourse(id: string): CourseAPI | undefined {
  return db.courses.find((c) => c.id === id);
}

function findModule(course: CourseAPI, moduleId: string): ModuleResponse | undefined {
  return (course.modules ?? []).find((m) => m.id === moduleId);
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
  // POST /courses/:id/builder/modules
  {
    method: "POST",
    pattern: /^\/courses\/([^/]+)\/builder\/modules$/,
    handle: (m, _p, init) => {
      const course = findCourse(m[1]);
      if (!course) return undefined;
      const body = parseBody<{ title?: string; description?: string }>(init) ?? {};
      course.modules = course.modules ?? [];
      const created: ModuleResponse = {
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
