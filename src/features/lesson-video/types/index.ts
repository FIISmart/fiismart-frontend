export interface CourseHeader {
  courseId: string;
  title: string;
  description: string;
  teacher: {
    teacherId: string;
    displayName: string;
  };
  overallProgress: number;
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
  order: number;
  durationSecs: number;
  completed: boolean;
  watchedPercent: number;
  lastPositionSecs: number;
}

export interface QuizStatus {
  quizId: string;
  attemptCount: number;
  lastScore: number;
  passed: boolean;
  statusLabel: string;
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
  timestampSecs?: number;
  likeCount: number;
  timeAgo: string;
  likedByMe: boolean;
  isPinned?: boolean;
}

export interface LectureDetails {
  lectureId: string;
  title: string;
  videoUrl: string;
  durationSecs: number;
  order: number;
  positionSecs?: number;
  watchedPercent?: number;
  completed?: boolean;
}

export interface LectureProgressPayload {
  watchedPercent: number;
  positionSecs: number;
  completed: boolean;
}

export interface AddCommentPayload {
  body: string;
  timestampSecs: number;
  videoTimestamp: number;
}
