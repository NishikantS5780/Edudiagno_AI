import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { publicInterviewApi } from "@/lib/api";

interface JobDetails {
  id: number;
  title: string;
  company: {
    id: number;
    name: string;
    logo: string | null;
  };
  location: string;
  type: string;
  description: string;
  created_at: string;
  isActive: boolean;
  benefits: string;
  requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
}

const PublicInterview = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!accessCode) {
        setError("Invalid interview link");
        setLoading(false);
        return;
      }
      
      try {
        const response = await publicInterviewApi.getByAccessCode(accessCode);
        const data = response.data;
        
        console.log('Full API Response:', JSON.stringify(data, null, 2));
        console.log('Job object:', JSON.stringify(data.job, null, 2));
        
        // Check if the link is active and not expired
        if (!data.is_active) {
          setError("This interview link is no longer active.");
          setLoading(false);
          return;
        }
        
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("This interview link has expired.");
          setLoading(false);
          return;
        }
        
        // Transform the API response to match our JobDetails interface
        const jobDetails = {
          id: data.job.id,
          title: data.job.title,
          company: {
            id: data.job.company.id,
            name: data.job.company.name,
            logo: data.job.company.logo || "https://placehold.co/100"
          },
          location: data.job.location,
          type: data.job.type,
          description: data.job.description || '',
          created_at: data.job.created_at,
          isActive: data.is_active,
          benefits: data.job.benefits || '',
          requirements: data.job.requirements || '',
          salary_min: data.job.salary_min,
          salary_max: data.job.salary_max,
          show_salary: data.job.show_salary
        };
        
        console.log('Transformed Job Details:', JSON.stringify(jobDetails, null, 2));
        setJobDetails(jobDetails);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Could not load interview details. The link may be invalid or expired.");
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [accessCode]);
  
  // Add effect to log benefits when jobDetails changes
  useEffect(() => {
    if (jobDetails) {
      console.log('Rendering benefits:', jobDetails.benefits);
      console.log('Benefits type:', typeof jobDetails.benefits);
    }
  }, [jobDetails]);
  
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
            <Button onClick={() => navigate("/")}>
              Return Home
            </Button>
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
            <Button onClick={() => navigate("/")}>
              Return Home
            </Button>
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
              src={jobDetails.company.logo} 
              alt={jobDetails.company.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h2 className="font-semibold">{jobDetails.company.name}</h2>
              <p className="text-sm text-muted-foreground">{jobDetails.location}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Job Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobDetails.description || 'No description available'}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Requirements</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobDetails.requirements || 'No requirements listed'}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Benefits</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobDetails.benefits || 'No benefits listed'}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Compensation</h3>
            <p className="text-muted-foreground">
              {jobDetails.show_salary && jobDetails.salary_min && jobDetails.salary_max
                ? `$${jobDetails.salary_min.toLocaleString()} - $${jobDetails.salary_max.toLocaleString()}`
                : 'Not specified'}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Interview Process</h3>
            <p className="text-muted-foreground">
              This interview will be conducted using our AI-powered platform. You'll be asked to:
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
              onClick={() => navigate(`/interview/${accessCode}/start`)}
            >
              Start Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicInterview;
