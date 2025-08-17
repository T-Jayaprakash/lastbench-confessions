import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ImagePlus, Send, X, Globe, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { cn } from "@/lib/utils";

interface CreatePostProps {
  onCancel: () => void;
}

export const CreatePost = ({ onCancel }: CreatePostProps) => {
  const { user } = useAuth();
  const { createPost, isUploading } = usePosts();
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isCollegeWide, setIsCollegeWide] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, departments(id, name)')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        setUserProfile(profile);
        // Load departments from the same college
        const { data: depts } = await supabase
          .from('departments')
          .select('*')
          .eq('college_id', profile.college_id)
          .order('name');
        
        setDepartments(depts || []);
        setSelectedDepartment(profile.department_id);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };
  
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

  const handleSubmit = async () => {
    if (content.trim()) {
      await createPost(
        content, 
        selectedImages.length ? selectedImages : undefined,
        isCollegeWide,
        isCollegeWide ? undefined : selectedDepartment
      );
      setContent("");
      setSelectedImages([]);
      setImagePreviews([]);
      setIsCollegeWide(false);
      setSelectedDepartment(userProfile?.department_id || "");
      onCancel();
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

          {/* Audience Selection */}
          <div className="space-y-3 p-4 bg-background/30 rounded-xl border border-border/50">
            <Label className="text-foreground font-medium">Post Audience</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={isCollegeWide ? "default" : "outline"}
                onClick={() => setIsCollegeWide(true)}
                className={cn(
                  "flex flex-col items-center space-y-2 h-auto py-3",
                  isCollegeWide && "bg-gradient-primary text-white"
                )}
              >
                <Globe size={20} />
                <span className="text-sm">Entire College</span>
              </Button>
              
              <Button
                variant={!isCollegeWide ? "default" : "outline"}
                onClick={() => setIsCollegeWide(false)}
                className={cn(
                  "flex flex-col items-center space-y-2 h-auto py-3",
                  !isCollegeWide && "bg-gradient-primary text-white"
                )}
              >
                <Building2 size={20} />
                <span className="text-sm">My Department</span>
              </Button>
            </div>

            {!isCollegeWide && departments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Select Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Choose department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              disabled={!content.trim() || isUploading}
              className="bg-gradient-primary hover:opacity-90 text-white px-6 rounded-full shadow-primary transition-bounce tap-effect disabled:opacity-50"
            >
              <Send size={18} className="mr-2" />
              {isUploading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};