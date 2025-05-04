import { useState, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
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
import { useUser } from "@/context/UserContext";
import { Pencil, Shield, UserCircle, AlertCircle, Save, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { recruiterAPI } from "@/lib/api";
import { RecruiterData } from "@/types/recruiter";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  designation: string;
  company_name: string;
  website: string;
  industry: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const Profile = () => {
  const { toast } = useToast();
  const { recruiter, setRecruiter } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(recruiter?.companyLogo || null);
  const location = useLocation();
  const navigate = useNavigate();
  const [emailVerified, setEmailVerified] = useState(false);
  const isNewUser = location.state?.isNewUser || recruiter?.is_profile_complete === false;
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    designation: "",
    company_name: "",
    website: "",
    industry: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  // Fetch user details when component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const recruiterData = await recruiterAPI.verifyLogin();
        const userData = recruiterData.data;

        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          designation: userData.designation || '',
          company_name: userData.company_name || '',
          website: userData.website || '',
          industry: userData.industry || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zip: userData.zip || '',
          country: userData.country || '',
        });
        setEmailVerified(userData.email_verified || false);
        setProfileImage(userData.companyLogo || null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await recruiterAPI.updateRecruiter(profileData);
      if (setRecruiter && recruiter) {
        setRecruiter({
          ...recruiter,
          ...response.data
        });
      }
      setIsEditMode(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form data to current user data
    const fetchUserDetails = async () => {
      try {
        const recruiterData = await recruiterAPI.verifyLogin();
        const userData = recruiterData.data;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          designation: userData.designation || '',
          company_name: userData.company_name || '',
          website: userData.website || '',
          industry: userData.industry || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zip: userData.zip || '',
          country: userData.country || '',
      });
    } catch (error) {
        console.error("Failed to fetch recruiter details:", error);
    }
  };
    fetchUserDetails();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
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
            <h1 className="text-4xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground mt-3 text-base">
              Manage your profile, company information, and notification preferences
            </p>
          </div>
        </div>

        {isNewUser && (
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
            <TabsTrigger value="notifications" disabled>
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
                  <CardTitle className="text-2xl font-bold">Personal Information</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="block text-sm text-muted-foreground mb-1">Full Name</span>
                      {isEditMode ? (
                      <Input 
                        id="name" 
                          name="name"
                        value={profileData.name}
                          onChange={handleInputChange}
                          className="text-base"
                      />
                      ) : (
                        <span className="block text-lg font-semibold">{profileData.name}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="block text-sm text-muted-foreground mb-1">Email Address</span>
        <div className="flex items-center space-x-2">
          <Input
            id="email"
            type="email"
            value={profileData.email}
                          disabled
                          className="text-base"
          />
          {!emailVerified ? (
            <Button
              type="button"
              onClick={() =>
                navigate("/recruiter-email-verification", {
                  state: { email: profileData.email },
                })
              }
              className="text-sm"
              disabled={!profileData.email}
            >
              Verify
            </Button>
          ) : (
            <span className="text-green-600 font-medium text-sm">
              Verified
            </span>
          )}
        </div>
      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <span className="block text-sm text-muted-foreground mb-1">Job Title</span>
                      {isEditMode ? (
                      <Input 
                          id="designation"
                          name="designation"
                          value={profileData.designation}
                          onChange={handleInputChange}
                          className="text-base"
                        />
                      ) : (
                        <span className="block text-lg font-semibold">{profileData.designation}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="block text-sm text-muted-foreground mb-1">Phone Number</span>
                      {isEditMode ? (
                      <Input 
                        id="phone" 
                          name="phone"
                        value={profileData.phone}
                          onChange={handleInputChange}
                          className="text-base"
                        />
                      ) : (
                        <span className="block text-lg font-semibold">{profileData.phone}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {!isEditMode ? (
                    <Button onClick={() => setIsEditMode(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                      <Button onClick={handleSave} disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Manage your profile picture
                    </CardDescription>
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
                    <CardTitle className="text-2xl font-bold">Security</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Manage your account security
                    </CardDescription>
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
                <CardTitle className="text-2xl font-bold">Company Information</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Update your company details and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="block text-sm text-muted-foreground mb-1">Company Name</span>
                      {isEditMode ? (
                      <Input 
                          id="company_name"
                          name="company_name"
                          value={profileData.company_name}
                          onChange={handleInputChange}
                          className="text-base"
                        />
                      ) : (
                        <span className="block text-lg font-semibold">{profileData.company_name}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="block text-sm text-muted-foreground mb-1">Website</span>
                      {isEditMode ? (
                      <Input 
                        id="website" 
                          name="website"
                          value={profileData.website}
                          onChange={handleInputChange}
                          className="text-base"
                        />
                      ) : (
                        <span className="block text-lg font-semibold">{profileData.website}</span>
                      )}
                    </div>
                      <div className="space-y-2">
                      <span className="block text-sm text-muted-foreground mb-1">Industry</span>
                      {isEditMode ? (
                        <Input
                          id="industry" 
                          name="industry"
                          value={profileData.industry}
                          onChange={handleInputChange}
                          className="text-base"
                        />
                      ) : (
                        <span className="block text-lg font-semibold">{profileData.industry}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="mb-2 text-base font-medium">Company Logo</Label>
                    <div className="border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 h-[200px] relative">
                      {profileImage ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img 
                            src={profileImage} 
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
                  <h3 className="text-xl font-bold mb-4">Company Address</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <span className="block text-sm text-muted-foreground mb-1">Street Address</span>
                      {isEditMode ? (
                      <Input 
                        id="address" 
                          name="address"
                          value={profileData.address}
                          onChange={handleInputChange}
                          className="text-base"
                        />
                      ) : (
                        <span className="block text-lg font-semibold">{profileData.address}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div className="space-y-2">
                        <span className="block text-sm text-muted-foreground mb-1">City</span>
                        {isEditMode ? (
                        <Input 
                          id="city" 
                            name="city"
                            value={profileData.city}
                            onChange={handleInputChange}
                            className="text-base"
                          />
                        ) : (
                          <span className="block text-lg font-semibold">{profileData.city}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <span className="block text-sm text-muted-foreground mb-1">State/Province</span>
                        {isEditMode ? (
                        <Input 
                          id="state" 
                            name="state"
                            value={profileData.state}
                            onChange={handleInputChange}
                            className="text-base"
                          />
                        ) : (
                          <span className="block text-lg font-semibold">{profileData.state}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <span className="block text-sm text-muted-foreground mb-1">Zip/Postal Code</span>
                        {isEditMode ? (
                        <Input 
                          id="zip" 
                            name="zip"
                            value={profileData.zip}
                            onChange={handleInputChange}
                            className="text-base"
                          />
                        ) : (
                          <span className="block text-lg font-semibold">{profileData.zip}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <span className="block text-sm text-muted-foreground mb-1">Country</span>
                        {isEditMode ? (
                          <Input
                          id="country" 
                            name="country"
                            value={profileData.country}
                            onChange={handleInputChange}
                            className="text-base"
                          />
                        ) : (
                          <span className="block text-lg font-semibold">{profileData.country}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {!isEditMode ? (
                  <Button onClick={() => setIsEditMode(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Company Info
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                  </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Notification Preferences</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-new-candidate" className="text-base font-medium">
                          New Candidate Applications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive an email when a new candidate applies to your job
                        </p>
                      </div>
                      <Switch 
                        id="email-new-candidate" 
                        disabled
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-interview-complete" className="text-base font-medium">
                          Interview Completion
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive an email when a candidate completes an AI interview
                        </p>
                      </div>
                      <Switch 
                        id="email-interview-complete" 
                        disabled
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-weekly-summary" className="text-base font-medium">
                          Weekly Summary
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a weekly summary of all hiring activity
                        </p>
                      </div>
                      <Switch 
                        id="email-weekly-summary" 
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-bold mb-4">Browser Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="browser-new-candidate" className="text-base font-medium">
                          New Candidate Applications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a browser notification when a new candidate applies
                        </p>
                      </div>
                      <Switch 
                        id="browser-new-candidate" 
                        disabled
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="browser-interview-complete" className="text-base font-medium">
                          Interview Completion
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a browser notification when an interview is completed
                        </p>
                      </div>
                      <Switch 
                        id="browser-interview-complete" 
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-bold mb-4">SMS Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-interview-complete" className="text-base font-medium">
                          Interview Completion
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive an SMS when a high-priority candidate completes an interview
                        </p>
                      </div>
                      <Switch 
                        id="sms-interview-complete" 
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button disabled>
                  Save Notification Preferences
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
