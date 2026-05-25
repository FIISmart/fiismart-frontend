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
import { useLocation, useParams } from "react-router-dom";
import type { RouteContext } from "../types";

export function useRouteContext(): RouteContext {
  const location = useLocation();
  const params = useParams<{
    courseId?: string;
    lectureId?: string;
    quizId?: string;
  }>();

  return useMemo<RouteContext>(() => {
    const path = location.pathname;

    // Student
    if (path === "/student/dashboard") return { route: "student-dashboard" };
    if (path === "/student/courses") return { route: "student-courses" };
    if (/^\/student\/quizzes\/[^/]+$/.test(path)) {
      return { route: "quiz-player", quizId: params.quizId };
    }
    if (/^\/student\/courses\/[^/]+\/lectures\/[^/]+$/.test(path)) {
      return {
        route: "lecture-view",
        courseId: params.courseId,
        lectureId: params.lectureId,
      };
    }
    if (/^\/student\/courses\/[^/]+$/.test(path)) {
      return { route: "course-view", courseId: params.courseId };
    }

    // Professor
    if (path === "/professor/dashboard") return { route: "professor-dashboard" };
    if (path === "/professor/courses") return { route: "professor-courses" };
    if (path === "/professor/quizzes") return { route: "professor-quizzes" };
    if (/^\/professor\/courses\/[^/]+$/.test(path)) {
      return { route: "course-builder", courseId: params.courseId };
    }

    // Public / shared
    if (path === "/") return { route: "landing" };
    if (path.startsWith("/auth")) return { route: "auth" };

    return { route: "unknown" };
  }, [location.pathname, params.courseId, params.lectureId, params.quizId]);
}
