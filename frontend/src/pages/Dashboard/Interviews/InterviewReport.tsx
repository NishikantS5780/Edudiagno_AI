import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { interviewAPI, quizAPI } from "@/lib/api";
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
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QuizResponse, QuizQuestion } from "@/types/quiz";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';

interface InterviewReportProps {
  jobTitle: string;
}

const InterviewReport = ({ jobTitle }: InterviewReportProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [mcqScores, setMcqScores] = useState({
    total: { correct: 0, total: 0 },
    technical: { correct: 0, total: 0 },
    aptitude: { correct: 0, total: 0 }
  });

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

        // Fetch MCQ data
        const quizResponse = await quizAPI.getQuizQuestions(id as string);
        const quizQuestionsResponse = await quizAPI.getQuizQuestions(id as string);

        setQuizResponses(quizResponse.data);
        setQuizQuestions(quizQuestionsResponse.data);

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
          resumeText: interviewData.resume_text,
          resumeMatchScore: interviewData.resume_match_score,
          resumeMatchFeedback: interviewData.resume_match_feedback,
          overallScore: interviewData.overall_score,
          feedback: interviewData.feedback,
          createdAt: interviewData.created_at,
          jobId: interviewData.job_id,
          technicalSkillsScore: interviewData.technical_skills_score,
          communicationSkillsScore: interviewData.communication_skills_score,
          problemSolvingSkillsScore: interviewData.problem_solving_skills_score,
          culturalFitScore: interviewData.cultural_fit_score
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

  useEffect(() => {
    const calculateMcqScores = () => {
      const scores = {
        total: { correct: 0, total: 0 },
        technical: { correct: 0, total: 0 },
        aptitude: { correct: 0, total: 0 }
      };

      quizQuestions.forEach(question => {
        const responses = quizResponses.filter(r => r.question_id === question.id);
        const selectedOptionIds = responses.map(r => r.option_id);
        const correctOptions = question.options.filter(opt => opt.correct).map(opt => opt.id);

        const isFullyCorrect = selectedOptionIds.every(id => correctOptions.includes(id));
        const allCorrectOptionsSelected = correctOptions.every(id => selectedOptionIds.includes(id));
        const isCorrect = isFullyCorrect && allCorrectOptionsSelected;

        scores.total.total++;
        if (isCorrect) scores.total.correct++;

        if (question.category === "technical") {
          scores.technical.total++;
          if (isCorrect) scores.technical.correct++;
        } else if (question.category === "aptitude") {
          scores.aptitude.total++;
          if (isCorrect) scores.aptitude.correct++;
        }
      });

      return scores;
    };

    const scores = calculateMcqScores();
    setMcqScores(scores);
  }, [quizResponses, quizQuestions]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-brand";
    return "text-destructive";
  };

  const generateWordReport = () => {
    if (!interview) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Candidate Interview Report",
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: `${interview.firstName} ${interview.lastName}`,
            heading: "Heading2",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: `Position: ${jobTitle || 'Not specified'}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: `Date: ${new Date(interview.createdAt || '').toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "Candidate Information",
            heading: "Heading2",
            spacing: { before: 400, after: 200 }
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Email")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(interview.email || '')],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Phone")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(interview.phone || '')],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Location")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(interview.location || '')],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Education")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(interview.education || '')],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Experience")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${interview.workExperience} years`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Skills")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(interview.skills || '')],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            text: "Assessment Results",
            heading: "Heading2",
            spacing: { before: 400, after: 200 }
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Overall Score")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${interview.overallScore}%`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Resume Match Score")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${interview.resumeMatchScore}%`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Technical Skills")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${interview.technicalSkillsScore}%`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Communication Skills")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${interview.communicationSkillsScore}%`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Problem Solving")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${interview.problemSolvingSkillsScore}%`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Cultural Fit")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${interview.culturalFitScore}%`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            text: "MCQ Test Results",
            heading: "Heading2",
            spacing: { before: 400, after: 200 }
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Total Score")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${mcqScores.total.correct}/${mcqScores.total.total}`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Technical Questions")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${mcqScores.technical.correct}/${mcqScores.technical.total}`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Aptitude Questions")],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(`${mcqScores.aptitude.correct}/${mcqScores.aptitude.total}`)],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            text: "Feedback",
            heading: "Heading2",
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: interview.feedback || '',
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "Resume Match Feedback",
            heading: "Heading2",
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: interview.resumeMatchFeedback || '',
            spacing: { after: 400 }
          }),
        ],
      }],
    });

    // Generate and download the document
    Packer.toBlob(doc).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Interview_Report_${interview.firstName}_${interview.lastName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  };

  const exportReport = () => {
    generateWordReport();
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Interview Report</h1>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${interview?.email}`} />
                  <AvatarFallback>{interview?.firstName?.[0]}{interview?.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{interview?.firstName} {interview?.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{interview?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{interview?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{interview?.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Education</p>
                  <p>{interview?.education}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p>{interview?.workExperience} years</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Overall Score:</span>
                <span className={`text-xl font-bold ${getScoreColor(interview?.overallScore || 0)}`}>
                  {interview?.overallScore || 0}%
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
                  <span className={getScoreColor(interview?.technicalSkillsScore || 0)}>
                    {interview?.technicalSkillsScore || 0}%
                  </span>
                </div>
                <Progress value={interview?.technicalSkillsScore || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Communication</span>
                  <span className={getScoreColor(interview?.communicationSkillsScore || 0)}>
                    {interview?.communicationSkillsScore || 0}%
                  </span>
                </div>
                <Progress value={interview?.communicationSkillsScore || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Problem Solving</span>
                  <span className={getScoreColor(interview?.problemSolvingSkillsScore || 0)}>
                    {interview?.problemSolvingSkillsScore || 0}%
                  </span>
                </div>
                <Progress value={interview?.problemSolvingSkillsScore || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Cultural Fit</span>
                  <span className={getScoreColor(interview?.culturalFitScore || 0)}>
                    {interview?.culturalFitScore || 0}%
                  </span>
                </div>
                <Progress value={interview?.culturalFitScore || 0} className="h-2" />
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
                  <span className={getScoreColor(interview?.resumeMatchScore || 0)}>
                    {interview?.resumeMatchScore || 0}%
                  </span>
                </div>
                <Progress value={interview?.resumeMatchScore || 0} className="h-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Feedback</p>
                <p className="text-sm whitespace-pre-wrap break-words">{interview?.resumeMatchFeedback}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">MCQ Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Score:</span>
              <span className="text-xl font-bold text-green-600">
                {mcqScores.total.correct}/{mcqScores.total.total}
              </span>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Technical MCQs:</span>
                <span className="text-sm font-medium">{mcqScores.technical.correct}/{mcqScores.technical.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Aptitude MCQs:</span>
                <span className="text-sm font-medium">{mcqScores.aptitude.correct}/{mcqScores.aptitude.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap break-words">{interview?.feedback}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InterviewReport;