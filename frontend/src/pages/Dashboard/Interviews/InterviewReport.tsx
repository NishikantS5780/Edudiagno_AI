import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { interviewAPI } from "@/lib/api";
import { InterviewData } from "@/types/interview";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import {
  ArrowLeft,
  Download,
  FileText,
  BarChart2,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const InterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await interviewAPI.getInterviews();
        const interviewData = response.data.find((i: any) => i.id.toString() === id);
        
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
          cultural_fit_score: interviewData.cultural_fit_score
        });
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to fetch interview data");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, navigate]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-brand";
    return "text-destructive";
  };

  const exportReport = () => {
    if (!interview) return;

    try {
      const reportData = {
        candidate: {
          name: `${interview.firstName} ${interview.lastName}`,
          email: interview.email,
          phone: interview.phone,
          location: interview.location,
          education: interview.education,
          experience: interview.workExperience,
          skills: interview.skills
        },
        interview: {
          date: new Date(interview.createdAt || '').toLocaleDateString(),
          status: interview.status,
          overallScore: interview.overallScore,
          technicalSkills: interview.technical_skills_score,
          communication: interview.communication_skills_score,
          problemSolving: interview.problem_solving_skills_score,
          culturalFit: interview.cultural_fit_score,
          feedback: interview.feedback,
          resumeMatchScore: interview.resumeMatchScore,
          resumeMatchFeedback: interview.resumeMatchFeedback
        }
      };

      const csvContent = [
        ['Interview Report', new Date().toLocaleDateString()],
        [''],
        ['Candidate Information'],
        ['Name: ' + reportData.candidate.name],
        ['Email: ' + reportData.candidate.email],
        ['Phone: ' + reportData.candidate.phone],
        ['Location: ' + reportData.candidate.location],
        ['Education: ' + reportData.candidate.education],
        ['Experience: ' + reportData.candidate.experience + ' years'],
        ['Skills: ' + reportData.candidate.skills],
        [''],
        ['Interview Details'],
        ['Date: ' + reportData.interview.date],
        ['Status: ' + reportData.interview.status],
        ['Overall Score: ' + reportData.interview.overallScore + '%'],
        ['Technical Skills: ' + reportData.interview.technicalSkills + '%'],
        ['Communication: ' + reportData.interview.communication + '%'],
        ['Problem Solving: ' + reportData.interview.problemSolving + '%'],
        ['Cultural Fit: ' + reportData.interview.culturalFit + '%'],
        [''],
        ['Resume Match'],
        ['Score: ' + reportData.interview.resumeMatchScore + '%'],
        ['Feedback: ' + reportData.interview.resumeMatchFeedback],
        [''],
        ['Interview Feedback'],
        [reportData.interview.feedback]
      ].map(row => row.join('\n')).join('\n\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `interview_report_${interview.firstName}_${interview.lastName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
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
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/interviews")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviews
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium break-words">{interview.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Education</p>
                  <p className="font-medium break-words">{interview.education}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium break-words">
                    {interview.workExperience ? `${interview.workExperience} years` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Skills</p>
                  <div className="font-medium flex flex-wrap gap-1">
                    {interview.skills?.split(',').map((skill, index) => (
                      <span key={index} className="whitespace-nowrap">
                        {skill.trim()}
                        {index < interview.skills.split(',').length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant="outline" className={interview.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                  {interview.status === "completed" ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                  {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Date:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(interview.createdAt || '').toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Overall Score:</span>
                <span className={`text-xl font-bold ${getScoreColor(interview.overallScore || 0)}`}>
                  {interview.overallScore || 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Technical Skills</span>
                  <span className={getScoreColor(interview.technical_skills_score || 0)}>
                    {interview.technical_skills_score || 0}%
                  </span>
                </div>
                <Progress value={interview.technical_skills_score || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Communication</span>
                  <span className={getScoreColor(interview.communication_skills_score || 0)}>
                    {interview.communication_skills_score || 0}%
                  </span>
                </div>
                <Progress value={interview.communication_skills_score || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Problem Solving</span>
                  <span className={getScoreColor(interview.problem_solving_skills_score || 0)}>
                    {interview.problem_solving_skills_score || 0}%
                  </span>
                </div>
                <Progress value={interview.problem_solving_skills_score || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Cultural Fit</span>
                  <span className={getScoreColor(interview.cultural_fit_score || 0)}>
                    {interview.cultural_fit_score || 0}%
                  </span>
                </div>
                <Progress value={interview.cultural_fit_score || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resume Match Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Match Score</span>
                  <span className={getScoreColor(interview.resumeMatchScore || 0)}>
                    {interview.resumeMatchScore || 0}%
                  </span>
                </div>
                <Progress value={interview.resumeMatchScore || 0} className="h-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Feedback</p>
                <p className="text-sm whitespace-pre-wrap break-words">{interview.resumeMatchFeedback}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap break-words">{interview.feedback}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InterviewReport; 