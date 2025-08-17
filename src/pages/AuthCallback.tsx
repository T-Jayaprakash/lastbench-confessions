import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Upload, User as UserIcon } from 'lucide-react';

interface College {
  id: string;
  name: string;
  domain: string;
}

interface Department {
  id: string;
  name: string;
  college_id: string;
}

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Form data
  const [anonymousName, setAnonymousName] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      checkUserProfile();
    }
  }, [user]);

  useEffect(() => {
    fetchColleges();
    // Generate random username
    if (!anonymousName) {
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      setAnonymousName(`Student#${randomNumber}`);
    }
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      fetchDepartments(selectedCollege);
    }
  }, [selectedCollege]);

  const checkUserProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (!profile) {
        setNeedsProfile(true);
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setNeedsProfile(true);
    }
  };

  const fetchColleges = async () => {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Error loading colleges');
    } else {
      setColleges(data || []);
    }
  };

  const fetchDepartments = async (collegeId: string) => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('college_id', collegeId)
      .order('name');
    
    if (error) {
      toast.error('Error loading departments');
    } else {
      setDepartments(data || []);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadProfilePicture = async (userId: string) => {
    if (!profilePicture) return null;

    const fileExt = profilePicture.name.split('.').pop();
    const fileName = `${userId}/profile.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, profilePicture, {
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) return;

      // Upload profile picture
      const profilePictureUrl = await uploadProfilePicture(user.id);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          anonymous_name: anonymousName,
          college_id: selectedCollege,
          department_id: selectedDepartment,
          profile_picture_url: profilePictureUrl
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast.error('Profile setup failed');
      } else {
        toast.success('Profile created! Welcome to Lastbench!');
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
          <p className="text-muted-foreground">Please wait while we complete your sign-in.</p>
        </div>
      </div>
    );
  }

  if (!needsProfile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
          <p className="text-muted-foreground">Taking you to your feed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Complete Your Profile
          </CardTitle>
          <p className="text-muted-foreground">
            Set up your anonymous college profile
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            {/* College Selection */}
            <div className="space-y-2">
              <Label>Select Your College</Label>
              <RadioGroup 
                value={selectedCollege} 
                onValueChange={setSelectedCollege}
                className="grid grid-cols-1 gap-2"
              >
                {colleges.map((college) => (
                  <div key={college.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={college.id} id={college.id} />
                    <Label htmlFor={college.id} className="text-sm">
                      {college.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Department Selection */}
            {selectedCollege && (
              <div className="space-y-2">
                <Label>Select Your Department</Label>
                <RadioGroup 
                  value={selectedDepartment} 
                  onValueChange={setSelectedDepartment}
                  className="grid grid-cols-1 gap-2"
                >
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={dept.id} id={dept.id} />
                      <Label htmlFor={dept.id} className="text-sm">
                        {dept.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Anonymous Name */}
            <div className="space-y-2">
              <Label htmlFor="anonymousName">Anonymous Name</Label>
              <Input
                id="anonymousName"
                type="text"
                placeholder="e.g., Student#876"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                You can change this anytime later
              </p>
            </div>

            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <Label>Profile Picture (Optional)</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </Button>
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !selectedCollege || !selectedDepartment || !anonymousName}
            >
              {loading ? 'Setting up...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;