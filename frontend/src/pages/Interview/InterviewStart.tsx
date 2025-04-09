import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { publicInterviewApi } from "@/lib/api";

const InterviewStart = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const startInterview = async () => {
      if (!accessCode) {
        setError("Invalid interview link");
        setLoading(false);
        return;
      }
      
      try {
        // First, verify the interview link is valid and active
        const response = await publicInterviewApi.getByAccessCode(accessCode);
        
        if (!response.data.is_active) {
          setError("This interview link is no longer active.");
          setLoading(false);
          return;
        }
        
        if (response.data.expires_at && new Date(response.data.expires_at) < new Date()) {
          setError("This interview link has expired.");
          setLoading(false);
          return;
        }
        
        // If everything is valid, navigate to the compatibility check
        navigate(`/interview/${accessCode}/compatibility`);
      } catch (err) {
        console.error("Error starting interview:", err);
        setError("Could not start the interview. The link may be invalid or expired.");
        setLoading(false);
      }
    };
    
    startInterview();
  }, [accessCode, navigate]);
  
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
  
  return null;
};

export default InterviewStart; 