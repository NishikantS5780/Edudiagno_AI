import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Play, 
  Pause, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  MessageSquare, 
  Info, 
  Download,
  CheckCircle,
  ChevronRight,
  Loader2,
  Clock,
  Check,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import AIAvatar from "@/components/interview/AIAvatar";
import RecordingButton from "@/components/interview/RecordingButton";
import useInterviewResponseProcessor from "@/components/interview/InterviewResponseProcessor";
import CandidatePreCheck from "@/components/interview/CandidatePreCheck";
import { interviewAPI } from "@/lib/api";

interface Interview {
  id: number;
  job_id: number;
  candidate_id: number;
  status: string;
  access_code: string;
  scheduled_at: string | null;
  completed_at: string | null;
  overall_score: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  duration: string;
  job: {
    id: number;
    title: string;
    description: string;
    department: string;
    location: string;
    type: string;
    experience: string;
    salary_min: number;
    salary_max: number;
    show_salary: boolean;
    requirements: string;
    benefits: string;
    published: boolean;
    company_id: number;
    created_at: string;
    updated_at: string;
    company: {
      id: number;
      company_name: string;
      company_logo: string;
    };
  };
  questions: Array<{
    id: number;
    interview_id: number;
    question: string;
    order_number: number;
    time_allocation: number;
  }>;
}

const initialConversation = [
  {
    sender: "ai",
    message: "Hello! Welcome to your AI interview. I'm your AI interviewer today. Are you ready to begin?",
    timestamp: new Date().toISOString(),
  },
];

