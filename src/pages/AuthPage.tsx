import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const AuthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [anonymousName, setAnonymousName] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchColleges();
    // Generate random username for signup
    if (!isLogin && !anonymousName) {
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      setAnonymousName(`Student#${randomNumber}`);
    }
  }, [isLogin]);

  useEffect(() => {
    if (selectedCollege) {
      fetchDepartments(selectedCollege);
    }
  }, [selectedCollege]);

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

  const validateEmail = (email: string) => {
    const selectedCollegeData = colleges.find(c => c.id === selectedCollege);
    if (!selectedCollegeData) return false;
    
    const domain = email.split('@')[1];
    return domain === selectedCollegeData.domain;
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast.error(`Google login error: ${error.message}`);
        console.error('Google auth error:', error);
      }
    } catch (error: any) {
      toast.error(`Google login failed: ${error.message}`);
      console.error('Google auth exception:', error);
    }
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
        }
      } else {
        // Validate college email
        if (!validateEmail(email)) {
          const selectedCollegeData = colleges.find(c => c.id === selectedCollege);
          toast.error(`Please use your ${selectedCollegeData?.name} email address`);
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          toast.error(error.message);
        } else if (data.user) {
          // Upload profile picture and create profile
          const profilePictureUrl = await uploadProfilePicture(data.user.id);
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              anonymous_name: anonymousName,
              college_id: selectedCollege,
              department_id: selectedDepartment,
              profile_picture_url: profilePictureUrl
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            toast.error('Account created but profile setup failed');
          } else {
            toast.success('Account created! Redirecting to home...');
            navigate('/');
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Join LASTBENCH'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to your anonymous account' : 'Create your anonymous college profile'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
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
              </>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {isLogin ? 'Email' : 'College Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={isLogin ? 'your.email@college.edu' : 'Enter your college email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {!isLogin && selectedCollege && (
                <p className="text-xs text-muted-foreground">
                  Use your {colleges.find(c => c.id === selectedCollege)?.name} email
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (!isLogin && (!selectedCollege || !selectedDepartment || !anonymousName))}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;