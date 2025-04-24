import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Video,
  Copy,
  Share2,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { jobAPI, interviewAPI } from "@/lib/api";
import { JobData } from "@/types/job";
import { InterviewData } from "@/types/interview";
import DsaManagement from "@/components/jobs/DsaManagement";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobData | null>(null);
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchJobDetails();
    fetchInterviews();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobAPI.recruiterGetJob(id);
      const data = response.data;
      setJob({
        id: data.id,
        title: data.title,
        description: data.description,
        department: data.department,
        city: data.city || '',
        location: data.location,
        type: data.type,
        min_experience: data.min_experience || 0,
        max_experience: data.max_experience || 0,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        currency: data.currency || 'USD',
        show_salary: data.show_salary || false,
        requirements: data.requirements,
        benefits: data.benefits,
        status: data.status,
        createdAt: data.created_at,
        requires_dsa: data.requires_dsa || false,
        dsa_questions: data.dsa_questions || []
      });
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviews = async () => {
    try {
      const response = await interviewAPI.getInterviews({ job_id: id });
      const formattedInterviews = response.data.map((interview: any) => ({
        id: interview.id,
        status: interview.status,
        firstName: interview.first_name,
        lastName: interview.last_name,
        email: interview.email,
        phone: interview.phone,
        workExperience: interview.work_experience,
        education: interview.education,
        skills: interview.skills,
        location: interview.location,
        linkedinUrl: interview.linkedin_url,
        portfolioUrl: interview.portfolio_url,
        resumeUrl: interview.resume_url,
        resumeMatchScore: interview.resume_match_score,
        resumeMatchFeedback: interview.resume_match_feedback,
        overallScore: interview.overall_score,
        feedback: interview.feedback
      }));
      setInterviews(formattedInterviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load candidates");
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await jobAPI.deleteJob(job.id.toString());
        toast.success("Job deleted successfully");
        navigate("/dashboard/jobs");
      } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-success/10 text-success">
            <CheckCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> Draft
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive"
          >
            <XCircle className="h-3 w-3 mr-1" /> Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">Job not found</p>
              <Button onClick={() => navigate("/dashboard/jobs")}>
                Return to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard/jobs")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{job.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={`/dashboard/jobs/${job.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const link = `${window.location.origin}/interview?job_id=${job.id}`;
                navigator.clipboard.writeText(link);
                toast.success("Interview link copied to clipboard", {
                  description: link,
                });
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Shareable Link
            </Button>

            <Button
              variant="outline"
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <p className="text-muted-foreground">
                    {job.department} • {job.location}
                  </p>
                </div>
                {getStatusBadge(job.status)}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="candidates">Candidates</TabsTrigger>
                  <TabsTrigger value="dsa">DSA Questions</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Job Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Requirements</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Benefits</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {job.benefits}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="candidates">
                  <div className="space-y-4">
                    {interviews.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No candidates yet</p>
                      </div>
                    ) : (
                      interviews.map((interview) => (
                        <Card key={interview.id}>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {interview.firstName} {interview.lastName}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Mail className="h-4 w-4" />
                                    {interview.email}
                                  </div>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  {interview.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    {interview.phone}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {interview.location}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    {interview.education}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    {interview.workExperience ? `${interview.workExperience} years experience` : 'Experience not specified'}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {interview.linkedinUrl && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                      <a
                                        href={interview.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        LinkedIn Profile
                                      </a>
                                    </div>
                                  )}
                                  {interview.portfolioUrl && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                      <a
                                        href={interview.portfolioUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        Portfolio
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {interview.resumeMatchScore && (
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">Resume Match Score</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{
                                          width: `${interview.resumeMatchScore}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium">
                                      {interview.resumeMatchScore}%
                                    </span>
                                  </div>
                                  {interview.resumeMatchFeedback && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {interview.resumeMatchFeedback}
                                    </p>
                                  )}
                                </div>
                              )}

                              {interview.overallScore && (
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">Interview Score</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{
                                          width: `${interview.overallScore}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium">
                                      {interview.overallScore}%
                                    </span>
                                  </div>
                                  {interview.feedback && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {interview.feedback}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="dsa">
                  {job && <DsaManagement jobId={job.id} />}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;
