/**
 * useRouteContext — derivă un `RouteContext` din ruta curentă (React Router).
 *
 * BE-ul folosește acest payload (vezi `ChatContextBuilder` din planul BE
 * Phase 2.4) ca să injecteze în system prompt detalii despre pagina pe
 * care se află utilizatorul (cursul activ, lecția curentă, quiz-ul în
 * desfășurare). Ținem identificatorii ca string-uri pentru că Mongo
 * ID-urile sunt opaque.
 *
 * Sursa de adevăr pentru pattern-urile de rute este `src/App.tsx`
 * (verificat manual la implementare):
 *   /                                                           → landing
 *   /student/dashboard                                          → student-dashboard
 *   /student/courses                                            → student-courses
 *   /student/courses/:courseId                                  → course-view
 *   /student/courses/:courseId/lectures/:lectureId              → lecture-view
 *   /student/quizzes/:quizId                                    → quiz-player
 *   /professor/dashboard                                        → professor-dashboard
 *   /professor/courses                                          → professor-courses
 *   /professor/quizzes                                          → professor-quizzes
 *   /professor/courses/:courseId                                → course-builder
 *
 * Dacă nu se potrivește nimic, route = "unknown" iar BE-ul cade pe
 * un prompt generic.
 */
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { RouteContext } from "../types";

/**
 * IMPORTANT: This hook lives in ChatProvider, which is mounted at the
 * App root *outside* any `<Route>` element. React Router's `useParams`
 * only returns values when called inside the matched `<Route>` subtree,
 * so at this level it would always return `{}`. We parse IDs directly
 * from `location.pathname` with explicit regexes instead.
 */
export function useRouteContext(): RouteContext {
  const location = useLocation();

  return useMemo<RouteContext>(() => {
    const path = location.pathname;

    // Student
    if (path === "/student/dashboard") return { route: "student-dashboard" };
    if (path === "/student/courses") return { route: "student-courses" };
    {
      const m = path.match(/^\/student\/quizzes\/([^/]+)$/);
      if (m) return { route: "quiz-player", quizId: m[1] };
    }
    {
      const m = path.match(/^\/student\/courses\/([^/]+)\/lectures\/([^/]+)$/);
      if (m) return { route: "lecture-view", courseId: m[1], lectureId: m[2] };
    }
    {
      const m = path.match(/^\/student\/courses\/([^/]+)$/);
      if (m) return { route: "course-view", courseId: m[1] };
    }

    // Professor
    if (path === "/professor/dashboard") return { route: "professor-dashboard" };
    if (path === "/professor/courses") return { route: "professor-courses" };
    if (path === "/professor/quizzes") return { route: "professor-quizzes" };
    {
      const m = path.match(/^\/professor\/courses\/([^/]+)$/);
      if (m) return { route: "course-builder", courseId: m[1] };
    }

    // Public / shared
    if (path === "/") return { route: "landing" };
    if (path.startsWith("/auth")) return { route: "auth" };

    return { route: "unknown" };
  }, [location.pathname]);
}
