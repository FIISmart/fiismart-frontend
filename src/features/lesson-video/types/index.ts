export interface CourseHeader {
  courseId: string;
  title: string;
  description: string;
  teacher: {
    teacherId: string;
    displayName: string;
  };
  overallProgress: number;
  finalQuiz?: QuizStatus | null;
}

export interface CourseDetails {
  courseId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  teacher: {
    teacherId: string;
    displayName: string;
  };
  overallProgress: number;
}

export interface LectureSummary {
  lectureId: string;
  title: string;
  type?: "video" | "pdf" | "markdown" | string;
  content?: string;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  order: number;
  durationSecs: number;
  completed: boolean;
  watchedPercent: number;
  lastPositionSecs: number;
  quiz?: QuizStatus | null;
}

export interface QuizStatus {
  quizId: string;
  title?: string;
  scope?: "lecture" | "module" | "course_final" | string;
  moduleId?: string | null;
  lectureId?: string | null;
  attemptCount?: number;
  lastScore?: number;
  latestScore?: number;
  passed?: boolean;
  status?: string;
  statusLabel?: string;
}

export interface ModuleSummary {
  moduleId: string;
  title: string;
  order: number;
  lectures: LectureSummary[];
  quiz?: QuizStatus;
}

export interface StudentCommentDTO {
  commentId: string;
  authorName: string;
  authorRole: string;
  body: string;
  videoTimestamp?: number;
  likeCount: number;
  timeAgo: string;
  isLikedByMe: boolean;
  createdAt: string;
  replies: StudentCommentDTO[];
}

export interface CourseComment {
  commentId: string;
  authorName: string;
  authorRole?: string;
  body: string;
  likeCount: number;
  timeAgo: string;
  isPinned?: boolean;
  createdAt?: string;
  timestampSecs?: number;
  videoTimestamp?: number; 
  likedByMe?: boolean;
  isLikedByMe?: boolean;
  replies?: CourseComment[] | StudentCommentDTO[]; 
}

export interface LectureDetails {
  lectureId: string;
  title: string;
  type?: "video" | "pdf" | "markdown" | string;
  content?: string;
  videoUrl: string;
  pdfUrl?: string | null;
  durationSecs: number;
  order: number;
  positionSecs?: number;
  watchedPercent?: number;
  completed?: boolean;
  quiz?: QuizStatus | null;
}

export interface LectureProgressPayload {
  watchedPercent: number;
  positionSecs: number;
  completed: boolean;
  durationSecs?: number;
}

export interface AddCommentPayload {
  body: string;
  timestampSecs: number;
  videoTimestamp: number;
  parentCommentId?: string | null;
}

export interface GroupedVideoMarker {
  time: number;
  comments: CourseComment[];
  count: number;
}
export interface ReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StreakResponse {
  currentStreak: number;
  hasCompletedToday: boolean;
}
