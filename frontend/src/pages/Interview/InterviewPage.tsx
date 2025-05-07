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
  const [expandedSections, setExpandedSections] = useState({
    description: false,
    requirements: false,
    benefits: false
  });

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

        console.log('Raw API Response:', data);
        console.log('Currency from API:', data.currency);

        setJobDetails({
          id: data.id,
          title: data.title,
          location: data.location,
          city: data.city,
          type: data.type,
          description: data.description || "",
          createdAt: data.created_at,
          benefits: data.benefits || "",
          requirements: data.requirements || "",
          salaryMin: data.salary_min,
          salaryMax: data.salary_max,
          currency: data.currency,

          companyId: data.company_id,
          companyName: data.company_name,
          companyLogo: data.company_logo || "https://placehold.co/100",
        });

        console.log('Job Details after setting:', jobDetails);

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

  const toggleSection = (section: 'description' | 'requirements' | 'benefits') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
    <div>
      {/* Top Bar */}
      <div className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-xl">{jobDetails.companyName}</span>
            <span className="h-6 w-px bg-border"></span>
            <span className="text-muted-foreground text-sm">powered by Edudiagno AI Interviewer</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Hey there, interview champion! Ready to crush it?</h1>
          <p className="text-muted-foreground">
            We appreciate your participation and look forward to providing you with a seamless, efficient, and professional interview
            experience that will assess communication, technical skills and suitability to the interview owner(employer)
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-primary/5 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Job Role</span>
              </div>
              <div className="font-medium">{jobDetails?.title}</div>
            </div>
            <div className="bg-primary/5 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Work Experience</span>
              </div>
              <div className="font-medium">Mid Level (1-4 Years)</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <img
                src={jobDetails?.companyLogo || "https://placehold.co/30"}
                alt={jobDetails?.companyName}
                className="w-6 h-6 rounded object-cover"
              />
              <span>{jobDetails?.companyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
              <span>10min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
              <span>Video Interview</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
              <span>English</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <p className={`text-muted-foreground whitespace-pre-wrap ${!expandedSections.description && "line-clamp-3"}`}>
                    {jobDetails?.description || "No description available"}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium underline"
                    onClick={() => toggleSection('description')}
                  >
                    {expandedSections.description ? "Show Less" : "Read More"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Requirements</h3>
                  <p className={`text-muted-foreground whitespace-pre-wrap ${!expandedSections.requirements && "line-clamp-3"}`}>
                    {jobDetails?.requirements || "No requirements listed"}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium underline"
                    onClick={() => toggleSection('requirements')}
                  >
                    {expandedSections.requirements ? "Show Less" : "Read More"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Benefits</h3>
                  <p className={`text-muted-foreground whitespace-pre-wrap ${!expandedSections.benefits && "line-clamp-3"}`}>
                    {jobDetails?.benefits || "No benefits listed"}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium underline"
                    onClick={() => toggleSection('benefits')}
                  >
                    {expandedSections.benefits ? "Show Less" : "Read More"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Compensation</h3>
                  <p className="text-muted-foreground">
                    {(() => {
                      if (!jobDetails?.salaryMin || !jobDetails?.salaryMax || !jobDetails?.currency) {
                        return "Not specified";
                      }
                      console.log('Current currency:', jobDetails.currency);
                      const currencySymbols: Record<string, string> = {
                        'INR': '₹',
                        'USD': '$',
                        'EUR': '€',
                        'GBP': '£'
                      };
                      const currencySymbol = currencySymbols[jobDetails.currency] || '';
                      console.log('Selected currency symbol:', currencySymbol);
                      return `${currencySymbol}${jobDetails.salaryMin.toLocaleString()} - ${jobDetails.salaryMax.toLocaleString()} ${jobDetails.currency}`;
                    })()}
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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm text-muted-foreground">Workplace Type</h3>
                  <p className="font-medium">{jobDetails?.type === 'onsite' ? 'On-Site' : jobDetails?.type === 'remote' ? 'Remote' : 'Hybrid'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm text-muted-foreground">Employment Type</h3>
                  <p className="font-medium">Full-Time</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm text-muted-foreground">Location</h3>
                  <p className="font-medium">
                    {jobDetails?.type === 'remote' 
                      ? `Remote${jobDetails?.city ? `, ${jobDetails.city}` : ''}`
                      : jobDetails?.city || 'Not specified'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Major Skills to be assessed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-secondary px-3 py-1 rounded-full text-sm">Python</span>
                  <span className="bg-secondary px-3 py-1 rounded-full text-sm">Data Modeling</span>
                  <span className="bg-secondary px-3 py-1 rounded-full text-sm">SQL</span>
                  <span className="bg-secondary px-3 py-1 rounded-full text-sm">AWS</span>
                  <span className="bg-secondary px-3 py-1 rounded-full text-sm">Big Data</span>
                </div>
              </CardContent>
            </Card>

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
              Let's Proceed
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
