// Statisticile din partea de sus a paginii.
export interface DashboardStats {
  studentsEnrolled: number;
  activeCourses: number;
  quizzesCompleted: number;
  completionRatePct: number;
}

// Formatul pentru un curs din lista de preview.
export interface CoursePreview {
  courseId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  status: string; // backend trimite "published" sau "draft"
  enrollmentCount: number;
  avgRating: number;
  updatedAt: string;
}

// Formatul pentru un quiz din tabel.
export interface QuizPreview {
  quizId: string;
  title: string;
  courseId: string;
  courseTitle: string;
  attemptsCount: number;
  avgScorePct: number;
  status: string; // "active" sau "draft"
}

// Formatul pentru un comentariu.
export interface CommentPreview {
  commentId: string;
  courseId: string;
  courseTitle: string;
  lectureId: string;
  authorId: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
  likeCount: number;
  repliesCount: number;
  isAnswered: boolean;
}

// Obiectul total returnat de endpoint-ul "overview".
export interface DashboardOverviewResponse {
  stats: DashboardStats;
  coursesPreview: CoursePreview[];
  quizzesPreview: QuizPreview[];
  commentsPreview: CommentPreview[];
}
