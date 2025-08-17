-- Create storage policies for profile pictures
CREATE POLICY "Users can upload their own profile pictures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile pictures" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile pictures" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile pictures are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

-- Update posts RLS policy to show posts to all users in same college
DROP POLICY IF EXISTS "Users can view all posts in their college" ON public.posts;

CREATE POLICY "Users can view posts in their college" 
ON public.posts 
FOR SELECT 
USING (
  college_id IN (
    SELECT profiles.college_id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
  )
  OR 
  (
    NOT is_college_wide 
    AND department_id IN (
      SELECT profiles.department_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid()
    )
  )
);