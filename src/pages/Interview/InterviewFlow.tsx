import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { publicInterviewApi } from '@/lib/api';
import { ResumeUploadStage } from '@/components/interview/stages/ResumeUploadStage';
import CompatibilityCheckStage from '@/components/interview/stages/CompatibilityCheckStage';
import { useInterviewResponseProcessor } from '@/components/interview/InterviewResponseProcessor';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { questionsApi } from '@/lib/api';

export function InterviewFlow() {
  const { accessCode } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [candidate, setCandidate] = useState<any>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<'resume' | 'compatibility'>('resume');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [interviewId, setInterviewId] = useState<number | null>(null);

  const { generateQuestion } = useInterviewResponseProcessor();

  useEffect(() => {
    const verifyInterviewLink = async () => {
      try {
        const response = await publicInterviewApi.getByAccessCode(accessCode!);
        setJobId(response.data.job_id);
        setJobTitle(response.data.job.title);
        setCompanyName(response.data.job.company_name);
        setJobDescription(response.data.job.description);
        setInterviewId(response.data.id);
        setIsLoading(false);
      } catch (error) {
        setError('Invalid interview link');
        setIsLoading(false);
      }
    };

    verifyInterviewLink();
  }, [accessCode]);

  const handleResumeComplete = async (data: { candidate: any; matchAnalysis: any; resumeText: string }) => {
    setCandidate(data.candidate);
    setMatchAnalysis(data.matchAnalysis);
    setResumeText(data.resumeText);
    
    // Generate initial questions based on resume analysis
    if (interviewId) {
      try {
        const questions = await generateQuestion({
          jobDescription,
          resumeText: data.resumeText,
          questionTypes: ['behavioral', 'resume_based', 'job_based'],
          maxQuestions: 10,
          interviewId
        });
        
        if (questions) {
          setCurrentStage('compatibility');
        }
      } catch (error) {
        toast.error('Failed to generate interview questions');
      }
    }
  };

  const handleCompatibilityContinue = async () => {
    try {
      setIsLoading(true);
      // Generate initial questions
      const questions = await questionsApi.generateQuestions(jobId, resumeText);
      if (questions) {
        navigate(`/interview/${accessCode}/setup`);
      }
    } catch (error) {
      toast.error('Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompatibilityRejected = () => {
    setError('Your profile does not match the job requirements.');
  };

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
            We recommend reviewing the job requirements and updating your resume before trying again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {currentStage === 'resume' && (
        <ResumeUploadStage
          jobTitle={jobTitle}
          companyName={companyName}
          jobId={jobId}
          onComplete={handleResumeComplete}
          isLoading={isLoading}
        />
      )}

      {currentStage === 'compatibility' && (
        <CompatibilityCheckStage
          isLoading={isLoading}
          matchScore={matchAnalysis?.match_score}
          feedback={matchAnalysis?.feedback}
          onContinue={handleCompatibilityContinue}
          onRejected={handleCompatibilityRejected}
        />
      )}
    </div>
  );
}

export default InterviewFlow; 