const CandidateInterview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [conversation, setConversation] = useState(initialConversation);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreparationDialog, setShowPreparationDialog] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [showDeviceTesting, setShowDeviceTesting] = useState(false);
  const [micWorking, setMicWorking] = useState(false);
  const [cameraWorking, setCameraWorking] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [prepTime, setPrepTime] = useState(30); // 30 seconds prep time
  const [isPreparing, setIsPreparing] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideos, setRecordedVideos] = useState<{ questionId: string; blob: Blob }[]>([]);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [hasRecordedCurrentQuestion, setHasRecordedCurrentQuestion] = useState(false);
  const [showNextQuestionDialog, setShowNextQuestionDialog] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [showPreCheck, setShowPreCheck] = useState(true);
  const { processResponse, generateFollowup } = useInterviewResponseProcessor();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        if (!interviewId) {
          toast.error("Invalid interview link");
          navigate("/");
          return;
        }

        const response = await interviewAPI.getByAccessCode(interviewId);
        setInterview(response.data);
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to load interview. Please try again later.");
        navigate("/");
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      if (!isInterviewActive) {
        setTimeout(() => {
          setIsAiSpeaking(true);
          setTimeout(() => setIsAiSpeaking(false), 3000);
        }, 1000);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [interviewId, isInterviewActive]);
  
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isInterviewActive && timeRemaining > 0 && interview?.questions) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          setCurrentProgress(100 - (newTime / interview.questions[currentQuestionIndex].time_allocation * 100));
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInterviewActive, timeRemaining, interview, currentQuestionIndex]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isPreparing && prepTime > 0) {
      timer = setInterval(() => {
        setPrepTime(prev => prev - 1);
      }, 1000);
    } else if (isPreparing && prepTime === 0) {
      setIsPreparing(false);
      startInterview();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPreparing, prepTime]);
  
  useEffect(() => {
    if (!isLoading && videoRef.current && isInterviewActive) {
      navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Error accessing media devices:", err);
        toast.error("Could not access camera or microphone");
      });
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isLoading, isInterviewActive, isVideoEnabled, isAudioEnabled]);
  
  const startDeviceTest = () => {
    if (testVideoRef.current) {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      .then(stream => {
        if (testVideoRef.current) {
          testVideoRef.current.srcObject = stream;
          setCameraWorking(true);
          
          audioContext.current = new AudioContext();
          analyser.current = audioContext.current.createAnalyser();
          microphone.current = audioContext.current.createMediaStreamSource(stream);
          
          analyser.current.fftSize = 256;
          microphone.current.connect(analyser.current);
          
          const bufferLength = analyser.current.frequencyBinCount;
          dataArray.current = new Uint8Array(bufferLength);
          
          monitorMicVolume();
        }
      })
      .catch(err => {
        console.error("Error accessing media devices for testing:", err);
        toast.error("Could not access camera or microphone for testing");
      });
    }
  };
  
  const monitorMicVolume = () => {
    if (!analyser.current || !dataArray.current) return;
    
    analyser.current.getByteFrequencyData(dataArray.current);
    
    let sum = 0;
    for (let i = 0; i < dataArray.current.length; i++) {
      sum += dataArray.current[i];
    }
    
    const average = sum / dataArray.current.length;
    setMicVolume(average);
    
    if (average > 10) {
      setMicWorking(true);
    }
    
    requestAnimationFrame(monitorMicVolume);
  };
  
  const stopDeviceTest = () => {
    if (testVideoRef.current && testVideoRef.current.srcObject) {
      const stream = testVideoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      
      if (microphone.current) {
        microphone.current.disconnect();
      }
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close();
      }
    }
    
    setShowDeviceTesting(false);
  };
  
  const startInterview = () => {
    setIsInterviewActive(true);
    setShowPreparationDialog(false);
    setTimeRemaining(interview.questions[currentQuestionIndex].time_allocation);
    
    setTimeout(() => {
      setIsAiSpeaking(true);
      addMessage("ai", interview.questions[currentQuestionIndex].question);
      setTimeout(() => setIsAiSpeaking(false), 3000);
    }, 1000);
  };
  
  const startPreparation = () => {
    setIsPreparing(true);
  };
  
  const addMessage = (sender: 'ai' | 'user', message: string) => {
    if (sender === 'ai') {
      setIsAiSpeaking(true);
      
      const speakingDuration = Math.max(2000, message.length * 50);
      setTimeout(() => {
        setIsAiSpeaking(false);
      }, speakingDuration);
    }
    
    setConversation(prev => [
      ...prev,
      {
        sender,
        message,
        timestamp: new Date().toISOString()
      }
    ]);
  };
  
  const handleResponseRecorded = async () => {
    setIsProcessingResponse(true);
    setHasRecordedCurrentQuestion(true);
    
    const simulatedResponse = simulateResponse(currentQuestionIndex);
    setCurrentResponse(simulatedResponse);
    
    addMessage("user", simulatedResponse);
    
    try {
      const { score, feedback } = await processResponse(
        interview.questions[currentQuestionIndex].id,
        simulatedResponse
      );
      
      setTimeout(async () => {
        const followupText = await generateFollowup(
          interview.questions[currentQuestionIndex].id,
          simulatedResponse,
          currentQuestionIndex,
          interview.questions.length
        );
        
        addMessage("ai", followupText);
        
        if (currentQuestionIndex < interview.questions.length - 1) {
          setTimeout(() => {
            setShowNextQuestionDialog(true);
          }, 1500);
        } else {
          setTimeout(() => {
            setShowCompletionScreen(true);
          }, 3000);
        }
        
        setIsProcessingResponse(false);
      }, 1500);
    } catch (error) {
      console.error("Error processing response:", error);
      toast.error("Failed to process your response. Please try again.");
      setIsProcessingResponse(false);
    }
  };
  
  const handleNextQuestion = () => {
    setShowNextQuestionDialog(false);
    
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(interview.questions[currentQuestionIndex + 1].time_allocation);
      setCurrentProgress(0);
      setHasRecordedCurrentQuestion(false);
      setCurrentResponse(null);
      
      setTimeout(() => {
        setIsAiSpeaking(true);
        addMessage("ai", interview.questions[currentQuestionIndex + 1].question);
        setTimeout(() => setIsAiSpeaking(false), 3000);
      }, 1000);
    }
  };
  
  const simulateResponse = (questionIndex: number) => {
    const responses = [
      "I have over 5 years of experience with React and have worked extensively with modern JavaScript frameworks like Next.js and Vue. I've built and maintained several large-scale applications using these technologies.",
      "One of the most challenging projects I worked on was redesigning a legacy application with modern frontend technologies. I approached it by first auditing the existing codebase, identifying pain points, and creating a migration plan that allowed for incremental improvements without disrupting the user experience.",
      "I stay updated by following tech blogs, participating in online communities like Stack Overflow and GitHub, attending virtual conferences, and working on side projects to experiment with new technologies.",
      "When debugging complex issues, I first try to reproduce the problem consistently. Then I use browser developer tools to inspect network activity, console logs, and component state. For more complex issues, I'll use specialized tools like React DevTools or performance profiling.",
      "I've optimized web applications by implementing code splitting, lazy loading, memoization, and proper state management. I also focus on reducing bundle sizes, optimizing images, and implementing efficient rendering patterns to minimize unnecessary re-renders."
    ];
    
    return responses[questionIndex] || "I believe my experience and skills align well with what you're looking for. I'm passionate about delivering high-quality solutions and continuously learning new technologies.";
  };
  
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    toast.info("Recording started", {
      duration: 2000
    });
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    toast.success("Recording saved", {
      duration: 2000
    });
    
    handleResponseRecorded();
  };
  
  const toggleVideo = () => {
    setIsVideoEnabled(prev => !prev);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
  };
  
  const toggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleCloseWindow = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate('/dashboard');
    }
  };

  const handleDownloadTranscript = () => {
    const transcriptText = conversation
      .map((msg) => `${msg.sender === 'ai' ? 'AI Interviewer' : 'You'}: ${msg.message}`)
      .join('\n\n');
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloadComplete(true);
    toast.success("Transcript downloaded successfully");
  };

  const handlePreCheckComplete = () => {
    setShowPreCheck(false);
    setShowPreparationDialog(true);
  };

  if (showPreCheck) {
    return <CandidatePreCheck onReady={handlePreCheckComplete} />;
  }

  if (isLoading || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading your interview</h1>
          <p className="text-muted-foreground">Please wait while we set up your interview experience...</p>
        </div>
      </div>
    );
  }

  if (showCompletionScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto bg-success/10 p-3 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <CardTitle className="text-2xl">Interview Completed!</CardTitle>
            <CardDescription>Thank you for completing your interview with {interview.company.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-lg">Your responses have been recorded and will be reviewed by the hiring team.</p>
                <p className="text-muted-foreground">You'll receive an email notification when your results are ready.</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Interview Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Position</p>
                    <p className="font-medium">{interview.job.title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-medium">{interview.company.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Questions</p>
                    <p className="font-medium">{interview.questions.length} questions</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{interview.duration}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="font-medium">What's Next?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 text-center">
                    <div className="mb-2 font-medium">1</div>
                    <p className="text-sm">AI analysis of your responses</p>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <div className="mb-2 font-medium">2</div>
                    <p className="text-sm">Review by hiring team</p>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <div className="mb-2 font-medium">3</div>
                    <p className="text-sm">Feedback and next steps</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleCloseWindow}>
              Close Window
            </Button>
            <Button onClick={handleDownloadTranscript}>
              {downloadComplete ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Downloaded
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Transcript
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isLoading || !interview ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading interview...</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">{interview.job.title}</h1>
              <p className="text-muted-foreground">{interview.job.company.company_name}</p>
            </div>
            <Button variant="outline" onClick={handleCloseWindow}>
              Close Window
            </Button>
          </div>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 h-[calc(100vh-73px)]">
            <div className="col-span-1 lg:col-span-3 flex flex-col h-full overflow-hidden">
              <div className="relative flex-1 flex flex-col">
                <div className="flex-1 bg-muted flex items-center justify-center relative p-4">
                  {isInterviewActive ? (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        muted={!isAudioEnabled} 
                        className="w-full max-h-[70vh] rounded-lg shadow-md"
                      />
                      
                      <div className="absolute bottom-8 left-8 flex flex-col items-center">
                        <AIAvatar 
                          isSpeaking={isAiSpeaking} 
                          size="md" 
                        />
                        <span className="text-xs mt-2 bg-background/80 px-2 py-1 rounded-full">
                          AI Interviewer
                        </span>
                      </div>
                      
                      {isRecording && (
                        <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-white" />
                          Recording
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-10">
                      <div className="mx-auto bg-brand/10 p-3 rounded-full mb-4">
                        <AIAvatar isSpeaking={isAiSpeaking} size="lg" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Start Your Interview</h3>
                      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                        When you're ready to begin, click the button below to start your AI interview experience
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          size="lg" 
                          onClick={() => setShowPreparationDialog(true)}
                          className="mx-auto"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Begin Interview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          onClick={() => setShowDeviceTesting(true)}
                          className="mx-auto"
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Test Camera & Microphone
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {isPreparing && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center">
                      <h2 className="text-xl font-semibold mb-4">Prepare Your Answer</h2>
                      <p className="text-lg mb-6">Time to prepare: {formatTime(prepTime)}</p>
                      <div className="w-64 mb-8">
                        <Progress value={(30-prepTime)/30*100} className="h-2" />
                      </div>
                      <p className="text-sm max-w-md text-center text-muted-foreground">
                        Take a moment to gather your thoughts. The interview will start automatically when the timer ends.
                      </p>
                      <Button 
                        className="mt-8" 
                        onClick={() => {
                          setIsPreparing(false);
                          startInterview();
                        }}
                      >
                        Skip Preparation
                      </Button>
                    </div>
                  )}
                  
                  {isInterviewActive && timeRemaining > 0 && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t bg-background/95 backdrop-blur-sm flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={toggleVideo}
                    >
                      {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-destructive" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={toggleAudio}
                    >
                      {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-destructive" />}
                    </Button>
                  </div>
                  
                  <div className="flex-1 mx-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Current Question: {currentQuestionIndex + 1}/{interview.questions.length}</span>
                      {timeRemaining > 0 && (
                        <span>Time remaining: {formatTime(timeRemaining)}</span>
                      )}
                    </div>
                    <Progress value={currentProgress} className="h-2" />
                  </div>
                  
                  <RecordingButton 
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    isRecording={isRecording}
                    recordingTime={recordingTime}
                    isProcessing={isProcessingResponse}
                    disabled={!isInterviewActive || isAiSpeaking || hasRecordedCurrentQuestion || isProcessingResponse}
                  />
                </div>
              </div>
            </div>
            
            <div className="col-span-1 lg:col-span-2 border-l border-t lg:border-t-0 bg-background/95 backdrop-blur-sm flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b">
                <Tabs defaultValue="transcript" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="transcript">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Transcript
                    </TabsTrigger>
                    <TabsTrigger value="questions">
                      <Info className="h-4 w-4 mr-2" />
                      Questions
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="transcript" className="mt-4 space-y-4 h-[150px] overflow-y-auto">
                    <div className="text-sm text-muted-foreground">
                      Live transcript of your interview conversation
                    </div>
                    <div className="space-y-4">
                      {conversation.map((message, index) => (
                        <div 
                          key={index} 
                          className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div 
                            className={`max-w-[85%] rounded-lg p-3 ${
                              message.sender === 'ai' 
                                ? 'bg-muted text-foreground' 
                                : 'bg-brand text-brand-foreground'
                            }`}
                          >
                            <div className="text-xs mb-1">
                              {message.sender === 'ai' ? 'AI Interviewer' : 'You'}
                            </div>
                            <p>{message.message}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={transcriptEndRef} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="questions" className="mt-4 space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Overview of all interview questions
                    </div>
                    <div className="space-y-3">
                      {interview.questions.map((question, index) => (
                        <div key={question.id} className="flex gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 
                            ${index < currentQuestionIndex ? 'bg-success text-white' : 
                              index === currentQuestionIndex && isInterviewActive ? 'bg-brand text-white' : 
                              'bg-muted text-muted-foreground'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className={index < currentQuestionIndex ? 'line-through text-muted-foreground' : ''}>
                              {question.question}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {conversation.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.sender === 'ai' 
                            ? 'bg-muted text-foreground' 
                            : 'bg-brand text-brand-foreground'
                        }`}
                      >
                        <div className="text-xs mb-1">
                          {message.sender === 'ai' ? 'AI Interviewer' : 'You'}
                        </div>
                        <p>{message.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </div>
          </div>
          
          <AlertDialog 
            open={showNextQuestionDialog} 
            onOpenChange={setShowNextQuestionDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ready for the next question?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your response has been recorded. When you're ready, we'll proceed to the next question.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleNextQuestion}>
                  Continue to Next Question
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog open={showPreparationDialog} onOpenChange={setShowPreparationDialog}>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">Prepare for your AI Interview</AlertDialogTitle>
                <AlertDialogDescription>
                  Review the following information before starting your interview
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-4 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Position</h3>
                    <p>{interview.job.title}</p>
                    <p className="text-sm text-muted-foreground">{interview.job.location}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Company</h3>
                    <div className="flex items-center gap-2">
                      <img 
                        src={interview.company.logo} 
                        alt={interview.company.name} 
                        className="h-6 w-6 rounded-md"
                      />
                      <span>{interview.company.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Duration</h3>
                    <p>{interview.duration}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Questions</h3>
                    <p>{interview.questions.length} questions total</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">How it works</h3>
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0">1</div>
                      <p>The AI interviewer will ask you questions one by one</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0">2</div>
                      <p>You'll have 30 seconds to prepare before answering each question</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0">3</div>
                      <p>Respond naturally to each question - this is a conversation</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0">4</div>
                      <p>After the interview, your responses will be analyzed by AI and reviewed by the hiring team</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Tips for a successful interview</h3>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Ensure you're in a quiet environment with good lighting</li>
                    <li>✓ Check that your camera and microphone are working properly</li>
                    <li>✓ Speak clearly and at a normal pace</li>
                    <li>✓ Take a moment to think about your answers if needed</li>
                    <li>✓ Be authentic and showcase your real skills and experience</li>
                  </ul>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">
                    By proceeding, you agree to have your video and audio recorded for evaluation purposes. 
                    This interview will be analyzed by AI and reviewed by the hiring team at {interview.company.name}.
                  </p>
                </div>
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={startPreparation}>
                  Start Interview
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog open={showDeviceTesting} onOpenChange={(open) => {
            if (!open) {
              stopDeviceTest();
            }
            setShowDeviceTesting(open);
          }}>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">Test Your Camera and Microphone</AlertDialogTitle>
                <AlertDialogDescription>
                  Make sure your devices are working properly before starting the interview
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-4 space-y-6">
                <div className="bg-muted rounded-lg overflow-hidden aspect-video">
                  <video 
                    ref={testVideoRef} 
                    autoPlay 
                    muted 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cameraWorking ? 'bg-success' : 'bg-destructive'}`}></div>
                      <span>Camera</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {cameraWorking ? 'Working correctly' : 'Not detected'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${micWorking ? 'bg-success' : 'bg-destructive'}`}></div>
                      <span>Microphone</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {micWorking ? 'Working correctly' : 'Speak to test microphone'}
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm mb-2">Microphone volume:</p>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand transition-all duration-75" 
                        style={{ width: `${Math.min(micVolume * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">
                    If your devices aren't working:
                  </p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Make sure you've granted browser permissions for camera and microphone</li>
                    <li>• Check if other applications are using your camera</li>
                    <li>• Try refreshing the page</li>
                    <li>• Ensure your devices are properly connected</li>
                  </ul>
                </div>
              </div>
              
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel onClick={stopDeviceTest}>Cancel</AlertDialogCancel>
                <Button 
                  className="w-full sm:w-auto" 
                  onClick={() => {
                    if (!testVideoRef.current || !testVideoRef.current.srcObject) {
                      startDeviceTest();
                    } else {
                      stopDeviceTest();
                      startDeviceTest();
                    }
                  }}
                >
                  Restart Device Test
                </Button>
                <AlertDialogAction
                  onClick={() => {
                    stopDeviceTest();
                    setShowPreparationDialog(true);
                  }}
                  disabled={!cameraWorking || !micWorking}
                >
                  Continue to Interview
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Recording Submitted</AlertDialogTitle>
                <AlertDialogDescription>
                  Your response has been recorded. You can only record one response per question.
                  Would you like to proceed to the next question?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleNextQuestion}>
                  Next Question
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default CandidateInterview;
