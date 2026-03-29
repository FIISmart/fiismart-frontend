// Acestea sunt statisticile din partea de sus a paginii [cite: 155-160]
export interface DashboardStats {
    studentsEnrolled: number;
    activeCourses: number;
    quizzesCompleted: number;
    completionRatePct: number;
}

// Acesta este formatul pentru un curs din lista de preview [cite: 161-171]
export interface CoursePreview {
    courseId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    status: string; // backend-ul trimite "published" sau "draft" [cite: 141-143, 167]
    enrollmentCount: number;
    avgRating: number;
    updatedAt: string;
}

// Acesta este formatul pentru un quiz din tabel [cite: 173-182]
export interface QuizPreview {
    quizId: string;
    title: string;
    courseId: string;
    courseTitle: string;
    attemptsCount: number;
    avgScorePct: number;
    status: string; // "active" sau "draft" [cite: 181]
}

// Acesta este formatul pentru un comentariu [cite: 184-197]
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

// Acesta este obiectul TOTAL pe care îl primim când apelăm endpoint-ul "overview" [cite: 145, 154-199]
export interface DashboardOverviewResponse {
    stats: DashboardStats;
    coursesPreview: CoursePreview[];
    quizzesPreview: QuizPreview[];
    commentsPreview: CommentPreview[];
}