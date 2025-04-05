import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Mail } from "lucide-react";
import { toast } from "sonner";

interface InterviewSchedulingStageProps {
  onScheduleNow: () => void;
  onScheduleLater: () => void;
  jobTitle: string;
  companyName: string;
}

const InterviewSchedulingStage: React.FC<InterviewSchedulingStageProps> = ({
  onScheduleNow,
  onScheduleLater,
  jobTitle,
  companyName
}) => {
  const handleScheduleLater = () => {
    toast.success("We'll send you an email with the interview link. Please complete it within 48 hours.");
    onScheduleLater();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Interview Scheduling</h2>
          <p className="text-muted-foreground">
            When would you like to take your interview for the {jobTitle} position at {companyName}?
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-muted/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-semibold">Take Interview Now</h3>
              <p className="text-sm text-muted-foreground">
                Start your interview immediately. You'll need about 30 minutes to complete it.
              </p>
            </div>
            <Button 
              className="w-full"
              onClick={onScheduleNow}
            >
              Start Now
            </Button>
          </div>

          <div className="bg-muted/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-semibold">Schedule for Later</h3>
              <p className="text-sm text-muted-foreground">
                We'll send you an email with the interview link. You'll have 48 hours to complete it.
              </p>
            </div>
            <Button 
              variant="outline"
              className="w-full"
              onClick={handleScheduleLater}
            >
              Schedule Later
            </Button>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h3 className="font-medium">What to Expect</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>The interview will be conducted by our AI interviewer</li>
            <li>You'll be asked a series of questions related to the position</li>
            <li>You'll record video responses to each question</li>
            <li>The interview typically takes 15-30 minutes to complete</li>
            <li>You'll receive immediate feedback on your performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InterviewSchedulingStage; 