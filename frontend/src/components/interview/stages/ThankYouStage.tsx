import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, ArrowRight, Download, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { TranscriptItem } from "@/types/candidate";

interface ThankYouStageProps {
  companyName: string;
  transcript?: TranscriptItem[];
  score?: number;
  feedback?: string;
  jobTitle?: string;
}

const ThankYouStage: React.FC<ThankYouStageProps> = ({ 
  companyName, 
  transcript, 
  score,
  feedback,
  jobTitle
}) => {
  const handleDownloadTranscript = () => {
    if (!transcript || transcript.length === 0) return;
    
    // Format transcript for download
    const textContent = transcript.map(item => {
      return `[${new Date(item.timestamp).toLocaleTimeString()}] ${item.speaker === 'ai' ? 'Interviewer' : 'You'}: ${item.text}`;
    }).join('\n\n');
    
    // Create downloadable file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, '-').toLowerCase()}-interview-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-8 flex flex-col items-center text-center space-y-6">
      <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
      </div>
      
      <div className="space-y-2 max-w-xl">
        <h2 className="text-2xl font-bold">Thank You for Completing Your Interview!</h2>
        <p className="text-muted-foreground">
          Your interview for the {jobTitle || "open position"} with {companyName} has been successfully recorded and submitted for review.
          We appreciate your time and interest in joining our team.
        </p>
      </div>
      
      {score !== undefined && (
        <div className="bg-muted/50 rounded-xl p-4 w-full max-w-md">
          <h3 className="font-medium text-left mb-2">Performance Summary</h3>
          <div className="flex items-center justify-between mb-3">
            <span>Overall Match:</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(score * 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
          {feedback && (
            <div className="text-sm text-left p-3 bg-background rounded-md">
              <p>{feedback}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-muted/50 rounded-xl p-6 w-full max-w-md space-y-4">
        <h3 className="font-medium text-left">What Happens Next?</h3>
        
        <div className="flex gap-4 text-left">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">1</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Review Process</h4>
            <p className="text-sm text-muted-foreground">
              Our team will review your interview responses within the next 5-7 business days.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 text-left">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">2</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Email Notification</h4>
            <p className="text-sm text-muted-foreground">
              You'll receive an email with feedback and next steps, whether you're moving forward or not.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 text-left">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">3</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Possible Next Round</h4>
            <p className="text-sm text-muted-foreground">
              If selected, you may be invited for a follow-up interview with our team.
            </p>
          </div>
        </div>
      </div>
      
      <div className="pt-4 w-full max-w-md">
        <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3 mb-6">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Please allow up to one week for us to review your interview.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/">
              Return to Home
            </Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link to="/jobs">
              Browse More Opportunities <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {transcript && transcript.length > 0 && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleDownloadTranscript}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Interview Transcript
          </Button>
        )}
      </div>
    </div>
  );
};

export default ThankYouStage;