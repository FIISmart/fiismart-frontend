import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MessageSquare,
  Clock,
  Send,
  ChevronDown,
} from "lucide-react";
import type { CourseComment } from "../types";
import { lessonVideoService } from "../services/lesson-video.service";
import CommentItem from "./CommentItem";

interface Props {
  studentId: string;
  courseId: string;
  lectureId: string;
  currentTime: number;
  onSeek: (time: number, id: string) => void;
  activeCommentId: string | null;
  onCommentsLoaded: (comments: CourseComment[]) => void;
  onRefreshComments: () => Promise<void>;
}

export default function CommentsSection({
                                          studentId,
                                          courseId,
                                          lectureId,
                                          currentTime,
                                          onSeek,
                                          activeCommentId,
                                          onCommentsLoaded,
                                          onRefreshComments,
                                        }: Props) {
  const [comments, setComments] = useState<CourseComment[]>([]);
  const [text, setText] = useState("");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);

  function parseTimestamp(val: unknown): number {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      if (/^[0-9]+$/.test(val)) return parseInt(val, 10);
      if (val.includes(":")) {
        const parts = val.split(":").map((p) => parseInt(p, 10));
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
      }
      const n = Number(val);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  const fetchComments = useCallback(async () => {
    if (!lectureId) return;
    try {
      const data = await lessonVideoService.getComments(
          studentId,
          courseId,
          lectureId,
          "recent"
      );

      const normalizeComment = (c: any): CourseComment => {
        const raw = c.timestampSecs ?? c.videoTimestamp ?? c.positionSecs ?? c.timestamp ?? 0;
        const parsedTime = parseTimestamp(raw);
        return {
          ...c,
          timestampSecs: parsedTime,
          videoTimestamp: parsedTime,
          isLikedByMe: c.isLikedByMe ?? c.likedByMe,
          replies: c.replies ? c.replies.map(normalizeComment) : [],
        };
      };

      const normalized = (data ?? []).map(normalizeComment);
      setComments(normalized);

      setTimeout(() => {
        onCommentsLoaded(normalized);
      }, 0);
    } catch (error) {
      console.error("Eroare la fetch comentarii:", error);
    }
  }, [studentId, courseId, lectureId, onCommentsLoaded]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!text.trim()) return;
    try {
      const payload = {
        body: text,
        timestampSecs: selectedTimestamp ?? 0,
        videoTimestamp: selectedTimestamp ?? 0,
      };
      const createdComment = await lessonVideoService.addComment(
          studentId,
          courseId,
          lectureId,
          payload
      );

      setText("");
      setSelectedTimestamp(null);

      void fetchComments();
      void onRefreshComments();
    } catch (error) {
      console.error("Eroare la postare:", error);
    }
  };

  const handleAddTimestamp = () => {
    setSelectedTimestamp((prev) =>
        prev === null ? Math.floor(currentTime) : null
    );
  };

  const displayedComments = useMemo(() => {
    let sorted = [...comments];

    if (sortBy === "popular") {
      sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else if (sortBy === "oldest") {
      sorted.reverse();
    }

    if (activeCommentId) {
      const activeIndex = sorted.findIndex((c) => c.commentId === activeCommentId);
      if (activeIndex > 0) {
        const [activeComment] = sorted.splice(activeIndex, 1);
        return [activeComment, ...sorted];
      }
    }

    return sorted;
  }, [comments, activeCommentId, sortBy]);

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
            <MessageSquare size={24} className="text-primary" />
            Discuții & Întrebări
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              <span>Sortează:</span>
              <select
                  className="bg-transparent focus:outline-none cursor-pointer text-foreground font-bold"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Cele mai vechi</option>
                <option value="oldest">Cele mai noi</option>
                <option value="popular">Cele mai apreciate</option>
              </select>
              <ChevronDown size={14} />
            </div>

            <span className="px-3 py-1 bg-accent/30 text-foreground text-sm font-medium rounded-full">
            {comments.length} discuții principale
          </span>
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-xl border border-border">
        <textarea
            placeholder="Pune o întrebare sau lasă un comentariu..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none h-24 mb-3"
        />

          <div className="flex justify-between items-center">
            <button
                type="button"
                onClick={handleAddTimestamp}
                className={`flex items-center gap-2 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg border ${selectedTimestamp !== null
                    ? "text-white border-transparent bg-secondary"
                    : "text-muted-foreground hover:text-foreground bg-card border-border"
                }`}
            >
              <Clock size={14} />
              {selectedTimestamp !== null
                  ? `Timestamp: ${selectedTimestamp}s`
                  : `Adaugă timestamp (${Math.floor(currentTime)}s)`}
            </button>

            <button
                type="button"
                onClick={() => {
                  void handleAddComment();
                }}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:opacity-90"
            >
              <Send size={16} />
              Postează
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          {displayedComments.map((comment) => (
              <CommentItem
                  key={comment.commentId}
                  // @ts-expect-error Mici diferențe structurale între DTO-uri interschimbabile recursiv
                  comment={comment}
                  studentId={studentId}
                  courseId={courseId}
                  lectureId={lectureId}
                  onTimestampClick={(time) => onSeek(time, comment.commentId)}
                  onRefresh={fetchComments}
                  activeCommentId={activeCommentId}
              />
          ))}
        </div>
      </div>
  );
}