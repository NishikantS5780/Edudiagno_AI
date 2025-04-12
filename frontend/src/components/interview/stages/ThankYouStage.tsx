import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Download, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface ThankYouStageProps {
  companyName: string;
  jobTitle: string;
  transcript: Array<{
    speaker: string;
    text: string;
    timestamp: string;
  }>;
  feedback?: {
    score: number;
    feedback: string;
    suggestions: string[];
    scoreBreakdown: {
      technicalSkills: number;
      communication: number;
      problemSolving: number;
      culturalFit: number;
    };
  } | null;
}

const ThankYouStage: React.FC<ThankYouStageProps> = ({
  companyName,
  jobTitle,
  transcript,
  feedback,
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const handleDownloadTranscript = () => {
    if (!transcript || transcript.length === 0) return;
    
    // Format transcript for download
    let textContent = transcript.map(item => {
      return `[${new Date(item.timestamp).toLocaleTimeString()}] ${item.speaker === 'ai' ? 'Interviewer' : 'You'}: ${item.text}`;
    }).join('\n\n');

    // Add feedback section if available
    if (feedback) {
      textContent += "\n\n=== Interview Feedback ===\n\n";
      textContent += `Overall Score: ${feedback.score}/10\n\n`;
      textContent += `Feedback:\n${feedback.feedback}\n\n`;
      textContent += `Suggestions for Improvement:\n${feedback.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    }
    
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

  const handleRatingSubmit = () => {
    // Here you would typically send the rating and feedback to your backend
    toast.success("Thank you for your feedback!");
    setShowRatingModal(false);
    setRating(0);
    setFeedbackText("");
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        className="focus:outline-none"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
      >
        {(hoverRating || rating) >= star ? (
          <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
        ) : (
          <Star className="h-8 w-8 text-yellow-400" />
        )}
      </button>
    ));
  };

  return (
    <div className="py-8 flex flex-col items-center text-center space-y-6">
      <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
      </div>
      
      <div className="space-y-2 max-w-xl">
        <h2 className="text-2xl font-bold">Interview Completed!</h2>
        <p className="text-muted-foreground">
          Thank you for completing the interview with {companyName} for the {jobTitle} position.
        </p>
      </div>
      
      {feedback && (
        <div className="w-full max-w-2xl space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Interview Feedback</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl font-bold">{feedback.score}/10</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(feedback.score / 2)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Technical Skills</p>
                  <Progress value={feedback.scoreBreakdown.technicalSkills} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Communication</p>
                  <Progress value={feedback.scoreBreakdown.communication} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Problem Solving</p>
                  <Progress value={feedback.scoreBreakdown.problemSolving} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Cultural Fit</p>
                  <Progress value={feedback.scoreBreakdown.culturalFit} />
                </div>
              </div>
              <div className="text-left">
                <p className="font-medium mb-2">Overall Assessment:</p>
                <p className="text-muted-foreground">{feedback.feedback}</p>
              </div>
              <div className="text-left">
                <p className="font-medium mb-2">Suggestions for Improvement:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {feedback.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
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

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleDownloadTranscript} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Transcript
          </Button>
          <Button onClick={() => setShowRatingModal(true)}>
            <Star className="mr-2 h-4 w-4" />
            Rate Your Experience
          </Button>
        </div>
      </div>

      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Interview Experience</DialogTitle>
            <DialogDescription>
              Your feedback helps us improve the interview process.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="flex space-x-2">{renderStars()}</div>
            <Textarea
              placeholder="Share your thoughts about the interview experience..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setShowRatingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRatingSubmit}
                className="flex-1"
                disabled={rating === 0}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThankYouStage;