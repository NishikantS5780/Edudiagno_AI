import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeUpload } from "@/components/common/ResumeUpload";
import { useNavigate, useParams } from "react-router-dom";
import { interviewAPI, resumeAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { InterviewData } from "@/types/interview";
import { MatchResultsStage } from "./MatchResultsStage";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
});

type FormValues = z.infer<typeof formSchema>;

export function ResumeUploadStage({ jobTitle, companyName, jobId }) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [candidateData, setCandidateData] = useState<InterviewData>();
  const [matchAnalysis, setMatchAnalysis] = useState<{
    matchScore: number;
    matchFeedback: string;
  }>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const { accessCode } = useParams<{ accessCode: string }>();

  const handleResumeChange = (file: File) => {
    if (isCompleted) return;
    const extractResumeData = async () => {
      setIsLoading(true);
      const res = await resumeAPI.extractResumeData(file);
      const data = res.data;
      setCandidateData({
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        resumeText: data.resume_text,
        workExperience: Number(data.work_experience),
        education: data.education,
        skills: data.skills.join(","),
        linkedinUrl: data.linkedin_url,
        portfolioUrl: data.portfolio_url,
      });
      setIsLoading(false);
    };
    extractResumeData();
    setResumeFile(file);
  };

  const handleSubmitApplication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isCompleted) return;

    if (!resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    setIsSubmitting(true);
    const createInterview = async () => {
      try {
        const res = await interviewAPI.createInterview(candidateData, jobId);
        const data = res.data;
        setCandidateData({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          resumeText: data.resume_text,
          workExperience: data.work_experience,
          education: data.education,
          skills: data.skills,
          linkedinUrl: data.linkedin_url,
          portfolioUrl: data.portfoio_url,
        });
        const token = res.headers["authorization"].split("Bearer ")[1];
        localStorage.setItem("i_token", token);

        await interviewAPI.uploadResume(resumeFile);

        const analysisResponse = await interviewAPI.analyzeCandidate();
        const analysisData = analysisResponse.data;

        toast.success("Resume processed successfully!");
        setIsCompleted(true);
        setMatchAnalysis({
          matchScore: Number(analysisData.resume_match_score),
          matchFeedback: analysisData.resume_match_feedback,
        });
      } catch (error) {
        console.error("Error processing resume:", error);
        let errorMessage = "Error processing your resume. Please try again.";

        if (error.response?.data?.detail) {
          errorMessage = String(error.response.data.detail);
        } else if (error.response?.data?.errors) {
          // Handle validation errors
          const errors = error.response.data.errors;
          errorMessage = errors.map((err: any) => String(err.msg)).join(", ");
        } else if (error.message) {
          errorMessage = String(error.message);
        }

        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };
    createInterview();
  };

  const handleStartInterview = () => {
    navigate(`/interview/setup?i_id=${candidateData.id}`);
  };

  const handleMatchAnalysis = async (analysis: MatchAnalysis) => {
    setMatchAnalysis(analysis);
    setMatchScore(Number(analysis.matchScore));
    setMatchFeedback(analysis.matchFeedback);
    setShowMatchResults(true);
  };

  if (isCompleted && matchAnalysis) {
    return (
      <MatchResultsStage
        matchScore={matchAnalysis.matchScore.toString()}
        matchFeedback={matchAnalysis.matchFeedback}
        jobTitle={jobTitle}
        companyName={companyName}
        interviewId={candidateData.id}
        onScheduleLater={() => {
          // Here you would typically make an API call to schedule the interview for later
          toast.success("Interview scheduled for later. Check your email for details.");
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {isLoading && (
        <div className="absolute h-full w-full bg-gray-700/85 backdrop-blur-sm  top-0 left-0 flex flex-col items-center justify-center">
          <div>Extracting Resume Data</div>
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            Apply for {jobTitle} at {companyName}
          </h2>
          <p className="text-muted-foreground">
            Upload your resume and provide your contact information to begin the
            interview process.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Resume Upload</h3>
            <ResumeUpload
              onUpload={handleResumeChange}
              disabled={isSubmitting || isCompleted}
            />
            {resumeFile && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">{resumeFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResumeFile(null)}
                    className="text-destructive hover:text-destructive"
                    disabled={isSubmitting || isCompleted}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          {candidateData && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                Verify Your Information
              </h3>
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <Input
                    value={candidateData.firstName + candidateData.lastName}
                    placeholder="John Doe"
                    disabled={isSubmitting || isCompleted}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <Input
                    value={candidateData.email}
                    type="email"
                    placeholder="you@example.com"
                    disabled={isSubmitting || isCompleted}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={candidateData.phone}
                    placeholder="(123) 456-7890"
                    disabled={isSubmitting || isCompleted}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isCompleted || !resumeFile}
                >
                  {isSubmitting ? "Processing..." : "Submit Application"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
