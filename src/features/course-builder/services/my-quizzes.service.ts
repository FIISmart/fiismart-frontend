import * as api from "@/lib/api";
import type { Quiz } from "@/lib/course-types";
import { mapQuizToFE } from "@/lib/course-types";

export type MyQuiz = Quiz & {
  courseId: string;
  courseTitle?: string;
  moduleId?: string | null;
  moduleTitle?: string;
  lectureId?: string | null;
  quizScope: string;
};

export function quizToModuleQuizPayload(quiz: Quiz): api.ModuleQuizPayload {
  const writtenQuestion = quiz.questions.find((q) => q.type === "written");
  if (writtenQuestion) {
    throw new Error("Quiz-urile de modul/lecție/curs final acceptă doar întrebări grilă (multiple choice).");
  }

  return {
    title: quiz.title,
    passingScore: quiz.passingScore ?? 70,
    timeLimit: quiz.timeLimit ?? 30,
    shuffleQuestions: quiz.shuffleQuestions ?? false,
    questions: quiz.questions.map((question) => {
      const options = (question.options ?? []).filter((option) => option.trim());
      const correctIdx =
        typeof question.correctAnswer === "number" ? question.correctAnswer : 0;

      return {
        text: question.question,
        type: "multiple_choice",
        points: 1,
        options,
        correctIdx: Math.min(Math.max(correctIdx, 0), Math.max(options.length - 1, 0)),
        explanation: question.explanation?.trim() || undefined,
      };
    }),
  };
}

export function quizToCourseQuizPayload(quiz: Quiz): api.QuizPayload {
  return {
    title: quiz.title,
    passingScore: quiz.passingScore ?? 70,
    timeLimit: quiz.timeLimit ?? 30,
    shuffleQuestions: quiz.shuffleQuestions ?? false,
    questions: quiz.questions.map((question) => {
      const isWritten = question.type === "written";
      const options = isWritten
        ? []
        : (question.options ?? []).filter((option) => option.trim());
      const correctIdx =
        typeof question.correctAnswer === "number" ? question.correctAnswer : 0;

      return {
        text: question.question,
        type: question.type,
        options,
        correctIdx: Math.min(Math.max(correctIdx, 0), Math.max(options.length - 1, 0)),
        correctText:
          typeof question.correctAnswer === "string" ? question.correctAnswer : undefined,
        explanation: question.explanation?.trim() || undefined,
      };
    }),
  };
}

export async function getTeacherCourseQuizzes(teacherId: string): Promise<MyQuiz[]> {
  const courses = await api.getCoursesByTeacher(teacherId);
  const quizzes = await Promise.all(courses.map(async (course) => {
    try {
      const [builderQuizzes, courseDetails] = await Promise.all([
        getMyQuizzes(course.id).catch(() => [] as MyQuiz[]),
        api.getCourse(course.id).catch(() => null),
      ]);
      const moduleTitleById = new Map<string, string>(
        (courseDetails?.modules ?? []).map((module) => [module.id, module.title] as const),
      );
      return builderQuizzes.map((quiz) => ({
        ...quiz,
        courseTitle: course.title,
        moduleTitle: quiz.moduleId ? moduleTitleById.get(quiz.moduleId) : undefined,
      }));
    } catch {
      return [] as MyQuiz[];
    }
  }));

  return quizzes
    .flat()
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function upsertCourseQuiz(courseId: string, quiz: Quiz): Promise<MyQuiz> {
  const payload = quizToCourseQuizPayload(quiz);
  await api.deleteQuiz(courseId).catch(() => undefined);
  const savedQuiz = await api.createOrUpdateQuiz(courseId, {
    title: payload.title,
    passingScore: payload.passingScore,
    timeLimit: payload.timeLimit,
    shuffleQuestions: payload.shuffleQuestions,
    questions: [],
  });

  const savedQuestions = await Promise.all(
    payload.questions.map((question) => api.addQuizQuestion(courseId, question)),
  );

  return {
    ...mapQuizToFE({ ...savedQuiz, questions: savedQuestions }),
    courseId,
    moduleId: null,
    lectureId: null,
    quizScope: "course",
  };
}

export async function deleteCourseQuiz(courseId: string): Promise<void> {
  await api.deleteQuiz(courseId);
}

export async function getMyQuizzes(courseId: string): Promise<MyQuiz[]> {
  const quizzes = await api.getCourseBuilderQuizzes(courseId);
  return quizzes
    .map((quiz) => ({
      ...mapQuizToFE(quiz),
      courseId: quiz.courseId,
      moduleId: quiz.moduleId,
      lectureId: quiz.lectureId,
      quizScope: quiz.quizScope,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function upsertModuleQuiz(
  courseId: string,
  moduleId: string,
  quiz: Quiz,
): Promise<MyQuiz> {
  const saved = await api.createOrUpdateModuleQuiz(
    courseId,
    moduleId,
    quizToModuleQuizPayload(quiz),
  );

  return {
    ...mapQuizToFE(saved),
    courseId: saved.courseId,
    moduleId: saved.moduleId,
    lectureId: saved.lectureId,
    quizScope: saved.quizScope,
  };
}

export async function deleteModuleQuiz(courseId: string, moduleId: string): Promise<void> {
  await api.deleteModuleQuiz(courseId, moduleId);
}

export async function upsertLectureQuiz(
  courseId: string,
  moduleId: string,
  lectureId: string,
  quiz: Quiz,
): Promise<MyQuiz> {
  const saved = await api.createOrUpdateLectureQuiz(
    courseId,
    moduleId,
    lectureId,
    quizToModuleQuizPayload(quiz),
  );

  return {
    ...mapQuizToFE(saved),
    courseId: saved.courseId,
    moduleId: saved.moduleId,
    lectureId: saved.lectureId,
    quizScope: saved.quizScope,
  };
}

export async function deleteLectureQuiz(
  courseId: string,
  moduleId: string,
  lectureId: string,
): Promise<void> {
  await api.deleteLectureQuiz(courseId, moduleId, lectureId);
}

export async function upsertCourseFinalQuiz(
  courseId: string,
  quiz: Quiz,
): Promise<MyQuiz> {
  const saved = await api.createOrUpdateCourseFinalQuiz(
    courseId,
    quizToModuleQuizPayload(quiz),
  );

  return {
    ...mapQuizToFE(saved),
    courseId: saved.courseId,
    moduleId: saved.moduleId,
    lectureId: saved.lectureId,
    quizScope: saved.quizScope,
  };
}

export async function deleteCourseFinalQuiz(courseId: string): Promise<void> {
  await api.deleteCourseFinalQuiz(courseId);
}
