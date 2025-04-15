import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { jobAPI } from "@/lib/api";
import { CandidateJobData } from "@/types/job";

const InterviewPage = () => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState<CandidateJobData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobId = urlSearchParams.get("job_id");
        
        // Check if job_id is missing or invalid
        if (!jobId) {
          setError("Missing job ID. Please use a valid interview link.");
          setLoading(false);
          return;
        }
        
        const response = await jobAPI.candidateGetJob(jobId);
        const data = response.data;

        setJobDetails({
          id: data.id,
          title: data.title,
          location: data.location,
          type: data.type,
          description: data.description || "",
          createdAt: data.created_at,
          benefits: data.benefits || "",
          requirements: data.requirements || "",
          salaryMin: data.salary_min,
          salaryMax: data.salary_max,

          companyId: data.company_id,
          companyName: data.company_name,
          companyLogo: data.company_logo || "https://placehold.co/100",
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(
          "Could not load interview details. The link may be invalid or expired."
        );
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [urlSearchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Interview Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The interview link you're looking for could not be found.
            </p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{jobDetails.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={jobDetails.companyLogo}
              alt={jobDetails.companyName}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h2 className="font-semibold">{jobDetails.companyName}</h2>
              <p className="text-sm text-muted-foreground">
                {jobDetails.location}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Job Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobDetails.description || "No description available"}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Requirements</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobDetails.requirements || "No requirements listed"}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Benefits</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobDetails.benefits || "No benefits listed"}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Compensation</h3>
            <p className="text-muted-foreground">
              {jobDetails.salaryMin && jobDetails.salaryMax
                ? `$${jobDetails.salaryMin.toLocaleString()} - $${jobDetails.salaryMax.toLocaleString()}`
                : "Not specified"}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Interview Process</h3>
            <p className="text-muted-foreground">
              This interview will be conducted using our AI-powered platform.
              You'll be asked to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Upload your resume</li>
              <li>Complete a compatibility check</li>
              <li>Record video responses to interview questions</li>
              <li>Receive immediate feedback on your performance</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() =>
                navigate(
                  `/interview/compatibility?job_id=${urlSearchParams.get(
                    "job_id"
                  )}`
                )
              }
            >
              Start Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewPage;
