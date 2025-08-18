import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';

export interface Profile {
  id: string;
  user_id: string;
  anonymous_name: string;
  profile_picture_url?: string;
  college_id: string;
  department_id: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImages, isUploading } = useImageUpload();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePicture = async (file: File) => {
    if (!user || !profile) return;

    try {
      const imageUrls = await uploadImages([file], user.id);
      if (imageUrls.length === 0) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          profile_picture_url: imageUrls[0],
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, profile_picture_url: imageUrls[0] } : null);

      toast({
        title: "Profile picture updated!",
        description: "Your profile picture has been changed.",
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  return {
    profile,
    isLoading,
    loadProfile,
    updateProfilePicture,
    isUploading,
  };
};