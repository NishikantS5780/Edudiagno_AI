import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, Code, Video, BookOpen, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { jobAPI } from '@/lib/api';
import { api } from '@/lib/api';
import { toast } from "sonner";
import { ResumeUploadStage } from "@/components/interview/stages/ResumeUploadStage";

const InterviewOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const interviewId = searchParams.get('i_id');
  const companyName = searchParams.get('company');

  // Fetch job data to determine interview flow
  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', interviewId],
    queryFn: async () => {
      // First get the job_id from the interview
      const interviewResponse = await api.get(`/interview?id=${interviewId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      });
      const jobId = interviewResponse.data.job_id;
      
      // Then fetch the job data
      const response = await jobAPI.candidateGetJob(jobId);
      return response.data;
    },
    enabled: !!interviewId,
  });

  const handleStartInterview = async () => {
    try {
      // Check if we have a valid screen stream ID
      const urlParams = new URLSearchParams(window.location.search);
      const streamId = urlParams.get('stream_id');
      const storedStreamId = localStorage.getItem('screenStreamId');

      if (!streamId || !storedStreamId || streamId !== storedStreamId) {
        throw new Error('Invalid or missing screen stream ID');
      }

      let interviewUrl = '';
      if (jobData?.hasQuiz) {
        interviewUrl = `/mcq?i_id=${interviewId}&company=${companyName}&stream_id=${streamId}`;
      } else if (jobData?.hasDSATest) {
        interviewUrl = `/interview/dsa-playground?i_id=${interviewId}&company=${companyName}&stream_id=${streamId}`;
      } else {
        interviewUrl = `/interview/video?i_id=${interviewId}&company=${companyName}&stream_id=${streamId}`;
      }

      // Navigate to the interview page
      navigate(interviewUrl);

      // Request fullscreen after a short delay to ensure the page has loaded
      setTimeout(() => {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else if ((element as any).webkitRequestFullscreen) {
          (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) {
          (element as any).msRequestFullscreen();
        }
      }, 100);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Interview Process Overview</h1>
        <p className="text-lg text-muted-foreground">
          Get ready for your interview with {companyName}
        </p>
      </div>

      <div className="space-y-6">
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              <span>Time to Complete: ~60 minutes</span>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {jobData?.hasQuiz && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <CardTitle>MCQ Test</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Multiple choice questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Technical knowledge assessment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Time limit: 20 minutes</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          )}

          {jobData?.hasDSATest && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-6 w-6 text-primary" />
                <CardTitle>DSA Playground</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Algorithmic problem solving</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Code in your preferred language</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Time limit: 20 minutes</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-6 w-6 text-primary" />
                <CardTitle>AI Video Interview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Live AI-powered interview</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Behavioral and technical questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Time limit: 20 minutes</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Preparation Tips</h3>
          <ul className="space-y-2 text-sm">
            <li>• Ensure you have a stable internet connection</li>
            <li>• Use a quiet environment with good lighting</li>
            <li>• Have your ID ready for verification</li>
            {jobData?.hasDSATest && <li>• Keep a notepad handy for the DSA section</li>}
            <li>• Test your microphone and camera before starting</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleStartInterview}
            className="px-8"
          >
            Start Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewOverview; 