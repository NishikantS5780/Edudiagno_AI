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
import html2canvas from 'html2canvas';

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
  jobId?: string;
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
  const [companyData, setCompanyData] = useState<RecruiterData | undefined>(undefined);
  const [jobData, setJobData] = useState<JobData | undefined>(undefined);
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
  const [editTimer, setEditTimer] = useState(30);
  const editTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isFullInterviewRecording, setIsFullInterviewRecording] = useState(false);
  const fullInterviewRecorderRef = useRef<MediaRecorder | null>(null);
  const fullInterviewChunksRef = useRef<Blob[]>([]);
  const [isConvertingVideo, setIsConvertingVideo] = useState(false);

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
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Add new state for screenshot interval
  const screenshotIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentQuestion.length) {
      // Show typing animation immediately
      setIsAiTyping(true);
      
      // Start text-to-speech conversion
      const text_to_speech = async () => {
        try {
          const response = await textAPI.textToSpeech(currentQuestion);
          // Create and prepare audio element before setting speech state
          const newAudio = new Audio("data:audio/mpeg;base64," + response.data.audio_base64);
          
          // Add event listeners for audio playback
          newAudio.onplay = () => {
            setIsAiSpeaking(true);
            setIsAiTyping(false);
          };

          newAudio.onended = () => {
            setIsAiSpeaking(false);
          };

          // Store the audio element
          currentAudioRef.current = newAudio;
          
          // Start loading the audio
          newAudio.load();
          
          // Play as soon as it's ready
          newAudio.play().catch(error => {
            console.error("Error playing audio:", error);
            setIsAiTyping(false);
          });
          
          // Set speech state after audio is prepared
          setSpeech(response.data.audio_base64);
        } catch (error) {
          console.error("Error in text-to-speech:", error);
          setIsAiTyping(false);
        }
      };
      text_to_speech();
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (speech && !currentAudioRef.current) {
      const newAudio = new Audio("data:audio/mpeg;base64," + speech);
      newAudio.onplay = () => {
        setIsAiSpeaking(true);
        setIsAiTyping(false);
      };
      newAudio.onended = () => {
        setIsAiSpeaking(false);
      };
      newAudio.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsAiTyping(false);
      });
      currentAudioRef.current = newAudio;
    }
  }, [speech]);

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
      setJobData({
        id: data.id || '',
        title: data.title || '',
        description: data.description || '',
        department: data.department || '',
        city: data.city || '',
        min_experience: data.min_experience || 0,
        max_experience: data.max_experience || 0,
        salary_min: data.salary_min || 0,
        salary_max: data.salary_max || 0,
        requirements: data.requirements || '',
        responsibilities: data.responsibilities || '',
        skills: data.skills || '',
        benefits: data.benefits || '',
        type: data.type || '',
        location: data.location || '',
        remote: data.remote || false,
        company_id: data.company_id || '',
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      } as unknown as JobData);
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
      mediaRecorderRef.current.state === "recording" ||
      !audioRecorderRef.current ||
      audioRecorderRef.current.state === "recording"
    ) {
      return;
    }

    // Clear previous chunks
    recordedChunksRef.current = [];
    audioChunksRef.current = [];
    recordingStartTimeRef.current = performance.now();

    // Start recording with 1-second chunks
    mediaRecorderRef.current.start(1000);
    audioRecorderRef.current.start(1000);
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
      mediaRecorderRef.current.state !== "recording" ||
      !audioRecorderRef.current ||
      audioRecorderRef.current.state !== "recording"
    ) {
      return;
    }

    // Stop recording
    mediaRecorderRef.current.stop();
    audioRecorderRef.current.stop();
    setIsRecording(false);

    // Clear timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    try {
      setIsProcessingResponse(true);
      const startTime = performance.now();

      if (audioBlob.size < 1000) {
        return null;
      }

      try {
        // Create a File object from the audio blob
        const audioFile = new File([audioBlob], "audio.webm", {
          type: "audio/webm;codecs=opus",
        });

        // Create a new FormData instance
        const formData = new FormData();
        formData.append("audio_file", audioFile);

        // Use the /audio/to-text endpoint
        const response = await api.post("/audio/to-text", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("i_token")}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data && response.data.transcript) {
          return response.data.transcript;
        } else {
          return null;
        }
      } catch (error) {
        toast.error("Failed to transcribe audio");
        return null;
      }
    } catch (error) {
      toast.error("Failed to process audio");
      return null;
    } finally {
      setIsProcessingResponse(false);
    }
  };

  const startEditTimer = () => {
    setEditTimer(30);
    editTimerRef.current = setInterval(() => {
      setEditTimer((prev) => {
        if (prev <= 1) {
          if (editTimerRef.current) {
            clearInterval(editTimerRef.current);
          }
          // Submit either the edited response or the original transcribed response
          const responseToSubmit = editedResponse || currentResponse;
          if (responseToSubmit) {
            // Set states first
            addUserMessage(responseToSubmit);
            setHasRecordedCurrentQuestion(true);
            setCurrentResponse(responseToSubmit);
            setShowEditDialog(false);
            
            // Then submit to backend
            interviewAPI.submitTextResponse(currentQuestionIndex, responseToSubmit)
              .then(() => {
                console.log("Response submitted successfully");
              })
              .catch(error => {
                console.error("Failed to submit answer:", error);
                toast.error("Failed to submit answer");
              });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResponseRecorded = async (transcript: string) => {
    setCurrentResponse(transcript);
    setEditedResponse(transcript);
    setShowEditDialog(true);
    startEditTimer();
  };

  const handleSubmitEditedResponse = async () => {
    if (editTimerRef.current) {
      clearInterval(editTimerRef.current);
    }
    if (isSubmittingEdit) return;
    
    // Use currentResponse as fallback if editedResponse is empty
    const responseToSubmit = editedResponse?.trim() || currentResponse?.trim();
    
    // Check if the response is empty
    if (!responseToSubmit) {
      toast.error("Please provide a response before submitting");
      return;
    }
    
    setIsSubmittingEdit(true);
      setShowEditDialog(false);
    try {
      // Add user message to conversation
      addUserMessage(responseToSubmit);
      setHasRecordedCurrentQuestion(true);
      setCurrentResponse(responseToSubmit);
      // Submit to backend
      await interviewAPI.submitTextResponse(currentQuestionIndex, responseToSubmit);
      // Optionally, you can call processResponse here if needed
    } catch (error) {
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      console.log('[Screenshot] Stopping video stream');
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (audioStreamRef.current) {
      console.log('[Screenshot] Stopping audio stream');
      audioStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      audioStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Clear screenshot interval
    if (screenshotIntervalRef.current) {
      console.log('[Screenshot] Clearing screenshot interval');
      clearInterval(screenshotIntervalRef.current);
      screenshotIntervalRef.current = null;
    }
  };

  // Add logging to cleanup effect
  useEffect(() => {
    return () => {
      console.log('[Screenshot] Component unmounting, cleaning up...');
      stopCamera();
      if (screenshotIntervalRef.current) {
        clearInterval(screenshotIntervalRef.current);
      }
    };
  }, []);

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
    if (currentQuestionIndex < interviewFlow.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = interviewFlow[nextIndex].question;
      setCurrentQuestion(nextQuestion);
      addAssistantMessage(nextQuestion);
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: nextQuestion },
      ]);
      setHasRecordedCurrentQuestion(false);
      setCurrentResponse(null);
      recordedChunksRef.current = [];
      audioChunksRef.current = [];
      setIsAiTyping(true);
    } else {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      if (audioRecorderRef.current) audioRecorderRef.current.stop();
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
      setCurrentQuestion(interviewFlow[0].question);
      setConversationHistory([
        { role: "assistant", content: interviewFlow[0].question },
      ]);
      setInterviewFlow(interviewFlow);

      // Show AI preparation animation
      setIsPreparing(false);
      setIsAiTyping(true);
      addAssistantMessage(interviewFlow[0].question);

      // Initialize camera and microphone
      await initializeDevices();

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

  // Add screenshot capture function
  const captureAndSendScreenshot = async () => {
    try {
      if (!videoRef.current) {
        console.warn('[Screenshot] Video element not found');
        return;
      }
      
      console.log('[Screenshot] Starting capture process...');
      const startTime = performance.now();
      
      const canvas = await html2canvas(videoRef.current);
      console.log('[Screenshot] Canvas created successfully');
      
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
      
      if (!blob) {
        console.error('[Screenshot] Failed to create blob from canvas');
        return;
      }
      
      console.log(`[Screenshot] Blob created successfully (${(blob.size / 1024).toFixed(2)} KB)`);

      console.log('[Screenshot] Sending to backend...');
      const response = await fetch("http://localhost:8000/api/interview/screenshot", {
        method: "POST",
        body: blob,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('i_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const endTime = performance.now();
      console.log(`[Screenshot] Successfully saved (${((endTime - startTime) / 1000).toFixed(2)}s)`, result);
    } catch (err) {
      console.error("[Screenshot] Error during capture/upload:", err);
      toast.error("Failed to capture screenshot");
    }
  };

  // Modify initializeDevices to add logging for screenshot interval
  const initializeDevices = async () => {
    try {
      // Stop any existing stream first
      stopCamera();

      // Get video stream
      const videoStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Get audio-only stream
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      streamRef.current = videoStream;
      audioStreamRef.current = audioStream;

      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
        videoRef.current.play().catch((error) => {
          toast.error("Failed to start video feed");
        });
      }

      // Set up video media recorder
      const videoRecorder = new MediaRecorder(videoStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      // Set up audio-only media recorder
      const audioRecorder = new MediaRecorder(audioStream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = videoRecorder;
      audioRecorderRef.current = audioRecorder;

      // Set up full interview recorder
      const fullInterviewRecorder = new MediaRecorder(videoStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });
      fullInterviewRecorderRef.current = fullInterviewRecorder;

      // Set up video data handler
      videoRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      // Set up audio data handler
      audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      // Set up full interview data handler
      fullInterviewRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          fullInterviewChunksRef.current.push(e.data);
        }
      };

      // Set up stop handler for video recorder
      videoRecorder.onstop = () => {
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
        }
      };

      // Set up stop handler for audio recorder
      audioRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        
        if (audioBlob.size > 0) {
          const transcript = await transcribeAudio(audioBlob);
          if (transcript) {
            handleResponseRecorded(transcript);
          }
        }
      };

      // Set up stop handler for full interview recorder
      fullInterviewRecorder.onstop = async () => {
        const fullInterviewBlob = new Blob(fullInterviewChunksRef.current, {
          type: "video/webm",
        });
        
        if (fullInterviewBlob.size > 0) {
          // Create FormData and append the video blob
          const formData = new FormData();
          formData.append('video', fullInterviewBlob, 'interview.webm');
          
          // Send the video to the backend
          try {
            console.log('Starting video upload...');
            const startTime = performance.now();
            
            // First send the video data
            await api.post('/interview/record', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('i_token')}`
              }
            });

            console.log('Video uploaded, starting conversion...');
            setIsConvertingVideo(true);
            
            // Then send finished=true to trigger HLS conversion
            await api.post('/interview/record', null, {
              params: { finished: 'true' },
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('i_token')}`
              }
            });

            const endTime = performance.now();
            console.log(`Video conversion completed in ${(endTime - startTime) / 1000} seconds`);
            setIsConvertingVideo(false);
          } catch (error) {
            console.error('Failed to upload full interview video:', error);
            setIsConvertingVideo(false);
          }
        }
      };

      // Set up error handlers
      videoRecorder.onerror = (error) => {
        toast.error("Recording error occurred");
        setIsRecording(false);
      };

      audioRecorder.onerror = (error) => {
        toast.error("Recording error occurred");
        setIsRecording(false);
      };

      fullInterviewRecorder.onerror = (error) => {
        console.error("Full interview recording error:", error);
      };

      // Start full interview recording
      fullInterviewRecorder.start(1000);
      setIsFullInterviewRecording(true);

      // Start screenshot capture after devices are initialized
      if (screenshotIntervalRef.current) {
        console.log('[Screenshot] Clearing existing interval');
        clearInterval(screenshotIntervalRef.current);
      }
      console.log('[Screenshot] Starting screenshot interval (30s)');
      screenshotIntervalRef.current = setInterval(captureAndSendScreenshot, 30000);

      setIsDevicesInitialized(true);
      toast.success("Camera and microphone initialized successfully");
    } catch (error) {
      console.error("[Screenshot] Failed to initialize devices:", error);
      toast.error(
        "Failed to initialize camera and microphone. Please check your permissions."
      );
    }
  };

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

  const handleInterviewComplete = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const i_id = urlParams.get('i_id');
    const company = urlParams.get('company');
    
    if (i_id && company) {
      // Stop recording if active
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioRecorderRef.current && isRecording) {
        audioRecorderRef.current.stop();
      }
      
      // Stop full interview recording
      if (fullInterviewRecorderRef.current && isFullInterviewRecording) {
        fullInterviewRecorderRef.current.stop();
        setIsFullInterviewRecording(false);
      }
      
      // Stop camera
      stopCamera();
      
      // Only navigate if not converting
      if (!isConvertingVideo) {
        navigate(`/interview/complete?i_id=${i_id}&company=${company}`);
      }
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

  // Update job data with proper type
  const updateJobData = (data: Partial<JobData>) => {
    setJobData(prev => ({
      ...prev,
      ...data
    } as JobData));
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (editTimerRef.current) {
        clearInterval(editTimerRef.current);
      }
    };
  }, []);

  // Add loading overlay for video conversion
  if (isConvertingVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing Interview Video</h1>
          <p className="text-muted-foreground">
            Please wait while we process your interview recording...
          </p>
        </div>
      </div>
    );
  }

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
        jobId={interviewData.id}
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
            {companyData?.name[0]}
          </div>
          <div>
            <h1 className="font-semibold">{jobData?.title}</h1>
            <p className="text-sm text-muted-foreground">{companyData?.name}</p>
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
                          isAiTyping ||
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
                            {currentQuestionIndex === interviewFlow.length - 1 ? "End Interview" : "Next Question"}
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
                        I'll be your interviewer for the {jobData?.title || 'this position'}{" "}
                        position at {companyData?.name || 'the company'}. Take a deep breath and
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
              was misinterpreted. You have {editTimer} seconds to edit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedResponse}
              onChange={(e) => {
                // Prevent pasting
                if (e.nativeEvent instanceof InputEvent && e.nativeEvent.inputType === 'insertFromPaste') {
                  e.preventDefault();
                  return;
                }
                // Only allow one character at a time
                const newValue = e.target.value;
                if (newValue.length > editedResponse.length + 1) {
                  e.preventDefault();
                  return;
                }
                setEditedResponse(newValue);
              }}
              onPaste={(e) => e.preventDefault()}
              className="min-h-[200px]"
              placeholder="Your transcribed response will appear here..."
            />
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time remaining: {editTimer}s</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                if (editTimerRef.current) {
                  clearInterval(editTimerRef.current);
                }
                setShowEditDialog(false);
              }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEditedResponse}>
              Confirm & Submit
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
