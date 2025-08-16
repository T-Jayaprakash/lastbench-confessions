import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit3, LogOut, Upload, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  user_id: string;
  anonymous_name: string;
  college_id: string;
  department_id: string;
  profile_picture_url?: string;
}

interface College {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  college_id: string;
}

export const SettingsView = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    anonymous_name: "",
    college_id: "",
    department_id: "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadColleges();
      loadDepartments();
    }
  }, [user]);

  useEffect(() => {
    if (formData.college_id) {
      const filtered = departments.filter(dept => dept.college_id === formData.college_id);
      setFilteredDepartments(filtered);
      if (formData.department_id && !filtered.find(d => d.id === formData.department_id)) {
        setFormData(prev => ({ ...prev, department_id: "" }));
      }
    } else {
      setFilteredDepartments([]);
    }
  }, [formData.college_id, departments]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          anonymous_name: data.anonymous_name || "",
          college_id: data.college_id || "",
          department_id: data.department_id || "",
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    }
  };

  const loadColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name');

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error loading colleges:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: data.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, profile_picture_url: data.publicUrl } : null);
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData = {
        user_id: user.id,
        anonymous_name: formData.anonymous_name,
        college_id: formData.college_id,
        department_id: formData.department_id,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) throw error;

      await loadProfile();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 pb-20 space-y-6 animate-fade-in">
      {/* Profile Picture Section */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader className="text-center pb-4">
          <div className="relative mx-auto">
            <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20">
              <AvatarImage src={profile?.profile_picture_url} alt="Profile" />
              <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                <User size={32} />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isLoading}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full p-2 shadow-primary"
                  asChild
                >
                  <span>
                    <Upload size={16} />
                  </span>
                </Button>
              </label>
            </div>
          </div>
          <CardTitle className="text-foreground mt-4">
            {profile?.anonymous_name || "Anonymous User"}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Profile Edit Section */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-foreground">Profile Settings</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-full hover:bg-secondary"
            >
              <Edit3 size={16} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="anonymous_name">Anonymous Name</Label>
                <Input
                  id="anonymous_name"
                  value={formData.anonymous_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, anonymous_name: e.target.value }))}
                  placeholder="Enter your anonymous name"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Select
                  value={formData.college_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, college_id: value }))}
                >
                  <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}
                  disabled={!formData.college_id}
                >
                  <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !formData.anonymous_name || !formData.college_id || !formData.department_id}
                  className="flex-1 bg-gradient-primary text-white"
                >
                  <Save size={16} className="mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="px-4"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Anonymous Name</Label>
                <p className="text-foreground font-medium">{profile?.anonymous_name || "Not set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">College</Label>
                <p className="text-foreground font-medium">
                  {colleges.find(c => c.id === profile?.college_id)?.name || "Not set"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Department</Label>
                <p className="text-foreground font-medium">
                  {departments.find(d => d.id === profile?.department_id)?.name || "Not set"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardContent className="pt-6">
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full flex items-center justify-center space-x-2"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">Anonymous & Safe</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your identity is completely anonymous. Posts cannot be traced back to you. 
              Share freely and safely with your college community.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};