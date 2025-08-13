import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatePostProps {
  onPost: (content: string, image?: File) => void;
  onCancel: () => void;
}

export const CreatePost = ({ onPost, onCancel }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onPost(content, selectedImage || undefined);
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-glow border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="text-foreground">Share Gossip</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-secondary"
            >
              <X size={20} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's the gossip? Share anonymously..."
            className="min-h-32 resize-none bg-background/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
            maxLength={500}
          />
          
          <div className="text-right text-sm text-muted-foreground">
            {content.length}/500
          </div>

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 rounded-full"
              >
                <X size={16} />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <label htmlFor="image-upload">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center space-x-2 rounded-full tap-effect",
                    selectedImage && "text-primary"
                  )}
                  asChild
                >
                  <span>
                    <ImagePlus size={20} />
                    <span>Photo</span>
                  </span>
                </Button>
              </label>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="bg-gradient-primary hover:opacity-90 text-white px-6 rounded-full shadow-primary transition-bounce tap-effect disabled:opacity-50"
            >
              <Send size={18} className="mr-2" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};