import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  anonymous_name?: string;
  isLiked?: boolean;
}

interface CommentsModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
}

export const CommentsModal = ({
  postId,
  isOpen,
  onClose,
  comments,
  onAddComment,
  onLikeComment
}: CommentsModalProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(postId, newComment);
      setNewComment("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-gradient-card rounded-t-3xl shadow-glow border-t border-border animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">Comments</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Comments List */}
        <ScrollArea className="h-96 p-4">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div 
                  key={comment.id}
                  className="bg-background/50 rounded-xl p-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-primary flex-shrink-0">
                      <span className="text-white font-semibold text-xs">
                        A
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground text-sm">{comment.anonymous_name || 'Anonymous'}</span>
                        <span className="text-muted-foreground text-xs">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">{comment.content}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLikeComment(comment.id)}
                          className={cn(
                            "flex items-center space-x-1 px-2 py-1 h-auto rounded-full transition-bounce tap-effect",
                            comment.isLiked 
                              ? "text-red-500 hover:text-red-600" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Heart 
                            size={14} 
                            className={cn(comment.isLiked && "fill-current")} 
                          />
                          <span className="text-xs">{comment.likes_count}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary animate-bounce-in">
                <Send size={24} className="text-white" />
              </div>
              <p className="text-muted-foreground">No comments yet. Be the first!</p>
            </div>
          )}
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-primary flex-shrink-0">
              <span className="text-white font-semibold text-xs">S</span>
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-background/50 border-border/50 focus:border-primary rounded-full px-4"
                maxLength={200}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                size="sm"
                className="bg-gradient-primary hover:opacity-90 text-white p-2 rounded-full shadow-primary transition-bounce tap-effect disabled:opacity-50"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};