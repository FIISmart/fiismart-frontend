import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, X } from "lucide-react";

/**
 * Dev-only floating route navigator. Renders only when `import.meta.env.DEV`.
 * Mounted globally from App so it's reachable on every page during preview;
 * stripped from production builds.
 *
 * For routes with `:courseId` / `:lectureId` / `:quizId` params we read the
 * first matching id straight out of the dev-mock localStorage db
 * (`fiismart_dev_mock_db`) so links land on real seeded content.
 */

const MOCK_DB_KEY = "fiismart_dev_mock_db";

interface MockSnapshot {
  firstCourseId: string | null;
  firstLectureId: string | null;
  firstQuizId: string | null;
}

function readMockDb(): MockSnapshot {
  const empty: MockSnapshot = {
    firstCourseId: null,
    firstLectureId: null,
    firstQuizId: null,
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(MOCK_DB_KEY);
    if (!raw) return empty;
    const db = JSON.parse(raw) as {
      courses?: Array<{
        id: string;
        modules?: Array<{
          id: string;
          lectures?: Array<{ id: string }>;
          quiz?: { id?: string } | null;
        }>;
      }>;
    };
    const course = db.courses?.[0];
    const firstModuleWithLecture = course?.modules?.find(
      (m) => Array.isArray(m.lectures) && m.lectures.length > 0
    );
    const firstModuleWithQuiz = course?.modules?.find((m) => m.quiz?.id);
    return {
      firstCourseId: course?.id ?? null,
      firstLectureId: firstModuleWithLecture?.lectures?.[0]?.id ?? null,
      firstQuizId: firstModuleWithQuiz?.quiz?.id ?? null,
    };
  } catch {
    return empty;
  }
}

interface RouteEntry {
  path: string;
  label: string;
  group: "Public" | "Student" | "Professor";
  /** True when the link couldn't be resolved (no mock data) — render disabled. */
  disabled?: boolean;
}

function buildRoutes(snap: MockSnapshot): RouteEntry[] {
  const courseId = snap.firstCourseId ?? "no-course";
  const lectureId = snap.firstLectureId ?? "no-lecture";
  const quizId = snap.firstQuizId ?? "no-quiz";
  const noCourse = !snap.firstCourseId;
  const noLecture = !snap.firstLectureId;
  const noQuiz = !snap.firstQuizId;

  return [
    { path: "/", label: "Landing", group: "Public" },
    { path: "/auth", label: "Auth", group: "Public" },
    { path: "/terms", label: "Terms", group: "Public" },
    { path: "/privacy", label: "Privacy", group: "Public" },

    { path: "/student/dashboard", label: "Student Dashboard", group: "Student" },
    {
      path: `/student/courses/${courseId}/lectures/${lectureId}`,
      label: "Lesson Video",
      group: "Student",
      disabled: noCourse || noLecture,
    },
    {
      path: `/student/quizzes/${quizId}`,
      label: "Quiz Player",
      group: "Student",
      disabled: noQuiz,
    },

    { path: "/professor/dashboard", label: "Professor Dashboard", group: "Professor" },
    { path: "/professor/courses", label: "Courses List", group: "Professor" },
    {
      path: `/professor/courses/${courseId}`,
      label: "Course Builder",
      group: "Professor",
      disabled: noCourse,
    },
  ];
}

export function DevNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Re-read on every open so freshly-seeded ids are picked up. Cheap.
  const routes = useMemo(() => (open ? buildRoutes(readMockDb()) : []), [open]);

  if (!import.meta.env.DEV) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Dev navigator — jump to any page"
        className="fixed bottom-4 right-4 z-[9999] grid place-items-center size-11 rounded-full bg-amber-400 text-amber-950 shadow-lg hover:bg-amber-300 transition-colors"
      >
        <Compass className="size-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 rounded-xl border border-amber-400/60 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center justify-between bg-amber-50 px-3 py-2 border-b border-amber-200/60">
        <span className="text-xs font-semibold text-amber-900/80 uppercase tracking-wide">
          Dev navigator
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="size-6 grid place-items-center rounded text-amber-900/60 hover:text-amber-900 hover:bg-amber-100"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="p-2 max-h-[60vh] overflow-y-auto">
        {(["Public", "Student", "Professor"] as const).map((group) => (
          <div key={group} className="mb-2 last:mb-0">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              {group}
            </div>
            {routes
              .filter((r) => r.group === group)
              .map((r) => {
                const active = pathname === r.path;
                if (r.disabled) {
                  return (
                    <div
                      key={r.label}
                      className="block px-2 py-1.5 rounded text-sm text-neutral-400 italic"
                      title="Open in dev — visit /professor/courses or /student/dashboard first to seed mock data"
                    >
                      {r.label}
                      <span className="ml-2 text-[10px] text-neutral-300 font-mono">
                        no mock data
                      </span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={r.label}
                    to={r.path}
                    onClick={() => setOpen(false)}
                    className={`block px-2 py-1.5 rounded text-sm ${
                      active
                        ? "bg-amber-100 text-amber-900 font-medium"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {r.label}
                    <span className="ml-2 text-[10px] text-neutral-400 font-mono">
                      {r.path.length > 36 ? r.path.slice(0, 33) + "…" : r.path}
                    </span>
                  </Link>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
