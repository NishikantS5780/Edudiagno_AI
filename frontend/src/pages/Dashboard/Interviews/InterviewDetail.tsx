import React, { useState, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { InterviewData } from "@/types/interview";
import { JobData } from "@/types/job";
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
  Image,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VideoJS from "@/components/common/VideoJs";
import { interviewAPI } from "@/services/interviewApi";
import { jobAPI } from "@/services/jobApi";

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

interface QuizOption {
  id: number;
  label: string;
  correct: boolean;
}

interface QuizQuestion {
  id: number;
  description: string;
  options: {
    id: number;
    label: string;
    correct: boolean;
  }[];
  type: "single" | "multiple" | "true_false";
  category: "technical" | "aptitude";
}

interface QuizResponse {
  question_id: number;
  option_id: number;
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
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [mcqScores, setMcqScores] = useState({
    total: { correct: 0, total: 0 },
    technical: { correct: 0, total: 0 },
    aptitude: { correct: 0, total: 0 },
  });
  const playerRef = React.useRef(null);
  const [interviews, setInterviews] = useState<InterviewData[]>([]);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        if (!id) {
          throw "Invalid interview";
        }

        const res = await interviewAPI.getInterview(id);

        if (!res.data) {
          toast.error("Interview not found");
          navigate("/dashboard/interviews");
          return;
        }

        setInterview(res.data);

        // Fetch job details
        if (res.data.job_id) {
          const jobResponse = await jobAPI.getCurrentRecruiterJob(
            res.data.job_id.toString()
          );
          const jobData = jobResponse.data;
          setJob({
            id: jobData.id,
            title: jobData.title,
            description: jobData.description,
            department: jobData.department,
            city: jobData.city || "",
            location: jobData.location,
            type: jobData.type,
            min_experience: jobData.min_experience || 0,
            max_experience: jobData.max_experience || 0,
            salary_min: jobData.salary_min,
            salary_max: jobData.salary_max,
            currency: jobData.currency || "USD",
            show_salary: jobData.show_salary || false,
            requirements: jobData.requirements,
            benefits: jobData.benefits,
            status: jobData.status,
            createdAt: jobData.created_at,
            requires_dsa: jobData.requires_dsa || false,
            dsa_questions: jobData.dsa_questions || [],
            requires_mcq: jobData.requires_mcq || false,
            duration_months: jobData.duration_months || 0,
            key_qualification: jobData.key_qualification || "",
          });
        }

        // Fetch questions and responses
        const qrResponse = await interviewAPI.getInterviewQuestionsAndResponses(
          id!
        );
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

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

        // First get the job_id from the interview
        const interviewResponse = await fetch(
          `${baseUrl}/interview/recruiter-view?id=${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!interviewResponse.ok) {
          throw new Error(
            `Failed to fetch interview: ${interviewResponse.status}`
          );
        }

        const interviewData = await interviewResponse.json();
        console.log("Raw interview response:", interviewResponse);
        console.log("Interview data:", interviewData);
        console.log("Interview data type:", typeof interviewData);
        console.log("Interview data keys:", Object.keys(interviewData));

        // Try to get job_id from different possible locations
        const jobId =
          interviewData.job_id ||
          interviewData.jobId ||
          (interviewData.job && interviewData.job.id);

        if (!jobId) {
          console.error(
            "No job_id found in interview data. Full response:",
            interviewData
          );
          setQuizQuestions([]);
          setQuizResponses([]);
          return;
        }

        console.log("Using job_id:", jobId);

        // Get quiz questions using job_id
        const questionsUrl = `${baseUrl}/quiz-question?job_id=${jobId}`;
        console.log("Fetching questions from:", questionsUrl);

        const questionsRes = await fetch(questionsUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!questionsRes.ok) {
          if (questionsRes.status === 404) {
            console.log("No quiz questions found for this job");
            setQuizQuestions([]);
            setQuizResponses([]);
            return;
          }
          throw new Error(`HTTP error! status: ${questionsRes.status}`);
        }

        const quizQuestions = await questionsRes.json();
        console.log(
          "Raw Quiz Questions:",
          JSON.stringify(quizQuestions, null, 2)
        );
        setQuizQuestions(quizQuestions);

        // Get quiz responses
        const responsesUrl = `${baseUrl}/quiz-response/recruiter-view?interview_id=${id}`;
        console.log("Fetching responses from:", responsesUrl);

        const responsesRes = await fetch(responsesUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!responsesRes.ok) {
          if (responsesRes.status === 404) {
            console.log("No quiz responses found for this interview");
            setQuizResponses([]);
            return;
          }
          throw new Error(`HTTP error! status: ${responsesRes.status}`);
        }

        const quizResponses = await responsesRes.json();
        console.log(
          "Raw Quiz Responses:",
          JSON.stringify(quizResponses, null, 2)
        );
        setQuizResponses(quizResponses);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        if (error instanceof Error) {
          toast.error(`Failed to load quiz data: ${error.message}`);
        } else {
          toast.error("Failed to load quiz data");
        }
      }
    };

    if (id) {
      fetchQuizData();
    }
  }, [id]);

  useEffect(() => {
    const calculateScores = () => {
      if (quizResponses.length === 0 || quizQuestions.length === 0) return;

      const scores = {
        total: { correct: 0, total: quizResponses.length },
        technical: { correct: 0, total: 0 },
        aptitude: { correct: 0, total: 0 },
      };

      quizResponses.forEach((response) => {
        const question = quizQuestions.find(
          (q) => q.id === response.question_id
        );
        if (!question) return;

        const chosenOption = question.options.find(
          (opt) => opt.id === response.option_id
        );
        if (chosenOption?.correct) {
          scores.total.correct++;
          if (question.category === "technical") {
            scores.technical.correct++;
            scores.technical.total++;
          } else if (question.category === "aptitude") {
            scores.aptitude.correct++;
            scores.aptitude.total++;
          }
        } else {
          if (question.category === "technical") {
            scores.technical.total++;
          } else if (question.category === "aptitude") {
            scores.aptitude.total++;
          }
        }
      });

      setMcqScores(scores);
    };

    calculateScores();
  }, [quizResponses, quizQuestions]);

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
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive"
          >
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
                  {interview.first_name?.[0]}
                  {interview.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {interview.first_name} {interview.last_name}
                </CardTitle>
                <CardDescription>{interview.email}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  interview.status === "completed" ? "success" : "warning"
                }
              >
                {interview.status}
              </Badge>
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/interviews/${id}/report`)}
              >
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
                  {interview.work_experience
                    ? `${interview.work_experience} ${
                        interview.work_experience === 1 ? "year" : "years"
                      }`
                    : "Not specified"}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Skills</p>
              <div className="font-medium flex flex-wrap">
                {interview.skills?.split(",").map((skill, index) => (
                  <span key={index} className="whitespace-nowrap">
                    {index == 0 ? "" : ","} {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
            {interview.resume_url && (
              <div className="mt-6">
                <a
                  className="flex items-center gap-2"
                  href={interview.resume_url}
                >
                  <FileText className="h-4 w-4" />
                  Download Resume
                </a>
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
              {interview.status && getStatusBadge(interview.status)}
            </div>
            <div className="flex items-center justify-between">
              <span>Date:</span>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                {new Date(interview.created_at || "").toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Overall Score:</span>
              <span
                className={`text-xl font-bold ${getScoreColor(
                  interview.overall_score || 0
                )}`}
              >
                {interview.overall_score || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>MCQ Score:</span>
              <span className="text-xl font-bold text-green-600">
                {mcqScores.total.correct}/{mcqScores.total.total}
              </span>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Technical MCQs:
                </span>
                <span className="text-sm font-medium">
                  {mcqScores.technical.correct}/{mcqScores.technical.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Aptitude MCQs:
                </span>
                <span className="text-sm font-medium">
                  {mcqScores.aptitude.correct}/{mcqScores.aptitude.total}
                </span>
              </div>
            </div>
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setInterviewTab("mcq")}
              >
                <FileText className="h-4 w-4" />
                View MCQ Responses
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Technical Skills</h4>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${interview.technical_skills_score || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {interview.technical_skills_score || 0}%
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Communication Skills</h4>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${interview.communication_skills_score || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {interview.communication_skills_score || 0}%
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Problem Solving</h4>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${
                          interview.problem_solving_skills_score || 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {interview.problem_solving_skills_score || 0}%
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Cultural Fit</h4>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${interview.cultural_fit_score || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {interview.cultural_fit_score || 0}%
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
          <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
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
                  {job.show_salary && job.salary_min && job.salary_max && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Salary Range
                      </p>
                      <p className="font-medium">
                        {job.currency === "INR" && "₹"}
                        {job.currency === "USD" && "$"}
                        {job.currency === "EUR" && "€"}
                        {job.currency === "GBP" && "£"}
                        {job.salary_min.toLocaleString()} -{" "}
                        {job.salary_max.toLocaleString()} {job.currency}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Match Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${interview.resume_match_score || 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {interview.resume_match_score || 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Feedback</p>
                    <p className="font-medium">
                      {interview.resume_match_feedback ||
                        "No feedback available"}
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
                <p className="text-sm whitespace-pre-wrap">
                  {interview.feedback}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Recordings</CardTitle>
              <CardDescription>Candidate's recorded responses</CardDescription>
            </CardHeader>
            <CardContent>
              {!interview.video_url && (
                <div className="text-center p-10">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No recordings available
                  </p>
                </div>
              )}
              {interview.video_url && (
                <VideoJS
                  options={{
                    autoplay: true,
                    controls: true,
                    responsive: true,
                    fluid: true,
                    sources: [
                      {
                        src: interview.video_url,
                        type: "application/x-mpegURL",
                      },
                    ],
                  }}
                  onReady={(player) => {
                    playerRef.current = player;

                    // You can handle player events here, for example:
                    player.on("waiting", () => {
                      videojs.log("player is waiting");
                    });

                    player.on("dispose", () => {
                      videojs.log("player will dispose");
                    });
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenshots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Screenshots</CardTitle>
              <CardDescription>
                Captured moments during the interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interview.screenshot_urls &&
              interview.screenshot_urls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {interview.screenshot_urls.map(
                    (url: string, index: number) => {
                      // Clean up the URL by removing any 'None' segments and ensuring proper path
                      const cleanUrl = url
                        .replace(/\/None\//g, "/")
                        .replace(/\/+/g, "/");
                      // Extract just the filename from the URL
                      const filename = cleanUrl.split("/").pop();
                      // Construct the full URL using the API base URL, ensuring no double /api
                      const baseUrl =
                        import.meta.env.VITE_API_BASE_URL ||
                        "http://localhost:8000";
                      const imageUrl = `${baseUrl}/uploads/screenshot/${interview.id}/${filename}`;

                      return (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Interview screenshot ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://placehold.co/400x300?text=Image+Not+Found";
                              console.error("Failed to load image:", imageUrl);
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => window.open(imageUrl, "_blank")}
                            >
                              View Full Size
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="text-center p-10">
                  <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No screenshots available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Interview Questions & Responses
              </CardTitle>
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
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Question
                          </p>
                          <p className="text-sm">{qr.question}</p>
                        </div>
                        <div className="bg-background rounded-lg p-4">
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Response
                          </p>
                          {qr.answer ? (
                            <p className="text-sm">{qr.answer}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No response yet
                            </p>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">MCQ Responses</CardTitle>
              <CardDescription>
                Review the candidate's answers to multiple choice questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quizResponses.length > 0 ? (
                <div className="space-y-8">
                  {/* Technical Questions Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Technical Questions
                    </h3>
                    <div className="space-y-6">
                      {Array.from(
                        new Set(quizResponses.map((r) => r.question_id))
                      ).map((questionId) => {
                        const question = quizQuestions.find(
                          (q) => q.id === questionId
                        );
                        if (!question || question.category !== "technical")
                          return null;

                        // Get all responses for this question
                        const questionResponses = quizResponses.filter(
                          (r) => r.question_id === questionId
                        );
                        const selectedOptionIds = questionResponses.map(
                          (r) => r.option_id
                        );

                        // Check if all selected options are correct
                        const isFullyCorrect = selectedOptionIds.every(
                          (optionId) => {
                            const option = question.options.find(
                              (opt) => opt.id === optionId
                            );
                            return option?.correct;
                          }
                        );

                        // Check if all correct options were selected
                        const allCorrectOptionsSelected = question.options
                          .filter((opt) => opt.correct)
                          .every((opt) => selectedOptionIds.includes(opt.id));

                        const isCorrect =
                          isFullyCorrect && allCorrectOptionsSelected;

                        return (
                          <div
                            key={questionId}
                            className={`border rounded-lg p-4 ${
                              isCorrect
                                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-foreground">
                                Question {questionId}
                              </p>
                              <Badge
                                variant={isCorrect ? "success" : "destructive"}
                              >
                                {isCorrect ? "Correct" : "Incorrect"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {question.description}
                            </p>
                            <div className="space-y-2">
                              {question.options.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full border ${
                                      selectedOptionIds.includes(option.id)
                                        ? option.correct
                                          ? "bg-green-500 border-green-600"
                                          : "bg-red-500 border-red-600"
                                        : option.correct
                                        ? "border-green-600"
                                        : "border-gray-300"
                                    }`}
                                  ></div>
                                  <p
                                    className={`text-sm ${
                                      selectedOptionIds.includes(option.id)
                                        ? option.correct
                                          ? "text-green-600 font-medium dark:text-green-400"
                                          : "text-red-600 font-medium dark:text-red-400"
                                        : option.correct
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {option.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Aptitude Questions Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Aptitude Questions
                    </h3>
                    <div className="space-y-6">
                      {Array.from(
                        new Set(quizResponses.map((r) => r.question_id))
                      ).map((questionId) => {
                        const question = quizQuestions.find(
                          (q) => q.id === questionId
                        );
                        if (!question || question.category !== "aptitude")
                          return null;

                        // Get all responses for this question
                        const questionResponses = quizResponses.filter(
                          (r) => r.question_id === questionId
                        );
                        const selectedOptionIds = questionResponses.map(
                          (r) => r.option_id
                        );

                        // Check if all selected options are correct
                        const isFullyCorrect = selectedOptionIds.every(
                          (optionId) => {
                            const option = question.options.find(
                              (opt) => opt.id === optionId
                            );
                            return option?.correct;
                          }
                        );

                        // Check if all correct options were selected
                        const allCorrectOptionsSelected = question.options
                          .filter((opt) => opt.correct)
                          .every((opt) => selectedOptionIds.includes(opt.id));

                        const isCorrect =
                          isFullyCorrect && allCorrectOptionsSelected;

                        return (
                          <div
                            key={questionId}
                            className={`border rounded-lg p-4 ${
                              isCorrect
                                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-foreground">
                                Question {questionId}
                              </p>
                              <Badge
                                variant={isCorrect ? "success" : "destructive"}
                              >
                                {isCorrect ? "Correct" : "Incorrect"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {question.description}
                            </p>
                            <div className="space-y-2">
                              {question.options.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full border ${
                                      selectedOptionIds.includes(option.id)
                                        ? option.correct
                                          ? "bg-green-500 border-green-600"
                                          : "bg-red-500 border-red-600"
                                        : option.correct
                                        ? "border-green-600"
                                        : "border-gray-300"
                                    }`}
                                  ></div>
                                  <p
                                    className={`text-sm ${
                                      selectedOptionIds.includes(option.id)
                                        ? option.correct
                                          ? "text-green-600 font-medium dark:text-green-400"
                                          : "text-red-600 font-medium dark:text-red-400"
                                        : option.correct
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {option.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No quiz responses available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default InterviewDetail;
