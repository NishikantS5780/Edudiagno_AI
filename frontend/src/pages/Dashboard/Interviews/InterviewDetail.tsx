import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  Download,
  Share2,
  Video,
  MessageSquare,
  BarChart3,
  FileText,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ArrowRight,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: string;
  text: string;
  type: string;
  category: string;
}

interface RecordedResponse {
  id: string;
  questionId: string;
  audioUrl: string;
  transcript: string;
  analysis: string;
  score: number;
  videoUrl?: string;
}

interface ScoreBreakdown {
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  culturalFit: number;
}

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
}

interface Keyword {
  term: string;
  count: number;
  sentiment: string;
}

interface Interview {
  id: string;
  candidate: {
    name: string;
    email: string;
    avatar: string;
    resume: string;
  };
  job: {
    title: string;
    department: string;
    id: string;
  };
  score: number;
  status: string;
  date: string;
  time: string;
  duration: string;
  feedback?: string;
  notes?: string;
  aiNotes?: string;
  scoreBreakdown: ScoreBreakdown;
  transcript: TranscriptEntry[];
  keywords: Keyword[];
  recommendations: string[];
  questions: Question[];
  recordedResponses: RecordedResponse[];
}

const interviewData = {
  id: "int-1",
  candidate: {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: "",
    resume: "https://example.com/resume.pdf",
  },
  job: {
    title: "Senior Frontend Developer",
    department: "Engineering",
    id: "job-1",
  },
  score: 87,
  status: "completed",
  date: "April 5, 2023",
  time: "2:30 PM EST",
  duration: "32 minutes",
  scoreBreakdown: {
    technicalSkills: 92,
    communication: 85,
    problemSolving: 88,
    culturalFit: 83,
  },
  aiNotes:
    "Jane demonstrated strong technical knowledge, particularly in React and modern JavaScript. She articulated complex concepts clearly and showed good problem-solving skills. Her experience aligns well with the role requirements. She could improve slightly on explaining her approach to team collaboration.",
  transcript: [
    {
      speaker: "AI",
      text: "Hello Jane, I'm the AI interviewer for the Senior Frontend Developer position at Acme Inc. How are you today?",
      timestamp: "00:00:15",
    },
    {
      speaker: "Candidate",
      text: "I'm doing well, thank you for asking! I'm excited to be interviewing for this role.",
      timestamp: "00:00:22",
    },
    {
      speaker: "AI",
      text: "Great! Let's start by discussing your experience with React. Can you tell me about a complex React application you've built and some challenges you faced?",
      timestamp: "00:00:30",
    },
    {
      speaker: "Candidate",
      text: "Sure. In my current role, I led the development of a data visualization dashboard using React, Redux, and D3.js. The application needed to handle real-time updates from multiple data sources while maintaining performance. One of the biggest challenges was optimizing the rendering of large datasets without sacrificing responsiveness...",
      timestamp: "00:00:40",
    },
    {
      speaker: "AI",
      text: "That's impressive. How did you approach solving the performance issues with large datasets?",
      timestamp: "00:01:30",
    },
    {
      speaker: "Candidate",
      text: "We implemented several optimization strategies. First, we used virtualization with react-window to render only the visible rows in large tables. We also implemented memoization with React.memo and useMemo to prevent unnecessary re-renders. For the most complex visualizations, we offloaded some calculations to Web Workers to keep the main thread free...",
      timestamp: "00:01:45",
    },
  ],
  keywords: [
    { term: "React", count: 12, sentiment: "positive" },
    { term: "Performance optimization", count: 8, sentiment: "positive" },
    { term: "Team collaboration", count: 5, sentiment: "positive" },
    { term: "Testing", count: 3, sentiment: "neutral" },
    { term: "Leadership", count: 6, sentiment: "positive" },
  ],
  recommendations: [
    "Candidate shows strong technical proficiency that matches job requirements",
    "Communication skills are excellent, with clear articulation of complex concepts",
    "Has relevant experience leading development teams",
    "Consider scheduling a follow-up interview focused on system design",
  ],
  recordedResponses: [
    {
      id: "r1",
      questionId: "q1",
      audioUrl: "https://example.com/recordings/q1.mp3",
      transcript: "Sample transcript 1",
      analysis: "Sample analysis 1",
      score: 85,
      videoUrl: "https://example.com/recordings/q1.webm",
    },
    {
      id: "r2",
      questionId: "q2",
      audioUrl: "https://example.com/recordings/q2.mp3",
      transcript: "Sample transcript 2",
      analysis: "Sample analysis 2",
      score: 90,
      videoUrl: "https://example.com/recordings/q2.webm",
    },
    {
      id: "r3",
      questionId: "q3",
      audioUrl: "https://example.com/recordings/q3.mp3",
      transcript: "Sample transcript 3",
      analysis: "Sample analysis 3",
      score: 82,
      videoUrl: "https://example.com/recordings/q3.webm",
    },
    {
      id: "r4",
      questionId: "q4",
      audioUrl: "https://example.com/recordings/q4.mp3",
      transcript: "Sample transcript 4",
      analysis: "Sample analysis 4",
      score: 88,
      videoUrl: "https://example.com/recordings/q4.webm",
    },
    {
      id: "r5",
      questionId: "q5",
      audioUrl: "https://example.com/recordings/q5.mp3",
      transcript: "Sample transcript 5",
      analysis: "Sample analysis 5",
      score: 91,
      videoUrl: "https://example.com/recordings/q5.webm",
    },
  ],
  questions: [
    {
      id: "q1",
      text: "Tell me about your experience with educational assessment tools.",
      type: "behavioral",
      category: "experience",
    },
    {
      id: "q2",
      text: "How would you handle a situation where a student disagrees with their assessment results?",
      type: "situational",
      category: "conflict resolution",
    },
    {
      id: "q3",
      text: "What metrics do you consider most important when evaluating educational outcomes?",
      type: "technical",
      category: "assessment",
    },
  ],
};

