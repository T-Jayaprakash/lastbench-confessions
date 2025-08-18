import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
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

export const useComments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = async (postId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithLikes = data?.map(comment => ({
        ...comment,
        anonymous_name: 'Anonymous',
        isLiked: false,
      })) || [];

      setComments(prev => ({
        ...prev,
        [postId]: commentsWithLikes
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createComment = async (postId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        });

      if (error) throw error;

      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });

      // Reload comments for this post
      await loadComments(postId);
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  const toggleCommentLike = async (commentId: string, postId: string) => {
    if (!user) return;

    try {
      const comment = comments[postId]?.find(c => c.id === commentId);
      if (!comment) return;

      if (comment.isLiked) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      // Update local state
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId]?.map(c => 
          c.id === commentId 
            ? { 
                ...c, 
                isLiked: !c.isLiked,
                likes_count: c.isLiked ? c.likes_count - 1 : c.likes_count + 1
              }
            : c
        ) || []
      }));
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast({
        title: "Error",
        description: "Failed to update comment like.",
        variant: "destructive",
      });
    }
  };

  return {
    comments,
    isLoading,
    loadComments,
    createComment,
    toggleCommentLike,
  };
};