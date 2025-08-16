import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  content: string;
  images?: string[];
  user_id: string;
  department_id?: string;
  college_id?: string;
  is_college_wide: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  anonymous_name?: string;
  department_name?: string;
  isLiked?: boolean;
}

export const usePosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPosts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          departments(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithLikes = data?.map(post => ({
        ...post,
        anonymous_name: 'Anonymous',
        department_name: post.departments?.name || 'Unknown Department',
        isLiked: false,
      })) || [];

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (
    content: string, 
    images: string[] = [], 
    isCollegeWide: boolean = false, 
    departmentId?: string
  ) => {
    if (!user) return;

    try {
      // Get user profile to determine college_id and department_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('college_id, department_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Error",
          description: "Please complete your profile first.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          images,
          college_id: profile.college_id,
          department_id: isCollegeWide ? null : (departmentId || profile.department_id),
          is_college_wide: isCollegeWide,
        });

      if (error) throw error;

      toast({
        title: "Posted successfully!",
        description: `Your post is now live ${isCollegeWide ? 'college-wide' : 'in your department'}!`,
      });

      // Reload posts to show the new one
      await loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: !p.isLiked,
              likes_count: p.isLiked ? p.likes_count - 1 : p.likes_count + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  return {
    posts,
    isLoading,
    loadPosts,
    createPost,
    toggleLike,
  };
};