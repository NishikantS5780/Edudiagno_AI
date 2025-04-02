import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CreditCard, Key, UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Mock team members data
  const [teamMembers, setTeamMembers] = useState([
    {
      name: "Alex Johnson",
      email: "alex@examplecompany.com",
      role: "Admin",
      lastActive: "Today",
    },
    {
      name: "Sarah Williams",
      email: "sarah@examplecompany.com",
      role: "Hiring Manager",
      lastActive: "Yesterday",
    },
    {
      name: "Michael Chen",
      email: "michael@examplecompany.com",
      role: "Interviewer",
      lastActive: "3 days ago",
    },
    {
      name: "Jessica Lee",
      email: "jessica@examplecompany.com",
      role: "Recruiter",
      lastActive: "1 week ago",
    },
  ]);

  // Mock API key settings
  const [apiKeyData, setApiKeyData] = useState({
    apiKey: "em_live_xxxxxxxxxxxxxxxxxxxxxx",
    webhookUrl: "https://api.example.com/webhooks/edudiagno",
  });

  // Mock billing info
  const billingInfo = {
    plan: "Professional",
    price: "$99/month",
    billingDate: "July 15, 2023",
    paymentMethod: "Visa ending in 4242",
  };

  // Mock AI settings
  const [aiSettings, setAiSettings] = useState({
    enableCustomQuestions: true,
    requireCameraAccess: true,
    recordCandidateVideo: true,
    enableAIScreening: true,
    enableProfanityFilter: true,
    allowAIFeedback: true,
    matchThreshold: 65,
  });

  const handleAPISettingsSave = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "API settings updated",
        description: "Your API settings have been updated successfully.",
      });
    }, 1000);
  };

  const regenerateAPIKey = () => {
    setIsLoading(true);
    
    // Simulate API call to generate new key
    setTimeout(() => {
      setApiKeyData({
        ...apiKeyData,
        apiKey: "em_live_" + Math.random().toString(36).substring(2, 15),
      });
      setIsLoading(false);
      toast({
        title: "API key regenerated",
        description: "Your new API key has been generated. The old key is now invalid.",
      });
    }, 1000);
  };

  const handleAISettingsSave = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "AI settings updated",
        description: "Your AI interview settings have been updated successfully.",
      });
    }, 1000);
  };

  const inviteTeamMember = () => {
    // This would open a modal in a real implementation
    toast({
      title: "Invitation sent",
      description: "An invitation email has been sent to the team member.",
    });
  };

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="team" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="team">
              <Users className="mr-2 h-4 w-4" /> Team
            </TabsTrigger>
            <TabsTrigger value="ai">
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
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg> AI Settings
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="mr-2 h-4 w-4" /> API
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="mr-2 h-4 w-4" /> Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage your team members and their access permissions
                    </CardDescription>
                  </div>
                  <Button onClick={inviteTeamMember}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Team Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 bg-muted p-4 text-sm font-medium">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-3">Role</div>
                    <div className="col-span-3">Last Active</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  <div className="divide-y">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="grid grid-cols-12 p-4 text-sm items-center">
                        <div className="col-span-4">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-muted-foreground">{member.email}</div>
                        </div>
                        <div className="col-span-3">
                          <Badge variant={member.role === "Admin" ? "default" : "outline"}>
                            {member.role}
                          </Badge>
                        </div>
                        <div className="col-span-3 text-muted-foreground">
                          {member.lastActive}
                        </div>
                        <div className="col-span-2 flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          {member.role !== "Admin" && (
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <div className="text-sm text-muted-foreground">
                  <strong>4 team members</strong> in your account
                </div>
                <Link to="/dashboard/settings/teams">
                  <Button variant="outline">Manage Role Permissions</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Interview Settings</CardTitle>
                <CardDescription>
                  Configure your AI interviewer and candidate screening parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Interview Experience</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="custom-questions" className="text-base">
                          Enable Custom Questions
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow custom questions to be added to AI-generated interviews
                        </p>
                      </div>
                      <Switch 
                        id="custom-questions" 
                        checked={aiSettings.enableCustomQuestions}
                        onCheckedChange={(checked) => 
                          setAiSettings({...aiSettings, enableCustomQuestions: checked})
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="camera-access" className="text-base">
                          Require Camera Access
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Require candidates to enable their camera during interviews
                        </p>
                      </div>
                      <Switch 
                        id="camera-access" 
                        checked={aiSettings.requireCameraAccess}
                        onCheckedChange={(checked) => 
                          setAiSettings({...aiSettings, requireCameraAccess: checked})
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="record-video" className="text-base">
                          Record Candidate Video
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Save video recordings of candidate interviews for review
                        </p>
                      </div>
                      <Switch 
                        id="record-video" 
                        checked={aiSettings.recordCandidateVideo}
                        onCheckedChange={(checked) => 
                          setAiSettings({...aiSettings, recordCandidateVideo: checked})
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Screening Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="ai-screening" className="text-base">
                          Enable AI Resume Screening
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically screen resumes against job requirements
                        </p>
                      </div>
                      <Switch 
                        id="ai-screening" 
                        checked={aiSettings.enableAIScreening}
                        onCheckedChange={(checked) => 
                          setAiSettings({...aiSettings, enableAIScreening: checked})
                        }
                      />
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between">
                        <Label htmlFor="match-threshold" className="text-base">
                          Minimum Match Threshold
                        </Label>
                        <span className="text-sm font-medium">{aiSettings.matchThreshold}%</span>
                      </div>
                      <input
                        id="match-threshold"
                        type="range"
                        min={50}
                        max={95}
                        step={5}
                        value={aiSettings.matchThreshold}
                        onChange={(e) => setAiSettings({...aiSettings, matchThreshold: parseInt(e.target.value)})}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        Candidates must meet this minimum match percentage to proceed to interviews
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Content Moderation</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="profanity-filter" className="text-base">
                          Enable Profanity Filter
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Filter inappropriate language in candidate responses
                        </p>
                      </div>
                      <Switch 
                        id="profanity-filter" 
                        checked={aiSettings.enableProfanityFilter}
                        onCheckedChange={(checked) => 
                          setAiSettings({...aiSettings, enableProfanityFilter: checked})
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="ai-feedback" className="text-base">
                          Allow AI Feedback to Candidates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Provide automated feedback to candidates after interviews
                        </p>
                      </div>
                      <Switch 
                        id="ai-feedback" 
                        checked={aiSettings.allowAIFeedback}
                        onCheckedChange={(checked) => 
                          setAiSettings({...aiSettings, allowAIFeedback: checked})
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Changes will apply to all new interviews
                </div>
                <Button onClick={handleAISettingsSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save AI Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>
                  Manage your API keys and webhook configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Live API Key</Label>
                    <div className="flex">
                      <Input 
                        id="api-key" 
                        value={apiKeyData.apiKey}
                        readOnly
                        className="font-mono"
                      />
                      <Button 
                        variant="outline" 
                        className="ml-2"
                        onClick={() => {
                          navigator.clipboard.writeText(apiKeyData.apiKey);
                          toast({
                            title: "Copied!",
                            description: "API key copied to clipboard",
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your API key grants full access to your account. Keep it secure and never share it publicly.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="mt-2"
                      onClick={regenerateAPIKey}
                    >
                      Regenerate API Key
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Webhook Configuration</h3>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://example.com/webhook"
                      value={apiKeyData.webhookUrl}
                      onChange={(e) => setApiKeyData({...apiKeyData, webhookUrl: e.target.value})}
                    />
                    <p className="text-sm text-muted-foreground">
                      We'll send POST requests to this URL when certain events occur in your account.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label className="text-base">Webhook Events</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {["candidate.created", "interview.completed", "interview.started", "report.generated"].map((event) => (
                        <div className="flex items-center space-x-2" key={event}>
                          <input type="checkbox" id={event} defaultChecked className="rounded" />
                          <Label htmlFor={event} className="text-sm cursor-pointer">
                            {event}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">API Documentation</h3>
                  <p className="text-muted-foreground">
                    Learn how to integrate with our API to programmatically manage jobs, candidates, and interviews.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                      <a href="https://developer.edudiagno.ai" target="_blank" rel="noopener noreferrer">
                        View Documentation
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="https://developer.edudiagno.ai/examples" target="_blank" rel="noopener noreferrer">
                        Code Examples
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="https://developer.edudiagno.ai/sdks" target="_blank" rel="noopener noreferrer">
                        SDKs & Libraries
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button onClick={handleAPISettingsSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save API Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  Manage your billing information and subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Current Plan: {billingInfo.plan}</h3>
                      <p className="text-muted-foreground">{billingInfo.price} • Next billing date: {billingInfo.billingDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">Change Plan</Button>
                      <Button variant="destructive">Cancel Plan</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold mb-2">20</div>
                      <div className="text-sm text-muted-foreground">Active Jobs</div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold mb-2">100</div>
                      <div className="text-sm text-muted-foreground">Monthly Interviews</div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold mb-2">Unlimited</div>
                      <div className="text-sm text-muted-foreground">Team Members</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Method</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted w-12 h-8 rounded flex items-center justify-center">
                        <svg className="h-4 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{billingInfo.paymentMethod}</p>
                        <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Billing History</h3>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 bg-muted p-3 text-sm font-medium">
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">Description</div>
                      <div className="col-span-1">Amount</div>
                      <div className="col-span-1 text-right">Invoice</div>
                    </div>
                    <div className="divide-y">
                      {[
                        { date: "Jun 15, 2023", description: "Professional Plan", amount: "$99.00", status: "Paid" },
                        { date: "May 15, 2023", description: "Professional Plan", amount: "$99.00", status: "Paid" },
                        { date: "Apr 15, 2023", description: "Professional Plan", amount: "$99.00", status: "Paid" },
                      ].map((invoice, index) => (
                        <div key={index} className="grid grid-cols-6 p-3 text-sm">
                          <div className="col-span-2">{invoice.date}</div>
                          <div className="col-span-2">{invoice.description}</div>
                          <div className="col-span-1">{invoice.amount}</div>
                          <div className="col-span-1 text-right">
                            <Button variant="link" size="sm" className="h-auto p-0">
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">View All Invoices</Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between border-t p-6 gap-4">
                <Button variant="outline" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    View Billing Portal
                  </a>
                </Button>
                <div className="text-sm text-muted-foreground text-right">
                  Need help with billing? <Link to="/contact" className="text-primary">Contact support</Link>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
