import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Pencil, Shield, UserCircle, AlertCircle } from "lucide-react";
import ProfileCompletion from "@/components/profile/ProfileCompletion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { recruiterAPI } from "@/lib/api";

const Profile = () => {
  const { toast } = useToast();
  const { user, updateUserProfile, updateProfileProgress } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.company_logo || null);
  const location = useLocation();
  const isNewUser = location.state?.isNewUser || user?.is_profile_complete === false;
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
 
  // Determine if user is coming directly after signup
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewCandidate: true,
    emailInterviewComplete: true,
    emailWeeklySummary: true,
    browserNewCandidate: true,
    browserInterviewComplete: true,
    smsInterviewComplete: false,
  });

  // Initialize profile data with actual user data
  const [profileData, setProfileData] = useState({
    name: user ? `${user.first_name} ${user.last_name}` : "",
    email: user?.email || "",
    company: user?.company_name || "",
    title: user?.title || "",
    phone: user?.phone || "",
    timezone: user?.timezone || "America/New_York",
    language: user?.language || "English",
  });

  // Initialize company settings with actual user data
  const [companySettings, setCompanySettings] = useState({
    companyName: user?.company_name || "",
    website: user?.website || "",
    industry: user?.industry || "Technology",
    size: user?.company_size || "51-200 employees",
    logo: profileImage,
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zip: user?.zip || "",
    country: user?.country || "United States",
  });

  // Add this near the top of the component with other state declarations
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch user details when component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const recruiterData = await recruiterAPI.verifyLogin();
        const userData = recruiterData.data;
        
        // Log the data to verify structure
        console.log('Recruiter Data:', userData);

        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          company: userData.company_name || '',
          title: userData.designation || '',
          phone: userData.phone || '',
          timezone: "America/New_York", // Default value since not in API
          language: "English", // Default value since not in API
        });
        setCompanySettings({
          companyName: userData.company_name || '',
          website: userData.website || '',
          industry: userData.industry || "Technology",
          size: userData.min_company_size && userData.max_company_size 
            ? `${userData.min_company_size}-${userData.max_company_size} employees`
            : "51-200 employees",
          logo: userData.company_logo || null,
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zip: userData.zip || '',
          country: userData.country || "United States",
        });
        setProfileImage(userData.company_logo || null);
        setHasCompletedProfile(true); // Assuming profile is complete if we have data
      } catch (error) {
        console.error("Failed to fetch recruiter details:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchUserDetails();
  }, []);

  // Separate useEffect for checking profile completion status
  useEffect(() => {
    const hasCompleted = localStorage.getItem('hasCompletedProfile');
    const progress = calculateProfileProgress();
    
    // Only update hasCompletedProfile if progress is 100%
    if (progress === 100 && hasCompleted === 'true') {
      setHasCompletedProfile(true);
    } else {
      setHasCompletedProfile(false);
    }
  }, [profileData, companySettings]);

  // Add this useEffect to handle initial edit mode state
  useEffect(() => {
    const hasCompleted = localStorage.getItem('hasCompletedProfile');
    // Start in view mode if profile is completed
    if (hasCompleted === 'true') {
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  }, []); // Only run once on component mount

  // Calculate profile completion percentage
  const calculateProfileProgress = () => {
    let progress = 0;
    let totalFields = 0;
    let completedFields = 0;

    // Basic info (required)
    totalFields += 4;
    if (profileData.name && profileData.name.trim()) completedFields++;
    if (profileData.email && profileData.email.trim()) completedFields++;
    if (profileData.title && profileData.title.trim()) completedFields++;
    if (profileData.phone && profileData.phone.trim()) completedFields++;

    // Company info (required)
    totalFields += 5;
    if (companySettings.companyName && companySettings.companyName.trim()) completedFields++;
    if (companySettings.website && companySettings.website.trim()) completedFields++;
    if (companySettings.industry && companySettings.industry.trim()) completedFields++;
    if (companySettings.address && companySettings.address.trim()) completedFields++;
    if (companySettings.city && companySettings.city.trim() && 
        companySettings.state && companySettings.state.trim() && 
        companySettings.zip && companySettings.zip.trim()) completedFields++;

    // Additional fields (optional but contribute to progress)
    totalFields += 2;
    if (profileData.timezone && profileData.timezone !== "America/New_York") completedFields++;
    if (profileData.language && profileData.language !== "English") completedFields++;

    // Calculate percentage
    progress = Math.round((completedFields / totalFields) * 100);
    
    // Ensure profile is marked as complete if all required fields are filled
    const requiredFieldsComplete = 
      profileData.name && profileData.name.trim() &&
      profileData.email && profileData.email.trim() &&
      profileData.title && profileData.title.trim() &&
      profileData.phone && profileData.phone.trim() &&
      companySettings.companyName && companySettings.companyName.trim() &&
      companySettings.website && companySettings.website.trim() &&
      companySettings.industry && companySettings.industry.trim() &&
      companySettings.address && companySettings.address.trim() &&
      companySettings.city && companySettings.city.trim() &&
      companySettings.state && companySettings.state.trim() &&
      companySettings.zip && companySettings.zip.trim();

    if (requiredFieldsComplete) {
      progress = 100;
    }

    return progress;
  };

  // Calculate and update profile progress when component mounts or data changes
  useEffect(() => {
    const updateProgress = async () => {
      if (user) {
        const progress = calculateProfileProgress();
        if (progress !== user.profileProgress) {
          await updateProfileProgress(progress);
        }
      }
    };

    updateProgress();
  }, [user, profileData, companySettings]);

  useEffect(() => {
   // Check for query param indicating first login
    const isNew = searchParams.get("new") === "true";
   if (isNew) {
      setIsFirstLogin(true);
       // Remove the query param to avoid showing the message on refresh
       const newParams = new URLSearchParams(searchParams);
       newParams.delete("new");
       setSearchParams(newParams);
     }
 
     // Set active tab based on URL parameter
     const tabParam = searchParams.get("tab");
     if (tabParam && ["profile", "company", "notifications"].includes(tabParam)) {
       setActiveTab(tabParam);
     }
   }, [searchParams, setSearchParams]);

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    
    try {
      // Split name into first_name and last_name
      const nameParts = profileData.name.split(" ");
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(" ");
      
      await updateUserProfile({
        first_name,
        last_name,
        email: profileData.email,
        title: profileData.title,
        phone: profileData.phone,
        timezone: profileData.timezone,
        language: profileData.language,
        is_profile_complete: true,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });

      // If profile is complete, exit edit mode
      if (calculateProfileProgress() === 100) {
        setIsEditMode(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyUpdate = async () => {
    setIsLoading(true);
    
    try {
      await updateUserProfile({
        company_name: companySettings.companyName,
        website: companySettings.website,
        industry: companySettings.industry,
        company_size: companySettings.size,
        address: companySettings.address,
        city: companySettings.city,
        state: companySettings.state,
        zip: companySettings.zip,
        country: companySettings.country,
        is_profile_complete: true,
      });
      
      toast({
        title: "Company settings updated",
        description: "Your company information has been updated successfully.",
      });

      // If profile is complete, exit edit mode
      if (calculateProfileProgress() === 100) {
        setIsEditMode(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      });
    }, 1000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
          setCompanySettings({
            ...companySettings,
            logo: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = profileData.name
    ? profileData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, company information, and notification preferences
            </p>
          </div>
        </div>

        {isFirstLogin && (
           <div className="mb-6">
             <Card className="border-brand bg-brand/5">
               <CardContent className="pt-6">
                 <h3 className="text-lg font-semibold mb-2">Welcome to EduDiagno!</h3>
                 <p className="text-muted-foreground">
                   Please complete your profile to get the most out of our platform. This will help us provide you with a better experience.
                 </p>
               </CardContent>
             </Card>
           </div>
         )}
 
         <ProfileCompletion />
 
         <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile">
              <UserCircle className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="company">
              <svg 
                className="mr-2 h-4 w-4" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                />
              </svg> Company
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <svg 
                className="mr-2 h-4 w-4" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg> Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={hasCompletedProfile && !isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={hasCompletedProfile && !isEditMode}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input 
                        id="title" 
                        value={profileData.title}
                        onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                        disabled={hasCompletedProfile && !isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={hasCompletedProfile && !isEditMode}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select 
                        id="timezone" 
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                        disabled={hasCompletedProfile && !isEditMode}
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Preferred Language</Label>
                      <select 
                        id="language" 
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={profileData.language}
                        onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                        disabled={hasCompletedProfile && !isEditMode}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {hasCompletedProfile ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      {isEditMode ? "Cancel" : "Edit Profile"}
                    </Button>
                  ) : null}
                  {(!hasCompletedProfile || isEditMode) && (
                    <Button 
                      onClick={handleProfileUpdate} 
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Manage your profile picture</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={profileImage || undefined} alt={profileData.name} />
                        <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0">
                        <Label
                          htmlFor="avatar-upload"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Upload avatar</span>
                        </Label>
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Upload a profile picture or company logo.
                      <br />
                      JPG, GIF or PNG. Max size 1MB.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Enable Two-Factor Auth
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input 
                        id="company-name" 
                        value={companySettings.companyName}
                        onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                        disabled={hasCompletedProfile && !isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        value={companySettings.website}
                        onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                        disabled={hasCompletedProfile && !isEditMode}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <select 
                          id="industry" 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={companySettings.industry}
                          onChange={(e) => setCompanySettings({...companySettings, industry: e.target.value})}
                          disabled={hasCompletedProfile && !isEditMode}
                        >
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                          <option value="Retail">Retail</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Company Size</Label>
                        <select 
                          id="size" 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={companySettings.size}
                          onChange={(e) => setCompanySettings({...companySettings, size: e.target.value})}
                          disabled={hasCompletedProfile && !isEditMode}
                        >
                          <option value="1-10 employees">1-10 employees</option>
                          <option value="11-50 employees">11-50 employees</option>
                          <option value="51-200 employees">51-200 employees</option>
                          <option value="201-500 employees">201-500 employees</option>
                          <option value="501-1000 employees">501-1000 employees</option>
                          <option value="1000+ employees">1000+ employees</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="mb-2">Company Logo</Label>
                    <div className="border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 h-[200px] relative">
                      {companySettings.logo ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img 
                            src={companySettings.logo} 
                            alt="Company logo" 
                            className="max-h-full max-w-full object-contain"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute bottom-0 right-0"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Change
                          </Button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="w-12 h-12 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 mb-2">
                            Drag and drop your logo here, or
                          </p>
                          <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                            Browse Files
                          </Button>
                        </>
                      )}
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Recommended size: 200x200px. Max file size: 1MB.
                      <br />
                      Your logo will appear on interview pages and reports.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Company Address</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input 
                        id="address" 
                        value={companySettings.address}
                        onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                        disabled={hasCompletedProfile && !isEditMode}
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          value={companySettings.city}
                          onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
                          disabled={hasCompletedProfile && !isEditMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input 
                          id="state" 
                          value={companySettings.state}
                          onChange={(e) => setCompanySettings({...companySettings, state: e.target.value})}
                          disabled={hasCompletedProfile && !isEditMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">Zip/Postal Code</Label>
                        <Input 
                          id="zip" 
                          value={companySettings.zip}
                          onChange={(e) => setCompanySettings({...companySettings, zip: e.target.value})}
                          disabled={hasCompletedProfile && !isEditMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <select 
                          id="country" 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={companySettings.country}
                          onChange={(e) => setCompanySettings({...companySettings, country: e.target.value})}
                          disabled={hasCompletedProfile && !isEditMode}
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {hasCompletedProfile ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditMode(!isEditMode)}
                  >
                    {isEditMode ? "Cancel" : "Edit Company Info"}
                  </Button>
                ) : null}
                {(!hasCompletedProfile || isEditMode) && (
                  <Button 
                    onClick={handleCompanyUpdate} 
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Company Information"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-new-candidate" className="text-base">
                          New Candidate Applications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive an email when a new candidate applies to your job
                        </p>
                      </div>
                      <Switch 
                        id="email-new-candidate" 
                        checked={notificationSettings.emailNewCandidate}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, emailNewCandidate: checked})
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-interview-complete" className="text-base">
                          Interview Completion
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive an email when a candidate completes an AI interview
                        </p>
                      </div>
                      <Switch 
                        id="email-interview-complete" 
                        checked={notificationSettings.emailInterviewComplete}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, emailInterviewComplete: checked})
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-weekly-summary" className="text-base">
                          Weekly Summary
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a weekly summary of all hiring activity
                        </p>
                      </div>
                      <Switch 
                        id="email-weekly-summary" 
                        checked={notificationSettings.emailWeeklySummary}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, emailWeeklySummary: checked})
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Browser Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="browser-new-candidate" className="text-base">
                          New Candidate Applications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a browser notification when a new candidate applies
                        </p>
                      </div>
                      <Switch 
                        id="browser-new-candidate" 
                        checked={notificationSettings.browserNewCandidate}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, browserNewCandidate: checked})
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="browser-interview-complete" className="text-base">
                          Interview Completion
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a browser notification when an interview is completed
                        </p>
                      </div>
                      <Switch 
                        id="browser-interview-complete" 
                        checked={notificationSettings.browserInterviewComplete}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, browserInterviewComplete: checked})
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">SMS Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-interview-complete" className="text-base">
                          Interview Completion
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive an SMS when a high-priority candidate completes an interview
                        </p>
                      </div>
                      <Switch 
                        id="sms-interview-complete" 
                        checked={notificationSettings.smsInterviewComplete}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, smsInterviewComplete: checked})
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleNotificationUpdate} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Notification Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
