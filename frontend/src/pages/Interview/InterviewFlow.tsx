import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ResumeUploadStage } from "@/components/interview/stages/ResumeUploadStage";
import { useInterviewResponseProcessor } from "@/components/interview/InterviewResponseProcessor";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { jobAPI } from "@/services/jobApi";

export function InterviewFlow() {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<number>(0);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");

  useEffect(() => {
    const verifyInterviewLink = async () => {
      try {
        const jobId = urlSearchParams.get("job_id");

        // Check if job_id is missing or invalid
        if (!jobId) {
          setError("Missing job ID. Please use a valid interview link.");
          setIsLoading(false);
          return;
        }

        const response = await jobAPI.candidateGetJob(jobId);
        const data = response.data;
        setJobId(data.id);
        setJobTitle(data.title);
        setCompanyName(data.company_name);
        setJobDescription(data.description);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setError("Invalid interview link");
        setIsLoading(false);
      }
    };

    verifyInterviewLink();
  }, [urlSearchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">{error}</h1>
          <p className="text-muted-foreground mb-6">
            We recommend reviewing the job requirements and updating your resume
            before trying again.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {jobId > 0 && (
        <ResumeUploadStage
          jobTitle={jobTitle}
          companyName={companyName}
          jobId={jobId}
        />
      )}
    </div>
  );
}

export default InterviewFlow;
