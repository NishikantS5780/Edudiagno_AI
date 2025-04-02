
import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Video,
  MessageSquare,
  BarChart2,
  Download,
  Share2,
  Star,
  Plus,
  FileCheck,
  Clock,
  CheckSquare,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Mock candidate data for demonstration
const candidateData = {
  id: "cand-1",
  name: "Jane Smith",
  email: "jane.smith@example.com",
  phone: "(555) 123-4567",
  avatar: "",
  jobTitle: "Senior Frontend Developer",
  location: "San Francisco, CA",
  status: "interviewed",
  appliedDate: "April 5, 2023",
  resume: "https://example.com/resume.pdf",
  linkedIn: "https://linkedin.com/in/janesmith",
  portfolio: "https://janesmith.dev",
  jobId: "job-1",
  matchPercentage: 92,
  skills: [
    { name: "React", score: 95, strength: "strong" },
    { name: "TypeScript", score: 90, strength: "strong" },
    { name: "UI/UX", score: 85, strength: "strong" },
    { name: "Node.js", score: 75, strength: "moderate" },
    { name: "GraphQL", score: 70, strength: "moderate" },
    { name: "Testing", score: 65, strength: "moderate" },
  ],
  interviews: [
    {
      id: "int-1",
      type: "AI Video Interview",
      date: "April 10, 2023",
      score: 87,
      status: "completed",
    }
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "Master of Science in Computer Science",
      year: "2018 - 2020",
    },
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science in Computer Science",
      year: "2014 - 2018",
    },
  ],
  experience: [
    {
      company: "TechCorp Inc.",
      role: "Frontend Developer",
      period: "2020 - Present",
      description: "Led development of customer-facing applications using React, TypeScript, and GraphQL. Implemented design systems and component libraries for consistent UI/UX across multiple products.",
    },
    {
      company: "WebSolutions LLC",
      role: "Junior Developer",
      period: "2018 - 2020",
      description: "Developed responsive web applications and contributed to frontend architecture. Collaborated with designers and product managers to implement user interfaces and improve user experience.",
    },
    {
      company: "Digital Innovations",
      role: "Intern",
      period: "Summer 2017",
      description: "Assisted in development of web applications and learned modern frontend frameworks and practices.",
    },
  ],
  notes: [
    {
      id: "note-1",
      author: "Alex Rodriguez",
      date: "April 12, 2023",
      content: "Great communication skills during the AI interview. Impressed with technical knowledge and problem-solving approach.",
    },
    {
      id: "note-2",
      author: "Morgan Lee",
      date: "April 11, 2023",
      content: "Resume indicates strong experience with React and TypeScript. Portfolio projects show attention to detail and clean code.",
    },
  ],
  aiInsights: {
    strengths: [
      "Strong technical knowledge in frontend development",
      "Excellent communication skills",
      "Problem-solving approach is methodical and effective",
      "Experience with modern frontend frameworks and tools",
    ],
    areasOfImprovement: [
      "Limited experience with backend technologies",
      "Could benefit from more exposure to large-scale applications",
    ],
    culturalFit: "High potential for cultural fit based on values expressed during the interview and previous team collaboration experience.",
    recommendedNextSteps: "Recommend scheduling a technical interview with the engineering team to further assess skills and team fit.",
  },
};

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  
  // In a real application, you would fetch the candidate data using the ID
  const candidate = candidateData;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            New
          </Badge>
        );
      case "screening":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Resume Screening
          </Badge>
        );
      case "interviewed":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Interviewed
          </Badge>
        );
      case "shortlisted":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Shortlisted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case "strong":
        return (
          <Badge variant="outline" className="bg-success/10 text-success">
            Strong
          </Badge>
        );
      case "moderate":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            Moderate
          </Badge>
        );
      case "weak":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive">
            Needs Improvement
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    // This would update the candidate status in a real application
    toast.success(`Candidate status updated to ${newStatus}`);
  };

  const handleScheduleInterview = () => {
    // This would open a scheduling modal in a real application
    toast.success("Interview scheduling initiated");
  };

  const handleSendEmail = () => {
    // This would open an email composer in a real application
    toast.success("Email composer opened");
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/candidates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Candidate Profile</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status: {candidate.status === "shortlisted" ? "Shortlisted" : 
                  candidate.status === "interviewed" ? "Interviewed" :
                  candidate.status === "screening" ? "Screening" :
                  candidate.status === "rejected" ? "Rejected" : "New"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleStatusChange("shortlisted")}>
                  <CheckCircle className="mr-2 h-4 w-4 text-success" />
                  <span>Shortlist</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
                  <XCircle className="mr-2 h-4 w-4 text-destructive" />
                  <span>Reject</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Mark as Pending</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" onClick={handleScheduleInterview}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
          
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.success("Resume downloaded")}>
                <Download className="mr-2 h-4 w-4" />
                <span>Download Resume</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Profile shared")}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.success("Candidate archived")}>
                <span className="text-destructive">Archive Candidate</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Candidate Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback className="text-xl bg-brand/10 text-brand">
                {candidate.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {candidate.name}
                {candidate.status === "shortlisted" && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
              </CardTitle>
              <CardDescription className="text-lg">{candidate.jobTitle}</CardDescription>
              {getStatusBadge(candidate.status)}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={`mailto:${candidate.email}`} className="hover:underline">
                    {candidate.email}
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={`tel:${candidate.phone}`} className="hover:underline">
                    {candidate.phone}
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {candidate.location}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {candidate.appliedDate}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <a href={candidate.resume} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Resume
                  </a>
                </Button>
                {candidate.linkedIn && (
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href={candidate.linkedIn} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Button>
                )}
                {candidate.portfolio && (
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer">
                      Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Match Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Match Analysis</CardTitle>
            <CardDescription>
              How this candidate matches with {candidate.jobTitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full p-4 bg-brand/5 mb-3">
                <div className="text-4xl font-bold text-brand">{candidate.matchPercentage}%</div>
              </div>
              <p className="text-muted-foreground">Overall Match</p>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Technical Skills</span>
                  <span className="font-medium">90%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Experience</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Culture Fit</span>
                  <span className="font-medium">95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
            </div>
            
            <div className="pt-2">
              <Link to={`/dashboard/jobs/${candidate.jobId}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Job Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Candidate Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="profile">
            <FileText className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="skills">
            <CheckSquare className="h-4 w-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="interviews">
            <Video className="h-4 w-4 mr-2" />
            Interviews
          </TabsTrigger>
          <TabsTrigger value="notes">
            <MessageSquare className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="ai-insights">
            <BarChart2 className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Experience Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {candidate.experience.map((exp, index) => (
                <div key={index} className={index !== 0 ? "pt-4 border-t" : ""}>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold">{exp.role}</h3>
                    <span className="text-sm text-muted-foreground">{exp.period}</span>
                  </div>
                  <p className="text-muted-foreground mb-2">{exp.company}</p>
                  <p className="text-sm">{exp.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Education Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.education.map((edu, index) => (
                <div key={index} className={index !== 0 ? "pt-4 border-t" : ""}>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <span className="text-sm text-muted-foreground">{edu.year}</span>
                  </div>
                  <p className="text-muted-foreground">{edu.institution}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills Assessment</CardTitle>
              <CardDescription>AI evaluation based on resume and interview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {candidate.skills.map((skill, index) => (
                  <div key={index} className={index !== 0 ? "pt-4 border-t" : ""}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <h3 className="font-semibold">{skill.name}</h3>
                        <div className="ml-2">
                          {getStrengthBadge(skill.strength)}
                        </div>
                      </div>
                      <span className="font-medium">{skill.score}%</span>
                    </div>
                    <Progress value={skill.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 flex justify-between">
              <p className="text-sm text-muted-foreground">
                Skills are assessed based on resume analysis and interview performance
              </p>
              <Button variant="outline" size="sm">View Full Report</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Interview History</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Interview
            </Button>
          </div>
          
          {candidate.interviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Video className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No interviews yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  This candidate hasn't had any interviews scheduled
                </p>
                <Button>Schedule First Interview</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {candidate.interviews.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-5 border-b">
                      <div className="p-4 md:border-r">
                        <p className="text-sm text-muted-foreground mb-1">Interview Type</p>
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2 text-brand" />
                          <span>{interview.type}</span>
                        </div>
                      </div>
                      <div className="p-4 md:border-r">
                        <p className="text-sm text-muted-foreground mb-1">Date</p>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{interview.date}</span>
                        </div>
                      </div>
                      <div className="p-4 md:border-r">
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <Badge variant={interview.status === "completed" ? "success" : "outline"}>
                          {interview.status === "completed" ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" /> Completed
                            </>
                          ) : (
                            interview.status
                          )}
                        </Badge>
                      </div>
                      <div className="p-4 md:border-r">
                        <p className="text-sm text-muted-foreground mb-1">Score</p>
                        <span className="text-lg font-semibold text-brand">{interview.score}%</span>
                      </div>
                      <div className="p-4 flex items-center justify-end">
                        <Link to={`/dashboard/interviews/${interview.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground mr-2">AI Recommendation:</span>
                          <span className="font-medium">Consider for next round</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" /> Agree
                          </Button>
                          <Button variant="outline" size="sm">
                            <ThumbsDown className="h-4 w-4 mr-1" /> Disagree
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Candidate Notes</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
          
          <Card>
            <CardContent className="divide-y p-0">
              {candidate.notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No notes yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start adding notes about this candidate
                  </p>
                  <Button size="sm">Add First Note</Button>
                </div>
              ) : (
                candidate.notes.map((note) => (
                  <div key={note.id} className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{note.author}</span>
                      <span className="text-sm text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Assessment</CardTitle>
              <CardDescription>
                Automated analysis based on resume and interview performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-success" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {candidate.aiInsights.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <ThumbsDown className="h-4 w-4 mr-2 text-amber-500" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {candidate.aiInsights.areasOfImprovement.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-4 w-4 flex items-center justify-center mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                      </div>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Cultural Fit</h3>
                <p>{candidate.aiInsights.culturalFit}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Recommended Next Steps</h3>
                <p>{candidate.aiInsights.recommendedNextSteps}</p>
              </div>
            </CardContent>
            <CardFooter className="border-t flex justify-between bg-muted/50">
              <p className="text-sm text-muted-foreground">
                AI assessment may need human verification
              </p>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Want to conduct another AI assessment?
            </p>
            <Button>
              <Video className="h-4 w-4 mr-2" />
              Schedule AI Interview
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CandidateDetail;
