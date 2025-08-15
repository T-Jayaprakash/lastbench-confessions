import { useState } from "react";
import { Heart, MessageCircle, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PostCardProps {
  id: string;
  content: string;
  author: string;
  timeAgo: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  image?: string;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
}

export const PostCard = ({
  id,
  content,
  author,
  timeAgo,
  likes,
  comments,
  isLiked,
  image,
  onLike,
  onComment,
  onShare,
}: PostCardProps) => {
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <>
      <article className="bg-gradient-card shadow-card rounded-2xl p-4 mb-4 mx-4 transition-smooth hover:shadow-glow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-primary">
            <span className="text-white font-semibold text-sm">
              {author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{author}</p>
            <p className="text-muted-foreground text-sm">{timeAgo}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-foreground leading-relaxed">{content}</p>
        {image && (
          <div 
            className="mt-3 rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setShowFullImage(true)}
          >
            <img
              src={image}
              alt="Post content"
              className="w-full h-64 object-cover transition-smooth group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-smooth rounded-xl" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(id)}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-full transition-bounce tap-effect",
              isLiked 
                ? "text-red-500 hover:text-red-600" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart 
              size={18} 
              className={cn(isLiked && "fill-current")} 
            />
            <span className="text-sm font-medium">{likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment(id)}
            className="flex items-center space-x-2 px-3 py-2 rounded-full text-muted-foreground hover:text-foreground transition-bounce tap-effect"
          >
            <MessageCircle size={18} />
            <span className="text-sm font-medium">{comments}</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShare(id)}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-bounce tap-effect"
        >
          <Share size={18} />
        </Button>
      </div>
    </article>

    {/* Full Screen Image Modal */}
    {image && (
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-full h-full p-0 bg-black/95 border-0">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
            >
              <X size={24} />
            </Button>
            <img
              src={image}
              alt="Post content"
              className="max-w-full max-h-full object-contain"
              onClick={() => setShowFullImage(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};