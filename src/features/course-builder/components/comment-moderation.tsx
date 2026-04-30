import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MessageSquare,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Reply,
} from "lucide-react";
import type { Comment } from "@/lib/course-types";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

interface CommentModerationProps {
  comments: Comment[];
  onUpdateComment: (commentId: string, status: Comment["status"]) => void;
  onDeleteComment: (commentId: string) => void;
}

export function CommentModeration({
  comments,
  onUpdateComment,
  onDeleteComment,
}: CommentModerationProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const pendingComments = comments.filter((c) => c.status === "pending");
  const approvedComments = comments.filter((c) => c.status === "approved");
  const rejectedComments = comments.filter((c) => c.status === "rejected");

  const handleDelete = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      onDeleteComment(commentToDelete);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const renderComment = (comment: Comment, showActions: boolean = true) => (
    <div
      key={comment.id}
      className="p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl border border-border space-y-2 sm:space-y-3"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
          <AvatarImage src={comment.userAvatar} alt={comment.userName} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs sm:text-sm">
            {comment.userName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-medium text-xs sm:text-sm">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: ro,
              })}
            </span>
          </div>
          <Badge
            variant="secondary"
            className={`mt-1 text-xs ${
              comment.status === "pending"
                ? "bg-amber-100 text-amber-800"
                : comment.status === "approved"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {comment.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
            {comment.status === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {comment.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
            {comment.status === "pending"
              ? "În așteptare"
              : comment.status === "approved"
              ? "Aprobat"
              : "Respins"}
          </Badge>
          <p className="text-xs sm:text-sm mt-1.5 sm:mt-2 text-foreground/90">{comment.content}</p>
        </div>
      </div>

      {showActions && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 ml-10 sm:ml-13">
          {comment.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs sm:text-sm text-green-700 hover:text-green-800 hover:bg-green-50 h-7 sm:h-8 px-2 sm:px-3"
                onClick={() => onUpdateComment(comment.id, "approved")}
              >
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Aprobă
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs sm:text-sm text-red-700 hover:text-red-800 hover:bg-red-50 h-7 sm:h-8 px-2 sm:px-3"
                onClick={() => onUpdateComment(comment.id, "rejected")}
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Respinge
              </Button>
            </>
          )}
          {comment.status !== "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              onClick={() => onUpdateComment(comment.id, "pending")}
            >
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Marchează ca În Așteptare</span>
              <span className="sm:hidden">Pending</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => handleDelete(comment.id)}
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-13 pl-4 border-l-2 border-border space-y-3 mt-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={reply.userAvatar} alt={reply.userName} />
                <AvatarFallback className="bg-secondary/40 text-sm">
                  {reply.userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{reply.userName}</span>
                  <Badge variant="outline" className="text-xs">
                    Profesor
                  </Badge>
                </div>
                <p className="text-sm mt-0.5 text-foreground/90">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Comentarii</span>
            {pendingComments.length > 0 && (
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs px-1.5">
                {pendingComments.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-4 sm:px-6">
          <SheetHeader>
            <SheetTitle className="font-serif text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Moderare Comentarii
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="pending" className="mt-4 sm:mt-6">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
              <TabsTrigger value="pending" className="gap-1 sm:gap-1.5 text-xs sm:text-sm py-2 px-1 sm:px-3">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden xs:inline">În Așteptare</span>
                <span className="xs:hidden">Pending</span>
                {pendingComments.length > 0 && (
                  <span className="text-xs bg-amber-500 text-white rounded-full px-1.5">
                    {pendingComments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-1 sm:gap-1.5 text-xs sm:text-sm py-2 px-1 sm:px-3">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden xs:inline">Aprobate</span>
                <span className="xs:hidden">OK</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-1 sm:gap-1.5 text-xs sm:text-sm py-2 px-1 sm:px-3">
                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden xs:inline">Respinse</span>
                <span className="xs:hidden">Nu</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4 space-y-3">
              {pendingComments.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Nu există comentarii în așteptare
                  </p>
                </div>
              ) : (
                pendingComments.map((comment) => renderComment(comment))
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-4 space-y-3">
              {approvedComments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Nu există comentarii aprobate
                  </p>
                </div>
              ) : (
                approvedComments.map((comment) => renderComment(comment))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-4 space-y-3">
              {rejectedComments.length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Nu există comentarii respinse
                  </p>
                </div>
              ) : (
                rejectedComments.map((comment) => renderComment(comment))
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge Comentariul</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi acest comentariu? Această acțiune nu
              poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
