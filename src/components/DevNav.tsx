import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, X } from "lucide-react";

/**
 * Dev-only floating route navigator. Renders only when `import.meta.env.DEV`.
 * Mounted globally from App so it's reachable on every page during preview;
 * stripped from production builds.
 */

const SAMPLE_COURSE_ID = "preview-course-1";
const SAMPLE_LECTURE_ID = "preview-lecture-1";
const SAMPLE_QUIZ_ID = "preview-quiz-1";

const routes: Array<{ path: string; label: string; group: "Public" | "Student" | "Professor" }> = [
  { path: "/", label: "Landing", group: "Public" },
  { path: "/auth", label: "Auth", group: "Public" },
  { path: "/terms", label: "Terms", group: "Public" },
  { path: "/privacy", label: "Privacy", group: "Public" },

  { path: "/student/dashboard", label: "Student Dashboard", group: "Student" },
  {
    path: `/student/courses/${SAMPLE_COURSE_ID}/lectures/${SAMPLE_LECTURE_ID}`,
    label: "Lesson Video",
    group: "Student",
  },
  { path: `/student/quizzes/${SAMPLE_QUIZ_ID}`, label: "Quiz Player", group: "Student" },

  { path: "/professor/dashboard", label: "Professor Dashboard", group: "Professor" },
  { path: "/professor/courses", label: "Courses List", group: "Professor" },
  { path: `/professor/courses/${SAMPLE_COURSE_ID}`, label: "Course Builder", group: "Professor" },
];

export function DevNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

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
    <div className="fixed bottom-4 right-4 z-[9999] w-72 rounded-xl border border-amber-400/60 bg-white shadow-xl overflow-hidden">
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
                return (
                  <Link
                    key={r.path}
                    to={r.path}
                    onClick={() => setOpen(false)}
                    className={`block px-2 py-1.5 rounded text-sm ${
                      active
                        ? "bg-amber-100 text-amber-900 font-medium"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {r.label}
                    <span className="ml-2 text-[10px] text-neutral-400 font-mono">{r.path}</span>
                  </Link>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