const getInterviewData = (id: string): Interview => {
  return interviewData as Interview;
};

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [interviewTab, setInterviewTab] = useState("overview");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const interview = getInterviewData(id);

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
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-brand";
    return "text-destructive";
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-3 w-3 text-success" />;
      case "negative":
        return <ThumbsDown className="h-3 w-3 text-destructive" />;
      case "neutral":
      default:
        return null;
    }
  };

  const playVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setIsPlaying(true);

    const videoElement = document.getElementById(
      `video-response-${index}`
    ) as HTMLVideoElement;
    if (videoElement) {
      videoElement.play().catch((err) => {
        console.error("Error playing video:", err);
        toast.error("Error playing video");
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard/interviews")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Interview Details</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={copyInterviewLink}>
            {isLinkCopied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {isLinkCopied ? "Copied" : "Copy Link"}
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={interview.candidate.avatar}
                alt={interview.candidate.name}
              />
              <AvatarFallback className="text-lg">
                {interview.candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {interview.candidate.name}
              </CardTitle>
              <CardDescription>{interview.candidate.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Interview for</p>
                <p className="font-medium">
                  <Link
                    to={`/dashboard/jobs/${interview.job.id}`}
                    className="hover:underline"
                  >
                    {interview.job.title}
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  {interview.job.department}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resume</p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a
                    href={interview.candidate.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Resume <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
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
              {getStatusBadge(interview.status)}
            </div>
            <div className="flex items-center justify-between">
              <span>Date:</span>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                {interview.date}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Time:</span>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                {interview.time}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Duration:</span>
              <span>{interview.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Overall Score:</span>
              <span
                className={`text-xl font-bold ${getScoreColor(
                  interview.score
                )}`}
              >
                {interview.score}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={interviewTab}
        onValueChange={setInterviewTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transcript">
            <FileText className="h-4 w-4 mr-2" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="h-4 w-4 mr-2" />
            Video
          </TabsTrigger>
          <TabsTrigger value="insights">
            <MessageSquare className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score Breakdown</CardTitle>
              <CardDescription>
                Detailed assessment of candidate performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Technical Skills</span>
                  <span
                    className={getScoreColor(
                      interview.scoreBreakdown.technicalSkills
                    )}
                  >
                    {interview.scoreBreakdown.technicalSkills}%
                  </span>
                </div>
                <Progress
                  value={interview.scoreBreakdown.technicalSkills}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Communication</span>
                  <span
                    className={getScoreColor(
                      interview.scoreBreakdown.communication
                    )}
                  >
                    {interview.scoreBreakdown.communication}%
                  </span>
                </div>
                <Progress
                  value={interview.scoreBreakdown.communication}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Problem Solving</span>
                  <span
                    className={getScoreColor(
                      interview.scoreBreakdown.problemSolving
                    )}
                  >
                    {interview.scoreBreakdown.problemSolving}%
                  </span>
                </div>
                <Progress
                  value={interview.scoreBreakdown.problemSolving}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Cultural Fit</span>
                  <span
                    className={getScoreColor(
                      interview.scoreBreakdown.culturalFit
                    )}
                  >
                    {interview.scoreBreakdown.culturalFit}%
                  </span>
                </div>
                <Progress
                  value={interview.scoreBreakdown.culturalFit}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
              <CardDescription>Based on candidate performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {interview.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Transcript</CardTitle>
              <CardDescription>
                Complete conversation between AI and candidate
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-6">
                {interview.transcript.map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-20 text-sm text-muted-foreground">
                      {entry.timestamp}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-1">{entry.speaker}</div>
                      <div className="text-sm">{entry.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Terms</CardTitle>
              <CardDescription>
                Frequently mentioned terms and sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interview.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1 p-2"
                  >
                    {keyword.term} ({keyword.count})
                    {getSentimentIcon(keyword.sentiment)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Recordings</CardTitle>
              <CardDescription>
                Candidate's recorded responses to each question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative">
                  {interview.recordedResponses &&
                  interview.recordedResponses.length > 0 ? (
                    <video
                      id={`video-response-${currentVideoIndex}`}
                      src={
                        interview.recordedResponses[currentVideoIndex].videoUrl
                      }
                      className="w-full h-full rounded-md"
                      controls
                      onEnded={() => setIsPlaying(false)}
                      onPause={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                    />
                  ) : (
                    <div className="text-center p-10">
                      <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No recordings available
                      </p>
                    </div>
                  )}

                  {!isPlaying &&
                    interview.recordedResponses &&
                    interview.recordedResponses.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-16 w-16 rounded-full bg-background/80 hover:bg-background/100"
                          onClick={() => playVideo(currentVideoIndex)}
                        >
                          <Play className="h-8 w-8" />
                        </Button>
                      </div>
                    )}
                </div>

                {interview.recordedResponses &&
                  interview.recordedResponses.length > 0 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {interview.questions.map((question, index) => (
                          <Card
                            key={question.id}
                            className={`cursor-pointer transition-all hover:border-primary ${
                              currentVideoIndex === index
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                            onClick={() => setCurrentVideoIndex(index)}
                          >
                            <CardContent className="p-4 flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
                                {index + 1}
                              </div>
                              <p className="text-xs text-center line-clamp-2">
                                {question.text}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentVideoIndex((prev) =>
                              Math.max(0, prev - 1)
                            )
                          }
                          disabled={currentVideoIndex === 0}
                        >
                          Previous Answer
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentVideoIndex((prev) =>
                              Math.min(interview.questions.length - 1, prev + 1)
                            )
                          }
                          disabled={
                            currentVideoIndex === interview.questions.length - 1
                          }
                        >
                          Next Answer
                        </Button>
                      </div>
                    </>
                  )}

                <div className="flex justify-end mt-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download All Recordings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Interview Notes</CardTitle>
              <CardDescription>
                Detailed observations from the AI interviewer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{interview.aiNotes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                Areas for Follow-up
              </CardTitle>
              <CardDescription>
                Topics that may require additional discussion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" />
                  <span>
                    Probe further on experience with large-scale applications
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" />
                  <span>
                    Ask for specific examples of leadership in challenging
                    situations
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" />
                  <span>
                    Verify knowledge of latest frontend testing methodologies
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/interviews")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Interviews
        </Button>
        <Button asChild>
          <Link to={`/dashboard/candidates/profile/${id}`}>
            View Candidate Profile
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default InterviewDetail;
