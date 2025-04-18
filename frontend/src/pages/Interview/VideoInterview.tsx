import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Play,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MessageSquare,
  Info,
  Loader2,
  Clock,
  Brain,
  Sparkles,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import AIAvatar from "../../components/interview/AIAvatar";
import RecordingButton from "../../components/interview/RecordingButton";
import { useInterviewResponseProcessor } from "../../components/interview/InterviewResponseProcessor";
import api, { interviewAPI, textAPI } from "@/lib/api";
import { RecruiterData } from "@/types/recruiter";
import { JobData } from "@/types/job";
import { ThankYouStage } from "./ThankYouStage";
import VoiceAnimation from "@/components/interview/VoiceAnimation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface InterviewFeedback {
  feedback: string;
  score: number;
  scoreBreakdown: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
  };
  suggestions: string[];
  keywords: Array<{
    term: string;
    count: number;
    sentiment: "positive" | "neutral" | "negative";
  }>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isTyping?: boolean;
  sender?: "user" | "ai"; // For backward compatibility
  message?: string; // For backward compatibility
}

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
}

interface InterviewData {
  job_requirements: string;
  questions: string[];
  title: string;
  description: string;
  company_name: string;
  job_title: string;
  linkedin_url?: string;
  portfolio_url?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  workExperience?: string;
  education?: string;
  skills?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

interface ThankYouStageProps {
  feedback: string;
  score: number;
  scoreBreakdown: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
  };
  suggestions: string[];
  keywords: Array<{
    term: string;
    count: number;
    sentiment: "positive" | "neutral" | "negative";
  }>;
  transcript?: Array<{
    speaker: string;
    text: string;
    timestamp: string;
  }>;
  companyName?: string;
  jobTitle?: string;
}

