import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import AIAvatar from "../../components/interview/AIAvatar";
import RecordingButton from "../../components/interview/RecordingButton";
import { useInterviewResponseProcessor } from "../../components/interview/InterviewResponseProcessor";
import api, { interviewAPI, textAPI } from "@/lib/api";
import axios from "axios";
import { InterviewData } from "@/types/interview";
import { RecruiterData } from "@/types/recruiter";
import { JobData } from "@/types/job";

// const VideoInterviewWrapper = () => {
//   return (
//     <VideoInterview
//       jobTitle={interviewData.job.title}
//       companyName={interviewData.job.company.name}
//       interviewId={interviewData.id}
//       candidate={interviewData.candidate}
//       jobDescription={interviewData.job.description || ""}
//       resumeText={interviewData.candidate?.resume_text || ""}
//       onComplete={() => navigate(`/interview/${accessCode}/complete`)}
//     />
//   );
// };

export default function VideoInterview() {
  const [interviewData, setInterviewData] = useState<InterviewData>();
  const [companyData, setCompanyData] = useState<RecruiterData>();
  const [jobData, setJobData] = useState<JobData>();
  const navigate = useNavigate();
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
  const [prepTime, setPrepTime] = useState(30);
  const [isPreparing, setIsPreparing] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideos, setRecordedVideos] = useState<
    { questionId: string; blob: Blob }[]
  >([]);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [hasRecordedCurrentQuestion, setHasRecordedCurrentQuestion] =
    useState(false);
  const [showNextQuestionDialog, setShowNextQuestionDialog] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [conversation, setConversation] = useState<
    Array<{ sender: string; message: string; timestamp: string }>
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { generateQuestion, processResponse } = useInterviewResponseProcessor();
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionType, setQuestionType] = useState<
    "behavioral" | "resume" | "job"
  >("behavioral");
  const [questionsAsked, setQuestionsAsked] = useState<number>(0);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [interviewFlow, setInterviewFlow] = useState<
    Array<{ type: string; question: string }>
  >([]);
  const [speech, setSpeech] = useState("");
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isDevicesInitialized, setIsDevicesInitialized] = useState(false);

  // Add ref to track processing state
  const isProcessingRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (speech) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      const newAudio = new Audio("data:audio/mpeg;base64," + speech);
      newAudio.play();
      currentAudioRef.current = newAudio;
    }
  }, [speech]);

  useEffect(() => {
    if (currentQuestion.length) {
      const text_to_speech = async () => {
        const response = await textAPI.textToSpeech(currentQuestion);
        setSpeech(response.data.audio_base64);
      };
      text_to_speech();
    }
  }, [currentQuestion]);

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
  }, [isInterviewActive]);

  useEffect(() => {
    const getCandidateData = async () => {
      const res = await interviewAPI.candidateGetInterview();
      const data = res.data;
      setInterviewData({
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        workExperience: data.work_experience,
        education: data.education,
        skills: data.skills,
        linkedinUrl: data.linkedin_url,
        portfolioUrl: data.portfolio_url,
      });
      setCompanyData({ name: data.company_name });
      setJobData({ title: data.title });
    };
    getCandidateData();

    const initializeVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((error) => {
            console.error("Error playing video:", error);
            toast.error("Failed to start video feed");
          });
        }

        // Set up media recorder
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9,opus",
        });

        mediaRecorderRef.current = mediaRecorder;

        // Set up data handler
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        // Set up stop handler
        mediaRecorder.onstop = () => {
          const videoBlob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });
          if (videoBlob.size > 0) {
            setRecordedVideos((prev) => [
              ...prev,
              {
                questionId: `question-${currentQuestionIndex}`,
                blob: videoBlob,
              },
            ]);

            transcribeVideo(videoBlob)
              .then((transcript) => {
                if (transcript) {
                  handleResponseRecorded(transcript);
                }
              })
              .catch((error) => {
                console.error("Error transcribing video:", error);
                toast.error("Failed to transcribe video");
              });
          }
        };

        mediaRecorder.onerror = (error) => {
          console.error("MediaRecorder error:", error);
          toast.error("Recording error occurred");
          setIsRecording(false);
        };

        return () => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
        };
      } catch (error) {
        console.error("Error initializing video:", error);
        toast.error(
          "Failed to initialize video. Please check your camera and microphone permissions."
        );
      }
    };

    initializeVideo();
  }, []);

  useEffect(() => {
    console.log("Conversation state updated:", conversation);
  }, [conversation]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const startDeviceTest = () => {
    if (testVideoRef.current) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          if (testVideoRef.current) {
            testVideoRef.current.srcObject = stream;
            setCameraWorking(true);

            audioContext.current = new AudioContext();
            analyser.current = audioContext.current.createAnalyser();
            microphone.current =
              audioContext.current.createMediaStreamSource(stream);

            analyser.current.fftSize = 256;
            microphone.current.connect(analyser.current);

            const bufferLength = analyser.current.frequencyBinCount;
            dataArray.current = new Uint8Array(bufferLength);

            monitorMicVolume();
          }
        })
        .catch((err) => {
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
      tracks.forEach((track) => track.stop());

      if (microphone.current) {
        microphone.current.disconnect();
      }
      if (audioContext.current && audioContext.current.state !== "closed") {
        audioContext.current.close();
      }
    }

    setShowDeviceTesting(false);
  };

  const handleStartRecording = () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "recording"
    ) {
      return;
    }

    // Clear previous chunks
    recordedChunksRef.current = [];

    // Start recording with 1-second chunks
    mediaRecorderRef.current.start(1000);
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== "recording"
    ) {
      return;
    }

    // Stop recording
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    // Clear timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const transcribeVideo = async (videoBlob: Blob): Promise<string | null> => {
    try {
      setIsProcessingResponse(true);

      console.log("Starting video transcription process...");
      console.log("Video blob details:", {
        size: videoBlob.size,
        type: videoBlob.type,
      });

      // Create FormData and append data
      const formData = new FormData();

      // Convert video blob to audio blob
      const audioContext = new AudioContext();
      const videoElement = document.createElement("video");
      videoElement.src = URL.createObjectURL(videoBlob);

      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          resolve(null);
        };
      });

      const mediaStreamSource =
        audioContext.createMediaElementSource(videoElement);
      const mediaStreamDestination =
        audioContext.createMediaStreamDestination();
      mediaStreamSource.connect(mediaStreamDestination);

      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      const transcriptionPromise = new Promise<string>((resolve, reject) => {
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          console.log("Audio blob details:", {
            size: audioBlob.size,
            type: audioBlob.type,
          });

          const audioFile = new File([audioBlob], "audio.webm", {
            type: "audio/webm",
          });

          try {
            const response = await interviewAPI.submitAudioResponse(
              audioFile,
              currentQuestionIndex
            );

            console.log("Transcription response:", {
              status: response.status,
              hasData: !!response.data,
              hasTranscript: !!response.data?.transcript,
            });

            if (response.data && response.data.transcript) {
              console.log("Successfully received transcript");
              resolve(response.data.transcript);
            } else {
              console.log("No transcript received in response");
              resolve(null);
            }
          } catch (error) {
            console.error("Error transcribing audio:", {
              error,
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
            toast.error("Failed to transcribe audio");
            reject(error);
          }
        };
      });

      // Start recording and playing
      mediaRecorder.start();
      await videoElement.play();

      // Record until video ends
      await new Promise((resolve) => {
        videoElement.onended = () => {
          mediaRecorder.stop();
          resolve(null);
        };
      });

      // Wait for the transcription to complete
      const transcript = await transcriptionPromise;
      return transcript;
    } catch (error) {
      console.error("Error processing video:", {
        error,
        message: error.message,
      });
      toast.error("Failed to process video");
      return null;
    } finally {
      setIsProcessingResponse(false);
    }
  };

  const handleResponseRecorded = async (transcript: string) => {
    console.log("handleResponseRecorded called with transcript:", transcript);
    setCurrentResponse(transcript);
    setHasRecordedCurrentQuestion(true);

    // Add the transcribed text to the conversation
    console.log("Adding message to conversation:", transcript);
    addMessage("user", transcript);

    // Update conversation history with user's response
    setConversationHistory((prev) => {
      const newHistory = [...prev, { role: "user", content: transcript }];
      console.log("Updated conversation history:", newHistory);
      return newHistory;
    });
  };

  const handleNextQuestion = () => {
    console.warn("Current question index:", currentQuestionIndex);
    console.warn("Interview flow length:", interviewFlow.length);

    if (currentQuestionIndex < interviewFlow.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      console.log("Moving to next question index:", nextIndex);

      // Update the current question index
      setCurrentQuestionIndex(nextIndex);

      // Get the next question
      console.log(interviewFlow);
      const nextQuestion = interviewFlow[nextIndex].question;
      console.log("Next question:", nextQuestion);

      // Update the current question
      setCurrentQuestion(nextQuestion);

      // Add the AI's question to the conversation
      addMessage("ai", nextQuestion);

      // Update conversation history
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: nextQuestion },
      ]);

      // Reset recording state
      setHasRecordedCurrentQuestion(false);
      setCurrentResponse(null);

      // Clear recorded chunks for the next recording
      recordedChunksRef.current = [];

      // Show AI speaking animation
      setIsAiSpeaking(true);
      setTimeout(() => setIsAiSpeaking(false), 3000);
    } else {
      console.log("Interview completed");
      setShowCompletionScreen(true);
    }
  };

  const addMessage = (sender: "ai" | "user", message: string) => {
    console.log("addMessage called with:", { sender, message });
    if (sender === "ai") {
      setIsAiSpeaking(true);

      const speakingDuration = Math.max(2000, message.length * 50);
      setTimeout(() => {
        setIsAiSpeaking(false);
      }, speakingDuration);
    }

    setConversation((prev) => {
      const newConversation = [
        ...prev,
        {
          sender,
          message,
          timestamp: new Date().toISOString(),
        },
      ];
      console.log("Updated conversation state:", newConversation);
      return newConversation;
    });

    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const startInterview = async () => {
    setIsInterviewActive(true);
    setIsPreparing(true);

    try {
      const questions = await generateQuestion();

      if (!questions || questions.length === 0) {
        throw new Error("Failed to generate questions");
      }

      const interviewFlow = questions;

      // Log the interview flow for debugging
      console.log("Interview Flow:", interviewFlow);
      console.log("Generated Questions:", questions);

      setCurrentQuestion(interviewFlow[0].question);

      setConversationHistory([
        { role: "assistant", content: interviewFlow[0].question },
      ]);

      // Store the interview flow
      setInterviewFlow(interviewFlow);

      setTimeout(() => {
        setIsPreparing(false);
        setIsAiSpeaking(true);
        addMessage("ai", interviewFlow[0].question);
        setTimeout(() => setIsAiSpeaking(false), 3000);
      }, 3000);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview");
      setIsPreparing(false);
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled((prev) => !prev);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled((prev) => !prev);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const initializeDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error);
          toast.error("Failed to start video feed");
        });
      }

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      // Set up data handler
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      // Set up stop handler
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        if (videoBlob.size > 0) {
          setRecordedVideos((prev) => [
            ...prev,
            {
              questionId: `question-${currentQuestionIndex}`,
              blob: videoBlob,
            },
          ]);

          transcribeVideo(videoBlob)
            .then((transcript) => {
              if (transcript) {
                handleResponseRecorded(transcript);
              }
            })
            .catch((error) => {
              console.error("Error transcribing video:", error);
              toast.error("Failed to transcribe video");
            });
        }
      };

      // Set up error handler
      mediaRecorder.onerror = (error) => {
        console.error("MediaRecorder error:", error);
        toast.error("Recording error occurred");
        setIsRecording(false);
      };

      setIsDevicesInitialized(true);
      toast.success("Camera and microphone initialized successfully");
    } catch (error) {
      console.error("Error initializing devices:", error);
      toast.error(
        "Failed to initialize camera and microphone. Please check your permissions."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading your interview</h1>
          <p className="text-muted-foreground">
            Please wait while we set up your interview experience...
          </p>
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
            <CardDescription>
              Thank you for completing your interview with {companyData.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-lg">
                  Your responses have been recorded and will be reviewed by the
                  hiring team.
                </p>
                <p className="text-muted-foreground">
                  You'll receive an email notification when your results are
                  ready.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Interview Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Position</p>
                    <p className="font-medium">{jobData.title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-medium">{companyData.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Questions</p>
                    <p className="font-medium">9 questions</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">25-30 minutes</p>
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
            <Button variant="outline" onClick={() => navigate("/")}>
              Close Window
            </Button>
            <Button
              onClick={() => {
                const transcriptText = conversation
                  .map(
                    (msg) =>
                      `${msg.sender === "ai" ? "AI Interviewer" : "You"}: ${
                        msg.message
                      }`
                  )
                  .join("\n\n");

                const blob = new Blob([transcriptText], { type: "text/plain" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = `interview-transcript-${new Date()
                  .toISOString()
                  .slice(0, 10)}.txt`;
                document.body.appendChild(a);
                a.click();

                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                setDownloadComplete(true);
                toast.success("Transcript downloaded successfully");
              }}
            >
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="border-b bg-background/95 backdrop-blur-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
            {companyData.name[0]}
          </div>
          <div>
            <h1 className="font-semibold">{jobData.title}</h1>
            <p className="text-sm text-muted-foreground">{companyData.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isDevicesInitialized && (
            <Button
              variant="outline"
              size="sm"
              onClick={initializeDevices}
              className="bg-background/80 backdrop-blur-sm"
            >
              <VideoIcon className="h-4 w-4 mr-2" />
              Initialize Camera & Mic
            </Button>
          )}
          {isInterviewActive ? (
            <Badge variant="outline" className="bg-success/10 text-success">
              Interview in progress
            </Badge>
          ) : (
            <Badge variant="outline">Not started</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreparationDialog(true)}
            disabled={isInterviewActive}
          >
            <Info className="h-4 w-4 mr-2" />
            Interview Info
          </Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 h-[calc(100vh-73px)]">
        <div className="col-span-1 lg:col-span-3 flex flex-col h-full overflow-hidden">
          <div className="relative flex-1 flex flex-col">
            <div className="flex-1 bg-muted flex items-center justify-center relative p-4">
              {isPreparing && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center">
                  <h2 className="text-xl font-semibold mb-4">
                    Prepare Your Answer
                  </h2>
                  <p className="text-lg mb-6">
                    Time to prepare: {formatTime(prepTime)}
                  </p>
                  <div className="w-64 mb-8">
                    <Progress
                      value={((30 - prepTime) / 30) * 100}
                      className="h-2"
                    />
                  </div>
                  <p className="text-sm max-w-md text-center text-muted-foreground">
                    Take a moment to gather your thoughts. The interview will
                    start automatically when the timer ends.
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

              {isInterviewActive ? (
                <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={true}
                    className="w-full h-full object-cover"
                  />

                  {/* AI Interviewer Avatar */}
                  <div className="absolute bottom-8 left-8 flex flex-col items-center">
                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-full">
                      <AIAvatar isSpeaking={isAiSpeaking} size="lg" />
                    </div>
                    <span className="text-sm mt-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                      AI Interviewer
                    </span>
                  </div>

                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4 bg-destructive/90 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" />
                      Recording
                    </div>
                  )}

                  {/* Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleVideo}
                        className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      >
                        {isVideoEnabled ? (
                          <VideoIcon className="h-5 w-5 text-white" />
                        ) : (
                          <VideoOff className="h-5 w-5 text-destructive" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleAudio}
                        className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      >
                        {isAudioEnabled ? (
                          <Mic className="h-5 w-5 text-white" />
                        ) : (
                          <MicOff className="h-5 w-5 text-destructive" />
                        )}
                      </Button>
                      <RecordingButton
                        onStartRecording={handleStartRecording}
                        onStopRecording={handleStopRecording}
                        isRecording={isRecording}
                        recordingTime={recordingTime}
                        isProcessing={isProcessingResponse}
                        disabled={
                          !isInterviewActive ||
                          isAiSpeaking ||
                          hasRecordedCurrentQuestion ||
                          isProcessingResponse
                        }
                        className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      />
                      {hasRecordedCurrentQuestion &&
                        currentQuestionIndex <= interviewFlow.length && (
                          <Button
                            variant="default"
                            onClick={handleNextQuestion}
                            disabled={isRecording || isProcessingResponse}
                            className=""
                          >
                            Next Question
                          </Button>
                        )}
                    </div>
                  </div>

                  {/* Question Progress */}
                  <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-sm text-white">
                      Question {currentQuestionIndex + 1} of{" "}
                      {interviewFlow.length}
                    </span>
                  </div>

                  {/* Time Remaining */}
                  {isInterviewActive && timeRemaining > 0 && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-10">
                  <div className="mx-auto bg-brand/10 p-3 rounded-full mb-4">
                    <AIAvatar isSpeaking={isAiSpeaking} size="lg" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Start Your Interview
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    When you're ready to begin, click the button below to start
                    your AI interview experience
                  </p>
                  <Button
                    size="lg"
                    onClick={startInterview}
                    className="mx-auto"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Begin Interview
                  </Button>
                </div>
              )}
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

              <TabsContent value="transcript" className="mt-4 space-y-4">
                <div className="text-sm text-muted-foreground">
                  Live transcript of your interview conversation
                </div>
                <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.sender === "ai"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.sender === "ai"
                            ? "bg-muted text-foreground"
                            : "bg-brand text-brand-foreground"
                        }`}
                      >
                        <div className="text-xs mb-1">
                          {message.sender === "ai" ? "AI Interviewer" : "You"}
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
                  {interviewFlow.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 
                        ${
                          index < currentQuestionIndex
                            ? "bg-success text-white"
                            : index === currentQuestionIndex &&
                              isInterviewActive
                            ? "bg-brand text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p
                          className={
                            index < currentQuestionIndex
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {item.question}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {item.type === "greeting"
                            ? "Introduction"
                            : item.type === "behavioral"
                            ? "Behavioral"
                            : item.type === "resume"
                            ? "Resume-based"
                            : "Job-specific"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
