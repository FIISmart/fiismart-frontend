import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MessageSquare,
  Clock,
  Send,
  ChevronDown,
  ThumbsUp,
} from "lucide-react";
import type { CourseComment } from "../types";
import { lessonVideoService } from "../services/lesson-video.service";

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
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(
    null
  );

  const fetchComments = useCallback(async () => {
    if (!lectureId || lectureId.length !== 24) return;
    try {
      const data = await lessonVideoService.getComments(
        studentId,
        courseId,
        lectureId,
        sortBy
      );
      setComments(data);

      setTimeout(() => {
        onCommentsLoaded(data);
      }, 0);
    } catch (error) {
      console.error("Eroare la fetch comentarii:", error);
    }
  }, [studentId, courseId, lectureId, sortBy, onCommentsLoaded]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!text.trim()) return;
    try {
      await lessonVideoService.addComment(studentId, courseId, lectureId, {
        body: text,
        timestampSecs: selectedTimestamp ?? 0,
        videoTimestamp: selectedTimestamp ?? 0,
      });
      setText("");
      setSelectedTimestamp(null);
      await fetchComments();
      void onRefreshComments();
    } catch (error) {
      console.error("Eroare la postare:", error);
    }
  };

  const handleToggleLike = async (
    commentId: string,
    currentIsLiked: boolean
  ) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.commentId === commentId) {
          return {
            ...c,
            likedByMe: !currentIsLiked,
            likeCount: currentIsLiked
              ? Math.max(0, c.likeCount - 1)
              : c.likeCount + 1,
          };
        }
        return c;
      })
    );

    try {
      await lessonVideoService.toggleLike(studentId, commentId);
    } catch (error) {
      console.error("Eroare la like:", error);
    }
  };

  const handleAddTimestamp = () => {
    setSelectedTimestamp((prev) =>
      prev === null ? Math.floor(currentTime) : null
    );
  };

  const displayedComments = useMemo(() => {
    if (!activeCommentId) return comments;
    const activeIndex = comments.findIndex(
      (c) => c.commentId === activeCommentId
    );

    if (activeIndex > 0) {
      const newCommentsList = [...comments];
      const [activeComment] = newCommentsList.splice(activeIndex, 1);
      return [activeComment, ...newCommentsList];
    }
    return comments;
  }, [comments, activeCommentId]);

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
              <option value="recent">Cele mai noi</option>
              <option value="oldest">Cele mai vechi</option>
              <option value="popular">Cele mai apreciate</option>
            </select>
            <ChevronDown size={14} />
          </div>

          <span className="px-3 py-1 bg-accent/30 text-foreground text-sm font-medium rounded-full">
            {comments.length} comentarii
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
            className={`flex items-center gap-2 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg border ${
              selectedTimestamp !== null
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
          <div
            key={comment.commentId}
            className={`flex gap-4 p-3 rounded-xl transition-all ${
              activeCommentId === comment.commentId
                ? "bg-secondary/20 border border-secondary"
                : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
                comment.authorRole === "Profesor"
                  ? "bg-primary"
                  : "bg-secondary"
              }`}
            >
              {comment.authorName.substring(0, 2).toUpperCase()}
            </div>

            <div className="flex-1">
              <div
                className={`p-4 rounded-2xl border ${
                  activeCommentId === comment.commentId
                    ? "bg-card border-secondary"
                    : "bg-muted/20 border-border/50"
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-sm">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {comment.timeAgo}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{comment.body}</p>

                <div className="flex items-center gap-3 mt-3">
                  {comment.timestampSecs !== undefined &&
                  comment.timestampSecs > 0 ? (
                    <div
                      onClick={() =>
                        onSeek(
                          comment.timestampSecs as number,
                          comment.commentId
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-secondary/30 text-secondary-foreground cursor-pointer hover:bg-secondary/50 transition-colors"
                    >
                      <Clock size={12} />
                      {comment.timestampSecs}s
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleLike(comment.commentId, comment.likedByMe)
                    }
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                      comment.likedByMe
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <ThumbsUp
                      size={14}
                      fill={comment.likedByMe ? "currentColor" : "none"}
                    />
                    <span>
                      {comment.likeCount > 0 ? comment.likeCount : "Apreciază"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
