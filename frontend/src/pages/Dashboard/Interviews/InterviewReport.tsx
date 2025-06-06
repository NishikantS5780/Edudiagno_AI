import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InterviewData } from "@/types/interview";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import html2canvas from "html2canvas";
import { MCQResponse, MCQuestion } from "@/types/job";
import { interviewAPI } from "@/services/interviewApi";
import { quizAPI } from "@/services/quizApi";

interface InterviewReportProps {
  jobTitle: string;
}

const InterviewReport = ({ jobTitle }: InterviewReportProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizResponses, setQuizResponses] = useState<MCQResponse[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<MCQuestion[]>([]);
  const [mcqScores, setMcqScores] = useState({
    total: { correct: 0, total: 0 },
    technical: { correct: 0, total: 0 },
    aptitude: { correct: 0, total: 0 },
  });

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        if (!id) {
          return;
        }
        const response = await interviewAPI.getInterview(id.toString());

        if (!response.data) {
          toast.error("Interview not found");
          navigate("/dashboard/interviews");
          return;
        }

        const quizResponse = await quizAPI.getQuizQuestions(id as string);
        const quizQuestionsResponse = await quizAPI.getQuizQuestions(
          id as string
        );

        setQuizResponses(quizResponse.data);
        setQuizQuestions(quizQuestionsResponse.data);

        setInterview(response.data);
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
        aptitude: { correct: 0, total: 0 },
      };

      quizQuestions.forEach((question) => {
        const responses = quizResponses.filter(
          (r) => r.question_id === question.id
        );
        const selectedOptionIds = responses.map((r) => r.option_id);
        const correctOptions = question.options
          ?.filter((opt) => opt.correct)
          .map((opt) => opt.id);

        const isFullyCorrect = selectedOptionIds.every((id) =>
          correctOptions?.includes(id)
        );
        const allCorrectOptionsSelected = correctOptions?.every((id) => {
          if (!id) {
            return;
          }
          selectedOptionIds.includes(id);
        });
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

  const getScoreColor = (score: number | undefined) => {
    if (!score) return "#4b5563"; // Default gray color for undefined scores
    if (score >= 85) return "#059669"; // Green for high scores
    if (score >= 70) return "#2563eb"; // Blue for medium scores
    return "#dc2626"; // Red for low scores
  };

  const generatePDFReport = async () => {
    if (!interview) return;

    // Create a temporary div to hold our report content
    const reportDiv = document.createElement("div");
    reportDiv.style.padding = "40px";
    reportDiv.style.fontFamily = "Arial, sans-serif";
    reportDiv.style.backgroundColor = "#ffffff";
    reportDiv.style.color = "#000000";
    reportDiv.style.width = "800px"; // Set a fixed width for better control
    document.body.appendChild(reportDiv);

    // Add content to the report div with improved styling
    reportDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
        <h1 style="font-size: 32px; margin-bottom: 15px; color: #1e40af; font-weight: bold;">Interview Report</h1>
        <h2 style="font-size: 24px; color: #1e3a8a; margin-bottom: 10px;">${
          interview.first_name
        } ${interview.last_name}</h2>
        <p style="font-size: 16px; color: #4b5563;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>

      <div style="margin-bottom: 40px; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <h3 style="font-size: 22px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">Candidate Information</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
          <tr>
            <td style="width: 30%; padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Email</td>
            <td style="width: 70%; padding: 12px; border: 1px solid #e2e8f0;">${
              interview.email || "N/A"
            }</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Phone</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${
              interview.phone || "N/A"
            }</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Location</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${
              interview.location || "N/A"
            }</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Education</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${
              interview.education || "N/A"
            }</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Experience</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${
              interview.work_experience
            } years</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Skills</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${
              interview.skills || "N/A"
            }</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 40px; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <h3 style="font-size: 22px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">Assessment Results</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
          <tr>
            <td style="width: 30%; padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Overall Score</td>
            <td style="width: 70%; padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${getScoreColor(
              interview.overall_score
            )}">${interview.overall_score || 0}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Resume Match Score</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${getScoreColor(
              interview.resume_match_score
            )}">${interview.resume_match_score || 0}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Technical Skills</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${getScoreColor(
              interview.technical_skills_score
            )}">${interview.technical_skills_score || 0}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Communication Skills</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${getScoreColor(
              interview.communication_skills_score
            )}">${interview.communication_skills_score || 0}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Problem Solving</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${getScoreColor(
              interview.problem_solving_skills_score
            )}">${interview.problem_solving_skills_score || 0}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Cultural Fit</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${getScoreColor(
              interview.cultural_fit_score
            )}">${interview.cultural_fit_score || 0}%</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 40px; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <h3 style="font-size: 22px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">MCQ Test Results</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
          <tr>
            <td style="width: 30%; padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Total Score</td>
            <td style="width: 70%; padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #059669">${
              mcqScores.total.correct
            }/${mcqScores.total.total}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Technical Questions</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #2563eb">${
              mcqScores.technical.correct
            }/${mcqScores.technical.total}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f1f5f9; font-weight: bold;">Aptitude Questions</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #2563eb">${
              mcqScores.aptitude.correct
            }/${mcqScores.aptitude.total}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 40px; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <h3 style="font-size: 22px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">Feedback</h3>
        <div style="font-size: 16px; line-height: 1.6; color: #1f2937; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border: 1px solid #e2e8f0; border-radius: 4px;">
          ${interview.feedback || "No feedback provided"}
        </div>
      </div>

      <div style="margin-bottom: 40px; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <h3 style="font-size: 22px; color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">Resume Match Feedback</h3>
        <div style="font-size: 16px; line-height: 1.6; color: #1f2937; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border: 1px solid #e2e8f0; border-radius: 4px;">
          ${
            interview.resume_match_feedback ||
            "No resume match feedback provided"
          }
        </div>
      </div>
    `;

    try {
      // Convert the div to canvas with improved quality
      const canvas = await html2canvas(reportDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800,
        windowHeight: reportDiv.offsetHeight,
      });

      // Create PDF with improved quality
      // const pdf = new jsPDF({
      //   orientation: 'p',
      //   unit: 'mm',
      //   format: 'a4',
      //   compress: true
      // });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;
      let pageHeight = 297; // A4 height in mm

      // Add the first page
      // pdf.addImage(
      //   canvas.toDataURL("image/jpeg", 1.0),
      //   "JPEG",
      //   0,
      //   position,
      //   imgWidth,
      //   imgHeight
      // );
      // position -= imgHeight;

      // // Add new pages if content overflows
      // while (position < -imgHeight) {
      //   pdf.addPage();
      //   pdf.addImage(
      //     canvas.toDataURL("image/jpeg", 1.0),
      //     "JPEG",
      //     0,
      //     position,
      //     imgWidth,
      //     imgHeight
      //   );
      //   position -= imgHeight;
      // }

      // // Download the PDF
      // pdf.save(
      //   `Interview_Report_${interview.firstName}_${interview.lastName}.pdf`
      // );
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      // Clean up
      document.body.removeChild(reportDiv);
    }
  };

  const exportReport = () => {
    generatePDFReport();
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
          {interview.report_file_url ? (
            <a
              href={interview.report_file_url}
              className="flex gap-1 items-center bg-accent rounded p-2 hover:bg-accent/90 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </a>
          ) : interview.status == "incomplete" ? (
            <div className="text-destructive">Interview incomplete!</div>
          ) : (
            <div className="text-amber-600">Report not Generated yet!</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${interview?.email}`}
                  />
                  <AvatarFallback>
                    {interview?.first_name?.[0]}
                    {interview?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {interview?.first_name} {interview?.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {interview?.email}
                  </p>
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
                  <p>{interview?.work_experience} years</p>
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
                <span
                  className={`text-xl font-bold ${getScoreColor(
                    interview?.overall_score
                  )}`}
                >
                  {interview?.overall_score || 0}%
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
                  <span
                    className={getScoreColor(interview?.technical_skills_score)}
                  >
                    {interview?.technical_skills_score || 0}%
                  </span>
                </div>
                <Progress
                  value={interview?.technical_skills_score || 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Communication</span>
                  <span
                    className={getScoreColor(
                      interview?.communication_skills_score
                    )}
                  >
                    {interview?.communication_skills_score || 0}%
                  </span>
                </div>
                <Progress
                  value={interview?.communication_skills_score || 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Problem Solving</span>
                  <span
                    className={getScoreColor(
                      interview?.problem_solving_skills_score
                    )}
                  >
                    {interview?.problem_solving_skills_score || 0}%
                  </span>
                </div>
                <Progress
                  value={interview?.problem_solving_skills_score || 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Cultural Fit</span>
                  <span
                    className={getScoreColor(interview?.cultural_fit_score)}
                  >
                    {interview?.cultural_fit_score || 0}%
                  </span>
                </div>
                <Progress
                  value={interview?.cultural_fit_score || 0}
                  className="h-2"
                />
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
                  <span
                    className={getScoreColor(interview?.resume_match_score)}
                  >
                    {interview?.resume_match_score || 0}%
                  </span>
                </div>
                <Progress
                  value={interview?.resume_match_score || 0}
                  className="h-2"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Feedback</p>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {interview?.resume_match_feedback}
                </p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap break-words">
              {interview?.feedback}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InterviewReport;
