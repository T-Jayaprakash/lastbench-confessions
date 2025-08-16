import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatePostProps {
  onPost: (content: string, images?: File[]) => void;
  onCancel: () => void;
}

export const CreatePost = ({ onPost, onCancel }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length) {
      setSelectedImages(prev => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onPost(content, selectedImages.length ? selectedImages : undefined);
      setContent("");
      setSelectedImages([]);
      setImagePreviews([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-glow border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="text-foreground">Create Post</span>
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
            placeholder="Share something with your campus..."
            className="min-h-32 resize-none bg-background/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
            maxLength={500}
          />
          
          <div className="text-right text-sm text-muted-foreground">
            {content.length}/500
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-2 rounded-full"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <label htmlFor="image-upload">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center space-x-2 rounded-full tap-effect",
                    selectedImages.length > 0 && "text-primary"
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