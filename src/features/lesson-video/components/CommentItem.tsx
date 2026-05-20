import { useState } from "react";
import { ThumbsUp, Clock, CornerDownRight } from "lucide-react";
import type { StudentCommentDTO } from "../types";
import { lessonVideoService } from "../services/lesson-video.service";

interface ItemProps {
  comment: StudentCommentDTO;
  studentId: string;
  courseId: string;
  lectureId: string;
  onTimestampClick: (seconds: number) => void;
  onRefresh: () => void;
  activeCommentId: string | null;
  isReply?: boolean;
  parentAuthorName?: string;
}

export default function CommentItem({
                                      comment,
                                      studentId,
                                      courseId,
                                      lectureId,
                                      onTimestampClick,
                                      onRefresh,
                                      activeCommentId,
                                      isReply = false,
                                      parentAuthorName,
                                    }: ItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleLike = async () => {
    try {
      await lessonVideoService.toggleLike(studentId, comment.commentId);
    } catch (error) {
      console.error("Eroare la like:", error);
    }
    onRefresh();
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      await lessonVideoService.addComment(studentId, courseId, lectureId, {
        body: replyText.trim(),
        timestampSecs: comment.videoTimestamp ?? 0,
        videoTimestamp: comment.videoTimestamp ?? 0,
        parentCommentId: comment.commentId,
      });
      setReplyText("");
      setShowReply(false);
      onRefresh();
    } catch (error) {
      console.error("Eroare la postare reply:", error);
    }
  };

  return (
      <div
          className={`flex gap-3 sm:gap-4 transition-all ${activeCommentId === comment.commentId
              ? "bg-primary/5 ring-1 ring-primary/20 p-3 rounded-2xl"
              : "py-1"
          }`}
      >
        {/* Diminuăm vizual avatarul dacă este un răspuns secundar */}
        <div
            className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${comment.authorRole === "Profesor" ? "bg-primary" : "bg-secondary"
            } ${isReply ? "w-8 h-8 text-xs mt-1" : "w-10 h-10 text-sm"}`}
        >
          {comment.authorName.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 space-y-2">
          <div
              className={`bg-muted/20 p-4 rounded-2xl border ${comment.authorRole === "Profesor"
                  ? "rounded-tl-none border-primary/20"
                  : "border-border/50"
              }`}
          >
            <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
              <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-foreground">
                {comment.authorName}
              </span>

                {comment.authorRole === "Profesor" && (
                    <span className="px-2 py-0.5 bg-accent/30 text-foreground text-[10px] uppercase font-bold rounded-full tracking-wider">
                  PROFESOR
                </span>
                )}

                {/* Indicator grafic pentru a arăta cui îi este adresat răspunsul */}
                {isReply && parentAuthorName && (
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                  <CornerDownRight size={12} />
                      {parentAuthorName}
                </span>
                )}
              </div>

              <span className="text-xs text-muted-foreground">
              {comment.timeAgo}
            </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {comment.body}
            </p>

            {comment.videoTimestamp !== undefined && comment.videoTimestamp > 0 && (
                <button
                    type="button"
                    onClick={() => onTimestampClick(comment.videoTimestamp!)}
                    className="mt-3 flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md hover:bg-primary/20 transition-colors w-fit"
                >
                  <Clock size={12} /> {comment.videoTimestamp}s
                </button>
            )}
          </div>

          <div className="flex gap-4 ml-2 text-xs font-bold text-muted-foreground">
            <button
                type="button"
                onClick={() => void handleLike()}
                className={`flex items-center gap-1.5 hover:text-primary transition-colors ${comment.isLikedByMe ? "text-primary" : ""
                }`}
            >
              <ThumbsUp
                  size={14}
                  className={comment.isLikedByMe ? "fill-primary" : ""}
              />{" "}
              {comment.likeCount}
            </button>
            <button
                type="button"
                className={`hover:text-foreground transition-colors ${showReply ? "text-primary" : ""}`}
                onClick={() => setShowReply((prev) => !prev)}
            >
              Răspunde
            </button>
          </div>

          {showReply && (
              <div className="mt-3 space-y-2 bg-muted/10 p-3 rounded-xl border border-border/50">
            <textarea
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Răspunde lui ${comment.authorName}...`}
                className="w-full bg-card border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none h-20"
            />
                <div className="flex gap-2 justify-end">
                  <button
                      type="button"
                      onClick={() => setShowReply(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Anulează
                  </button>
                  <button
                      type="button"
                      onClick={() => { void handleSendReply(); }}
                      className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Trimite
                  </button>
                </div>
              </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 border-l-2 border-border/60 pl-3 sm:pl-5 space-y-4">
                {comment.replies.map((reply) => (
                    <CommentItem
                        key={reply.commentId}
                        comment={reply}
                        studentId={studentId}
                        courseId={courseId}
                        lectureId={lectureId}
                        onTimestampClick={onTimestampClick}
                        onRefresh={onRefresh}
                        activeCommentId={activeCommentId}
                        isReply={true}
                        parentAuthorName={comment.authorName}
                    />
                ))}
              </div>
          )}
        </div>
      </div>
  );
}