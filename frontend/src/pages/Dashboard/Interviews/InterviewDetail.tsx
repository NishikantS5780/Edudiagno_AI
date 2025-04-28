import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { interviewAPI, jobAPI } from "@/lib/api";
import { InterviewData } from "@/types/interview";
import { JobData } from "@/types/job";
import DashboardLayout from "@/components/layout/DashboardLayout";
import McqResponsesTab from './McqResponsesTab';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  ThumbsDown,
  ThumbsUp,
  Video,
  Copy,
  Share2,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ScoreBreakdown {
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  culturalFit: number;
}

interface Keyword {
  term: string;
  count: number;
  sentiment: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  answer: string;
  score: number;
}

interface RecordedResponse {
    id: string;
  questionId: string;
  audioUrl: string;
  transcript: string;
  analysis: string;
  score: number;
  videoUrl: string;
}

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [interviewTab, setInterviewTab] = useState("overview");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionsAndResponses, setQuestionsAndResponses] = useState<any[]>([]);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await interviewAPI.getInterviews();
        console.log('Raw interview API response:', response);
        const interviewData = response.data.find((i: any) => i.id.toString() === id);
        console.log('Found interview data:', interviewData);
        
        if (!interviewData) {
          toast.error("Interview not found");
          navigate("/dashboard/interviews");
          return;
        }

        setInterview({
          id: interviewData.id,
          status: interviewData.status,
          firstName: interviewData.first_name,
          lastName: interviewData.last_name,
          email: interviewData.email,
          phone: interviewData.phone,
          workExperience: interviewData.work_experience,
          education: interviewData.education,
          skills: interviewData.skills,
          location: interviewData.location,
          linkedinUrl: interviewData.linkedin_url,
          portfolioUrl: interviewData.portfolio_url,
          resumeUrl: interviewData.resume_url,
          resumeMatchScore: interviewData.resume_match_score,
          resumeMatchFeedback: interviewData.resume_match_feedback,
          overallScore: interviewData.overall_score,
          feedback: interviewData.feedback,
          createdAt: interviewData.created_at,
          jobId: interviewData.job_id,
          technical_skills_score: interviewData.technical_skills_score,
          communication_skills_score: interviewData.communication_skills_score,
          problem_solving_skills_score: interviewData.problem_solving_skills_score,
          cultural_fit_score: interviewData.cultural_fit_score,
          resumeText: interviewData.resumeText || ''
        });

        // Fetch job details
        if (interviewData.job_id) {
          const jobResponse = await jobAPI.recruiterGetJob(interviewData.job_id.toString());
          const jobData = jobResponse.data;
          setJob({
            id: jobData.id,
            title: jobData.title,
            description: jobData.description,
            department: jobData.department,
            city: jobData.city || '',
            location: jobData.location,
            type: jobData.type,
            min_experience: jobData.min_experience || 0,
            max_experience: jobData.max_experience || 0,
            salary_min: jobData.salary_min,
            salary_max: jobData.salary_max,
            currency: jobData.currency || 'USD',
            show_salary: jobData.show_salary || false,
            requirements: jobData.requirements,
            benefits: jobData.benefits,
            status: jobData.status,
            createdAt: jobData.created_at,
            requires_dsa: jobData.requires_dsa || false,
            dsa_questions: jobData.dsa_questions || [],
            requires_mcq: jobData.requires_mcq || false
          });
        }

        // Fetch questions and responses
        const qrResponse = await interviewAPI.getInterviewQuestionsAndResponses(id!);
        setQuestionsAndResponses(qrResponse.data);
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to load interview details");
        navigate("/dashboard/interviews");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, navigate]);

  const copyInterviewLink = () => {
    const link = `${window.location.origin}/interviews?job_id=${id}`;
    navigator.clipboard.writeText(link);
    setIsLinkCopied(true);
    toast.success("Interview link copied to clipboard");

    setTimeout(() => {
      setIsLinkCopied(false);
    }, 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-success/10 text-success">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive">
            <ThumbsDown className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-brand";
    return "text-destructive";
  };

  const handleDownloadResume = async () => {
    if (!interview) {
      toast.error('Interview data not found');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const apiUrl = `${baseUrl}/api/interview/resume?interview_id=${interview.id}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${interview.firstName}_${interview.lastName}_resume_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!interview) {
        return null;
    }

  return (
    <DashboardLayout>
      <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/interviews")}
          className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
          Back to Interviews
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg">
                  {interview.firstName[0]}{interview.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                  {interview.firstName} {interview.lastName}
              </CardTitle>
                <CardDescription>{interview.email}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={interview.status === 'completed' ? 'success' : 'warning'}>
                {interview.status}
              </Badge>
              <Button variant="outline" onClick={() => navigate(`/dashboard/interviews/${id}/report`)}>
                View Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="font-medium">{interview.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-medium">{interview.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Education</p>
                <p className="font-medium">{interview.education}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Experience</p>
                <p className="font-medium">
                  {interview.workExperience ? `${interview.workExperience} years` : 'Not specified'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Skills</p>
              <div className="font-medium flex flex-wrap gap-2">
                {interview.skills?.split(',').map((skill, index) => (
                  <span key={index} className="whitespace-nowrap">
                    {skill.trim()}
                    {index < interview.skills.split(',').length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>
            {interview.resumeUrl && (
              <div className="mt-6">
                <Button
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={handleDownloadResume}
                >
                  <FileText className="h-4 w-4" />
                  Download Resume
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              {getStatusBadge(interview.status)}
            </div>
            <div className="flex items-center justify-between">
              <span>Date:</span>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                {new Date(interview.createdAt || '').toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Overall Score:</span>
              <span
                className={`text-xl font-bold ${getScoreColor(
                  interview.overallScore || 0
                )}`}
              >
                {interview.overallScore || 0}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Technical Skills</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${interview?.technical_skills_score || 0}%`,
                      }}
                    />
      </div>
                  <span className="text-sm font-medium">
                    {interview?.technical_skills_score || 0}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Communication Skills</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${interview?.communication_skills_score || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {interview?.communication_skills_score || 0}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Problem Solving</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${interview?.problem_solving_skills_score || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {interview?.problem_solving_skills_score || 0}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cultural Fit</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${interview?.cultural_fit_score || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {interview?.cultural_fit_score || 0}%
                  </span>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>
      </div>

      <Tabs value={interviewTab} onValueChange={setInterviewTab}>
        <TabsList className="w-full flex justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="questions">Questions & Responses</TabsTrigger>
          <TabsTrigger value="mcq">MCQ Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Match Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Title</p>
                    <p className="font-medium">{job.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Match Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${interview.resumeMatchScore || 0}%`,
                          }}
                        />
                    </div>
                      <span className="text-sm font-medium">
                        {interview.resumeMatchScore || 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Feedback</p>
                    <p className="font-medium">
                      {interview.resumeMatchFeedback || "No feedback available"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    Job details not available for match analysis
                  </p>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {interview.feedback && (
          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Interview Feedback</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm whitespace-pre-wrap">{interview.feedback}</p>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Recordings</CardTitle>
              <CardDescription>
                Candidate's recorded responses
              </CardDescription>
            </CardHeader>
            <CardContent>
                    <div className="text-center p-10">
                      <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No recordings available
                      </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Questions & Responses</CardTitle>
              <CardDescription>
                Review the candidate's responses to interview questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {questionsAndResponses.length > 0 ? (
                <div className="space-y-8">
                  {questionsAndResponses
                    .sort((a, b) => a.order_number - b.order_number)
                    .map((qr, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {qr.question_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Question {qr.order_number + 1}
                  </span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Question</p>
                        <p className="text-sm">{qr.question}</p>
                      </div>
                      <div className="bg-background rounded-lg p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Response</p>
                        {qr.answer ? (
                          <p className="text-sm">{qr.answer}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No response yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No questions and responses available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mcq" className="space-y-6">
    <McqResponsesTab interviewId={interview.id} />
  </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default InterviewDetail;
