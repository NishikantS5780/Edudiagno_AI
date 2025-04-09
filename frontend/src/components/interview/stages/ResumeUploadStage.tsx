import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResumeUpload } from '@/components/common/ResumeUpload';
import { resumeApi } from '@/lib/api';
import InterviewSchedulingStage from '@/components/interview/stages/InterviewSchedulingStage';
import { useNavigate, useParams } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ResumeUploadStageProps {
  jobTitle: string;
  companyName: string;
  jobId: number;
  onComplete: (candidate: any, matchAnalysis: any) => void;
  isLoading?: boolean;
}

export function ResumeUploadStage({ 
  jobTitle, 
  companyName,
  jobId,
  onComplete,
  isLoading = false
}) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState<any>(null);
  const [showScheduling, setShowScheduling] = useState(false);
  const navigate = useNavigate();
  const { accessCode } = useParams<{ accessCode: string }>();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Handle resume upload
  const handleUpload = (file: File) => {
    if (isCompleted) return;
    setResumeFile(file);
    setUploadProgress(0);
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (isCompleted) return;
    
    if (!resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload resume to server
      console.log('Starting resume upload...');
      const uploadResponse = await resumeApi.uploadResume(resumeFile, jobId);
      console.log('Resume upload response:', uploadResponse);
      setUploadProgress(50);

      if (!uploadResponse.file_path) {
        throw new Error('No file path returned from server');
      }

      if (!uploadResponse.job_id) {
        throw new Error('No job ID returned from server');
      }

      // Analyze resume
      console.log('Starting resume analysis...');
      const analysisResponse = await resumeApi.analyzeResume(
        uploadResponse.file_path,
        uploadResponse.job_id
      );
      console.log('Resume analysis response:', analysisResponse);
      setUploadProgress(100);

      toast.success("Resume processed successfully!");
      setIsCompleted(true);
      setMatchAnalysis(analysisResponse.match_analysis);
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
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleNow = () => {
    // Navigate to the interview setup stage
    navigate(`/interview/${accessCode}/setup`);
  };

  const handleScheduleLater = () => {
    // Here you would typically make an API call to schedule the interview for later
    // For now, we'll just show a success message and navigate back
    toast.success("We've sent you an email with the interview link. Please complete it within 48 hours.");
    // You would typically navigate to a thank you page or home page
  };

  if (isCompleted && matchAnalysis) {
    if (showScheduling) {
      return (
        <InterviewSchedulingStage
          jobTitle={jobTitle}
          companyName={companyName}
          onScheduleNow={handleScheduleNow}
          onScheduleLater={handleScheduleLater}
        />
      );
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-xl font-semibold">Resume Successfully Processed!</h2>
            <p className="text-muted-foreground">
              Your resume has been analyzed and we've determined your compatibility with the position.
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-6 space-y-4">
            <div className="flex justify-center mb-4">
              <div className="bg-background rounded-full h-6 w-64 overflow-hidden">
                <div 
                  className={`h-full ${matchAnalysis.match_score >= 60 ? 'bg-green-500' : 'bg-orange-500'}`} 
                  style={{ width: `${matchAnalysis.match_score}%` }}
                />
              </div>
              <span className="ml-2 font-semibold">{matchAnalysis.match_score}%</span>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {matchAnalysis.match_score >= 60 ? 'Great Match!' : 'Not Quite a Match'}
              </h3>
              <p className="text-muted-foreground">
                {matchAnalysis.match_score >= 60 
                  ? 'Your profile matches well with the job requirements!' 
                  : 'Your profile doesn\'t seem to be a strong match for this position.'}
              </p>
            </div>

            {matchAnalysis.feedback && (
              <div className="bg-background p-4 rounded-md">
                <h4 className="font-medium mb-2">Feedback:</h4>
                <p className="text-sm">{matchAnalysis.feedback}</p>
              </div>
            )}

            <div className="pt-4 text-center">
              {matchAnalysis.match_score >= 60 ? (
                <Button 
                  onClick={() => setShowScheduling(true)}
                  className="w-full"
                >
                  Continue to Interview
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => onComplete(null, matchAnalysis)}
                  className="w-full"
                >
                  View Other Opportunities
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Apply for {jobTitle} at {companyName}</h2>
          <p className="text-muted-foreground">
            Upload your resume and provide your contact information to begin the interview process.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Resume Upload</h3>
            <ResumeUpload onUpload={handleUpload} disabled={isSubmitting || isCompleted} />
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
                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Your Information</h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  {...form.register("name")}
                  placeholder="John Doe"
                  disabled={isSubmitting || isCompleted}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {String(form.formState.errors.name.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="you@example.com"
                  disabled={isSubmitting || isCompleted}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {String(form.formState.errors.email.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  {...form.register("phone")}
                  placeholder="(123) 456-7890"
                  disabled={isSubmitting || isCompleted}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {String(form.formState.errors.phone.message)}
                  </p>
                )}
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
        </div>
      </div>
    </div>
  );
}