export default function VideoInterview() {
  const [interviewData, setInterviewData] = useState<InterviewData>({
    job_requirements: "",
    questions: [],
    title: "",
    description: "",
    company_name: "",
    job_title: "",
  });
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
  const [conversation, setConversation] = useState<Message[]>([]);
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
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedResponse, setEditedResponse] = useState("");
  const [currentStage, setCurrentStage] = useState<string>("");

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

      // Add event listeners for audio playback
      newAudio.onplay = () => {
        setIsAiSpeaking(true);
      };

      newAudio.onended = () => {
        setIsAiSpeaking(false);
      };

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
        job_requirements: data.job_requirements,
        questions: data.questions,
        title: data.title || "",
        description: data.description || "",
        company_name: data.company_name || "",
        job_title: data.job_title || "",
      } as InterviewData);
      setCompanyData({ name: data.company_name });
      setJobData({ title: data.title });
    };
    getCandidateData();
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

          if (audioBlob.size < 1000) {
            console.warn("Audio blob is too small:", audioBlob.size);
            resolve(null);
            return;
          }

          try {
            // Create a File object from the audio blob
            const audioFile = new File([audioBlob], "audio.webm", {
              type: "audio/webm;codecs=opus",
            });

            // Create a new FormData instance
            const formData = new FormData();
            formData.append("audio_file", audioFile);

            console.log("Sending request to /audio/to-text with:", {
              fileSize: audioFile.size,
              fileType: audioFile.type,
              formDataKeys: Array.from(formData.keys()),
            });

            // Use the new /audio/to-text endpoint
            const response = await api.post("/audio/to-text", formData, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("i_token")}`,
                "Content-Type": "multipart/form-data",
              },
            });

            console.log("Transcription response:", {
              status: response.status,
              hasData: !!response.data,
              hasTranscript: !!response.data?.transcript,
              responseData: response.data,
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
              headers: error.response?.headers,
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
      videoElement.onended = () => {
        mediaRecorder.stop();
      };

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
    setEditedResponse(transcript);
    setShowEditDialog(true);
  };

  const handleSubmitEditedResponse = () => {
    setHasRecordedCurrentQuestion(true);
    addUserMessage(editedResponse);
    setConversationHistory((prev) => {
      const newHistory = [...prev, { role: "user", content: editedResponse }];
      console.log("Updated conversation history:", newHistory);
      return newHistory;
    });
    setShowEditDialog(false);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const analyzeInterview = async () => {
    try {
      // Combine all user responses into a single transcript
      const userTranscript = conversation
        .filter((msg: Message) => msg.role === "user")
        .map((msg: Message) => msg.content)
        .join("\n");

      // Get the job details for context
      const jobContext = {
        title: jobData?.title || "Unknown Position",
        description: jobData?.description || "",
        requirements: jobData?.requirements || "",
      };

      // Call the API to analyze the transcript
      // Use PUT instead of POST for the generate-feedback endpoint
      const response = await api.put(
        "/interview/generate-feedback",
        {
          transcript: userTranscript,
          job_requirements: jobData?.requirements || "",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("i_token")}`,
          },
        }
      );

      // Set the feedback state with the response data
      setFeedback(response.data);

      // Make sure to set showCompletionScreen to true
      setShowCompletionScreen(true);
    } catch (error) {
      console.error("Error analyzing transcript:", error);
      toast.error("Failed to analyze interview performance");

      // Create a default feedback object to prevent null reference errors
      setFeedback({
        suggestions: ["Unable to generate feedback due to an error."],
        keywords: [{ term: "Error", count: 1, sentiment: "negative" }],
        score: 0,
        scoreBreakdown: {
          technicalSkills: 0,
          communication: 0,
          problemSolving: 0,
          culturalFit: 0,
        },
        feedback: "There was an error analyzing your interview responses.",
      });

      // Even if analysis fails, still show the completion screen
      setShowCompletionScreen(true);
    }
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
      addAssistantMessage(nextQuestion);

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

      // Show typing animation first
      setIsAiTyping(true);
      setTimeout(() => {
        setIsAiTyping(false);
        setIsAiSpeaking(true);
        setTimeout(() => setIsAiSpeaking(false), 3000);
      }, 2000);
    } else {
      console.log("Interview completed");
      mediaRecorderRef.current.stop();
      stopCamera();
      analyzeInterview();
      setShowCompletionScreen(true);
    }
  };

  const addAssistantMessage = (content: string) => {
    setConversation((prev) => [
      ...prev,
      {
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
        isTyping: false,
      },
    ]);
  };

  const addUserMessage = (content: string) => {
    setConversation((prev) => [
      ...prev,
      {
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
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

      // Show AI preparation animation for 3 seconds
      setTimeout(async () => {
        setIsPreparing(false);
        setIsAiTyping(true);
        addAssistantMessage(interviewFlow[0].question);

        // Initialize camera and microphone 0.1 seconds after buffer
        setTimeout(async () => {
          await initializeDevices();
        }, 100);

        setTimeout(() => {
          setIsAiTyping(false);
          setIsAiSpeaking(true);
          setTimeout(() => setIsAiSpeaking(false), 3000);
        }, 2000);
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
      // Stop any existing stream first
      stopCamera();

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
        // Don't stop the camera here, just process the recording
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

  // Add cleanup effect
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleDownloadTranscript = () => {
    if (conversation.length === 0) return;

    // Format the conversation with timestamps
    const formattedConversation = conversation.map((msg) => {
      const timestamp = new Date(msg.timestamp).toLocaleTimeString();
      return `[${timestamp}] ${
        msg.role === "user" ? "You" : "AI Interviewer"
      }: ${msg.content}`;
    });

    // Add feedback section if available
    let transcriptContent = formattedConversation.join("\n\n");
    if (feedback) {
      transcriptContent += "\n\n=== Interview Feedback ===\n\n";
      transcriptContent += `Overall Score: ${feedback.score}/10\n\n`;
      transcriptContent += `Feedback:\n${feedback.feedback}\n\n`;
      transcriptContent += `Suggestions for Improvement:\n${feedback.suggestions
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n")}`;
    }

    // Create and download the file
    const blob = new Blob([transcriptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      jobData?.title?.replace(/\s+/g, "-").toLowerCase() || "interview"
    }-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInterviewComplete = async () => {
    try {
      setIsProcessingResponse(true);

      // Get the interview transcript
      const transcript = conversation
        .filter((msg: Message) => msg.role === "user")
        .map((msg: Message) => msg.content)
        .join("\n\n");

      // Remove the duplicate call to generate-feedback
      // The analyzeInterview function will handle this instead

      // Set the current stage to thank_you
      setCurrentStage("thank_you");
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate interview feedback. Please try again.");
    } finally {
      setIsProcessingResponse(false);
    }
  };

  // Update conversation state management
  const updateConversation = (newMessage: Message) => {
    setConversation((prev) => [...prev, newMessage]);
  };

  const handleScheduleLater = () => {
    toast.success("Interview scheduled for later");
    // You can add additional logic here for scheduling
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
      <ThankYouStage
        transcript={conversation.map((msg) => ({
          speaker: msg.role === "user" ? "You" : "AI Interviewer",
          text: msg.content,
          timestamp: msg.timestamp,
        }))}
        companyName={interviewData.company_name}
        jobTitle={interviewData.job_title}
        feedback={
          feedback?.feedback || "Thank you for completing the interview."
        }
        score={feedback?.score || 0}
        scoreBreakdown={
          feedback?.scoreBreakdown || {
            technicalSkills: 0,
            communication: 0,
            problemSolving: 0,
            culturalFit: 0,
          }
        }
        suggestions={feedback?.suggestions || []}
        keywords={feedback?.keywords || []}
      />
    );
  }

  if (isPreparing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="max-w-2xl w-full p-8 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-brand/20 rounded-full animate-ping" />
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center">
                <Brain className="h-12 w-12 text-brand animate-pulse" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">
            Preparing Your Interview
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-muted/50 p-4 rounded-lg">
              <BookOpen className="h-6 w-6 text-brand mb-2 mx-auto" />
              <p className="text-sm">Analyzing your resume</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <Briefcase className="h-6 w-6 text-brand mb-2 mx-auto" />
              <p className="text-sm">Reviewing job requirements</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <Sparkles className="h-6 w-6 text-brand mb-2 mx-auto" />
              <p className="text-sm">Crafting personalized questions</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <Brain className="h-6 w-6 text-brand mb-2 mx-auto" />
              <p className="text-sm">Optimizing AI responses</p>
            </div>
          </div>

          <p className="text-muted-foreground">
            Our AI is preparing a tailored interview experience based on your
            background and the position requirements.
          </p>
        </div>
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
                  <Button className="mt-8" onClick={startInterview}>
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
                    className="w-full h-full object-cover aspect-video"
                  />

                  {/* AI Interviewer Avatar */}
                  <div className="absolute bottom-8 left-8 flex flex-col items-center">
                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-full">
                      <AIAvatar isSpeaking={isAiSpeaking} size="lg" />
                    </div>
                    <div className="flex items-center gap-2 mt-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm text-white">AI Interviewer</span>
                      {isAiSpeaking && (
                        <VoiceAnimation isSpeaking={isAiSpeaking} />
                      )}
                    </div>
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
                  <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="bg-brand/10 p-4 rounded-full">
                      <AIAvatar isSpeaking={isAiSpeaking} size="lg" />
                    </div>
                    <div className="text-left max-w-md">
                      <h3 className="text-xl font-semibold mb-2">
                        Hi, I'm Arya!
                      </h3>
                      <p className="text-muted-foreground">
                        I'll be your interviewer for the {jobData?.title}{" "}
                        position at {companyData?.name}. Take a deep breath and
                        relax - I'll help you showcase your skills and
                        experience. When you're ready, click the button below to
                        begin.
                      </p>
                    </div>
                  </div>
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
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-brand text-brand-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <div className="text-xs mb-1">
                          {message.role === "user" ? "You" : "AI Interviewer"}
                        </div>
                        {message.isTyping ? (
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full bg-brand animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <div
                              className="w-2 h-2 rounded-full bg-brand animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <div
                              className="w-2 h-2 rounded-full bg-brand animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Your Response</DialogTitle>
            <DialogDescription>
              Please review and edit your response if needed. The AI has
              transcribed your answer, but you can make corrections if anything
              was misinterpreted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedResponse}
              onChange={(e) => setEditedResponse(e.target.value)}
              className="min-h-[200px]"
              placeholder="Your transcribed response will appear here..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEditedResponse}>
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
