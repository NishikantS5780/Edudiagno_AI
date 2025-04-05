import React from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CompatibilityCheckStageProps {
  isLoading: boolean;
  matchScore?: number;
   feedback?: string;
   onContinue?: () => void;
   onRejected?: () => void;
}


const CompatibilityCheckStage: React.FC<CompatibilityCheckStageProps> = ({ 
  isLoading, 
  matchScore, 
  feedback,
  onContinue,
  onRejected 
}) => {
  // Calculate progress for the animation
  const progressValue = isLoading ? 
    Math.floor(Math.random() * 60) + 20 : // Random value between 20-80 while loading
    100; // Complete when done
  
  // Determine if candidate is compatible (over 60% match)
  const isCompatible = matchScore ? matchScore >= 60 : null;  return (
    <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
      {isLoading && (
        <>
          <div className="rounded-full bg-primary/10 p-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Analyzing Your Resume</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We're comparing your skills and experience with the job requirements to find the best match.
              This will take just a moment...
            </p>
          </div>
          <div className="w-full max-w-md px-4">
             <Progress value={progressValue} className="h-2 mb-2" />
             <div className="text-sm text-muted-foreground">
               <p className="mb-2">Looking at:</p>
               <ul className="mt-2 space-y-1">
                 <li>• Technical skills and proficiency</li>
                 <li>• Relevant experience</li>
                 <li>• Educational background</li>
                 <li>• Project history</li>
               </ul>
             </div>
          </div>
        </>
      )}
      {!isLoading && isCompatible !== null && (
         <div className="w-full max-w-lg space-y-6">
           <div className={`rounded-full p-6 mx-auto ${isCompatible ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
             {isCompatible ? (
               <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
             ) : (
               <XCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
             )}
           </div>
           
           <div className="space-y-3">
             <h2 className="text-xl font-semibold">
               {isCompatible ? 'Great Match!' : 'Not Quite a Match'}
             </h2>
             <div className="flex justify-center mb-2">
               <div className="bg-muted rounded-full h-6 w-64 overflow-hidden">
                 <div 
                   className={`h-full ${isCompatible ? 'bg-green-500' : 'bg-orange-500'}`} 
                   style={{ width: `${matchScore}%` }}
                 />
               </div>
               <span className="ml-2 font-semibold">{matchScore}%</span>
             </div>
             <p className="text-muted-foreground">
               {isCompatible 
                 ? 'Your profile matches well with the job requirements!' 
                 : 'Your profile doesn\'t seem to be a strong match for this position.'}
             </p>
           </div>
           
           {feedback && (
             <div className="bg-muted p-4 rounded-md text-left">
               <h3 className="font-medium mb-2">Feedback:</h3>
               <p className="text-sm">{feedback}</p>
             </div>
           )}
           
           <div className="pt-4">
             {isCompatible ? (
               <button 
                 onClick={onContinue}
                 className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
               >
                 Continue to Interview
               </button>
             ) : (
               <button
                 onClick={onRejected}
                 className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90 transition-colors"
               >
                 View Other Opportunities
               </button>
             )}
           </div>
         </div>
       )}
    </div>
  );
};

export default CompatibilityCheckStage;
