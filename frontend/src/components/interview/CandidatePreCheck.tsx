import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mic,
  Video,
  Check,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Camera,
  CameraOff,
  Settings,
  RefreshCw,
} from "lucide-react";
import ResumeUpload from "@/components/common/ResumeUpload";
import { toast } from "sonner";
import api from "@/lib/api";

interface CandidatePreCheckProps {
  onReady: () => void;
}

const CandidatePreCheck = () => {
  const [activeStep, setActiveStep] = useState<"device" | "preparation">(
    "device"
  );
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cameraAccess, setCameraAccess] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [microphoneAccess, setMicrophoneAccess] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [internetConnection, setInternetConnection] = useState<
    "good" | "poor" | "unknown"
  >("unknown");
  const [isTestingDevices, setIsTestingDevices] = useState(false);
  const [isDeviceTestComplete, setIsDeviceTestComplete] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [companyName, setCompanyName] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const animationFrame = useRef<number | null>(null);
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const response = await api.get("/interview", {
          headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
        });
        if (response.data && response.data.company_name) {
          setCompanyName(response.data.company_name);
        }
      } catch (error) {
        console.error("Error fetching interview data:", error);
        // Set a default company name if the fetch fails
        setCompanyName("the Company");
      }
    };

    fetchInterviewData();
  }, []);

  useEffect(() => {
    let newProgress = 0;
    if (isDeviceTestComplete) newProgress += 50;
    if (isAgreementChecked) newProgress += 50;
    setProgress(newProgress);
  }, [isDeviceTestComplete, isAgreementChecked]);

  const startDeviceTest = async () => {
    setIsTestingDevices(true);
    setCameraAccess("pending");
    setMicrophoneAccess("pending");

    try {
      let internetConnectionQuality = "unknown";

      try {
        const startTime = Date.now();
        await fetch("https://www.google.com/favicon.ico", { mode: "no-cors" });
        const latency = Date.now() - startTime;
        internetConnectionQuality = latency < 300 ? "good" : "poor";
      } catch (error) {
        internetConnectionQuality = "poor";
      }

      setInternetConnection(
        internetConnectionQuality as "good" | "poor" | "unknown"
      );

      // Try to get video first
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          videoRef.current.play();
        }
        setCameraAccess("granted");
      } catch (videoError) {
        console.log("Camera access not available:", videoError);
        setCameraAccess("denied");
      }

      // Then try to get audio
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStream.current = audioStream;
        setMicrophoneAccess("granted");

        audioContext.current = new AudioContext();
        analyser.current = audioContext.current.createAnalyser();
        microphone.current =
          audioContext.current.createMediaStreamSource(audioStream);

        analyser.current.fftSize = 256;
        microphone.current.connect(analyser.current);

        const bufferLength = analyser.current.frequencyBinCount;
        dataArray.current = new Uint8Array(bufferLength);

        monitorMicVolume();
      } catch (audioError) {
        console.error("Error accessing microphone:", audioError);
        setMicrophoneAccess("denied");
        toast.error(
          "Microphone access is required. Please allow microphone access in your browser settings."
        );
      }
    } catch (error: any) {
      console.error("Error accessing media devices:", error);

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setMicrophoneAccess("denied");
        toast.error(
          "Microphone access is required. Please allow microphone access in your browser settings."
        );
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        setMicrophoneAccess("denied");
        toast.error(
          "No microphone found. Please check your device connections."
        );
      } else {
        setMicrophoneAccess("denied");
        toast.error(
          "Failed to access microphone. Please check your device settings."
        );
      }
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

    animationFrame.current = requestAnimationFrame(monitorMicVolume);
  };

  const stopDeviceTest = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
      mediaStream.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (audioContext.current && audioContext.current.state !== "closed") {
      audioContext.current.close();
      audioContext.current = null;
    }

    if (microphone.current) {
      microphone.current.disconnect();
      microphone.current = null;
    }

    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    // Set device test complete regardless of microphone access
    setIsDeviceTestComplete(true);
    setIsTestingDevices(false);
  };

  const proceedToNextStep = () => {
    if (activeStep === "device") {
      setActiveStep("preparation");
    } else {
      navigate(
        `/interview/video-interview?i_id=${urlSearchParams.get("i_id")}`
      );
    }
  };

  useEffect(() => {
    return () => {
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => track.stop());
      }

      if (audioContext.current && audioContext.current.state !== "closed") {
        audioContext.current.close();
      }

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 container max-w-screen-lg py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Interview Preparation for {companyName}
          </h1>
          <p className="text-muted-foreground">
            Complete the following steps to ensure a smooth interview experience
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span>Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card
            className={`border ${
              activeStep === "device" ? "border-brand" : ""
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <div
                  className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
                    isDeviceTestComplete ? "bg-brand text-white" : "bg-muted"
                  }`}
                >
                  {isDeviceTestComplete ? <Check className="h-4 w-4" /> : "1"}
                </div>
                Device Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Test your microphone to ensure it works properly
              </p>
            </CardContent>
          </Card>

          <Card
            className={`border ${
              activeStep === "preparation" ? "border-brand" : ""
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <div
                  className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
                    isAgreementChecked ? "bg-brand text-white" : "bg-muted"
                  }`}
                >
                  {isAgreementChecked ? <Check className="h-4 w-4" /> : "2"}
                </div>
                Final Preparation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review instructions and prepare for your interview
              </p>
            </CardContent>
          </Card>
        </div>

        {activeStep === "device" && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Device Check</CardTitle>
              <CardDescription>
                Let's make sure your devices are working properly for the interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!isTestingDevices && !isDeviceTestComplete && (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className="bg-brand/10 rounded-full p-4 mb-4">
                      <Settings className="h-8 w-8 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-center">
                      Device Check Required
                    </h3>
                    <p className="mb-6 max-w-md text-center text-muted-foreground">
                      We need to check your microphone and camera to ensure they work properly for the interview
                    </p>
                    <Button size="lg" onClick={startDeviceTest} className="px-6">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Start Device Check
                    </Button>
                  </div>
                )}

                {isTestingDevices && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Video Preview */}
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                          <div className="text-white text-center p-4">
                            <Camera className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Camera Preview</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center">
                          {cameraAccess === "granted" ? (
                            <Camera className="h-5 w-5 text-success mr-2" />
                          ) : cameraAccess === "denied" ? (
                            <CameraOff className="h-5 w-5 text-yellow-500 mr-2" />
                          ) : (
                            <Camera className="h-5 w-5 text-muted-foreground mr-2" />
                          )}
                          <span className="font-medium">Camera</span>
                        </div>
                        <span className={`text-sm ${
                          cameraAccess === "granted" ? "text-success" : 
                          cameraAccess === "denied" ? "text-yellow-500" : 
                          "text-muted-foreground"
                        }`}>
                          {cameraAccess === "granted"
                            ? "Working"
                            : cameraAccess === "denied"
                            ? "Optional"
                            : "Checking..."}
                        </span>
                      </div>
                    </div>

                    {/* Audio and Connection Status */}
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                        <h3 className="font-medium flex items-center">
                          <Mic className="h-5 w-5 mr-2" />
                          Microphone Status
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status</span>
                          <span className={`text-sm ${
                            microphoneAccess === "granted" ? "text-success" : 
                            microphoneAccess === "denied" ? "text-destructive" : 
                            "text-yellow-500"
                          }`}>
                            {microphoneAccess === "granted"
                              ? "Working"
                              : microphoneAccess === "denied"
                              ? "Access denied"
                              : "Checking..."}
                          </span>
                        </div>

                        {microphoneAccess === "granted" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Volume Level</span>
                              <span className="text-sm font-medium">{Math.round(micVolume)}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  micVolume < 10 ? "bg-yellow-500" : "bg-success"
                                }`}
                                style={{
                                  width: `${Math.min(micVolume * 2, 100)}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center">
                              {micVolume < 10 ? (
                                <>
                                  <VolumeX className="h-3 w-3 mr-1 text-yellow-500" />
                                  Speak to test your microphone
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3 w-3 mr-1 text-success" />
                                  Microphone is working well
                                </>
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h3 className="font-medium flex items-center mb-2">
                          <Wifi className="h-5 w-5 mr-2" />
                          Internet Connection
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status</span>
                          <span className={`text-sm ${
                            internetConnection === "good" ? "text-success" : 
                            internetConnection === "poor" ? "text-yellow-500" : 
                            "text-muted-foreground"
                          }`}>
                            {internetConnection === "good"
                              ? "Good"
                              : internetConnection === "poor"
                              ? "Poor"
                              : "Checking..."}
                          </span>
                        </div>
                        {internetConnection === "poor" && (
                          <p className="text-xs text-yellow-500 mt-2">
                            Your connection might be unstable. Consider using a more reliable network.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isTestingDevices && (
                  <div className="flex justify-center mt-6">
                    <Button 
                      onClick={() => {
                        stopDeviceTest();
                        setIsDeviceTestComplete(true);
                      }}
                      className="px-6"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Device Test
                    </Button>
                  </div>
                )}

                {isDeviceTestComplete && (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className="bg-success/10 rounded-full p-4 mb-4">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-center">
                      Device Check Complete
                    </h3>
                    <p className="mb-6 max-w-md text-center text-muted-foreground">
                      Your devices are ready for the interview
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-6">
                      <div className="flex flex-col items-center p-4 bg-success/5 rounded-lg">
                        <div className="bg-success/10 rounded-full p-2 mb-2">
                          <Mic className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-sm font-medium">Microphone</span>
                        <span className="text-xs text-success">Working</span>
                      </div>
                      
                      <div className="flex flex-col items-center p-4 bg-success/5 rounded-lg">
                        <div className="bg-success/10 rounded-full p-2 mb-2">
                          <Camera className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-sm font-medium">Camera</span>
                        <span className="text-xs text-success">
                          {cameraAccess === "granted" ? "Working" : "Optional"}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center p-4 bg-success/5 rounded-lg">
                        <div className="bg-success/10 rounded-full p-2 mb-2">
                          <Wifi className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-sm font-medium">Internet</span>
                        <span className="text-xs text-success">Stable</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setActiveStep("device")}>
                Back
              </Button>
              <Button
                onClick={proceedToNextStep}
                disabled={!isDeviceTestComplete}
                className="min-w-[120px]"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {activeStep === "preparation" && (
          <Card>
            <CardHeader>
              <CardTitle>Final Preparation</CardTitle>
              <CardDescription>
                Review these instructions before starting your interview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="instructions" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="tips">Interview Tips</TabsTrigger>
                  <TabsTrigger value="technical">Technical Setup</TabsTrigger>
                </TabsList>
                <TabsContent value="instructions" className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      How the Interview Works
                    </h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>
                        Your interview will be conducted by our AI interviewer
                      </li>
                      <li>
                        You'll be asked a series of questions related to the
                        position
                      </li>
                      <li>
                        Record your answers using the "Start Recording" button
                      </li>
                      <li>You can only record one response per question</li>
                      <li>
                        The interview typically takes 15-30 minutes to complete
                      </li>
                      <li>
                        Your responses will be reviewed by the hiring team
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">What to Expect</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>
                        The AI interviewer will introduce itself and explain the
                        process
                      </li>
                      <li>
                        You'll have time to prepare before answering each
                        question
                      </li>
                      <li>
                        For each question, click "Start Recording" when you're
                        ready to answer
                      </li>
                      <li>
                        Click "Stop Recording" when you've completed your answer
                      </li>
                      <li>
                        The interview will automatically proceed to the next
                        question
                      </li>
                      <li>
                        At the end, you'll receive confirmation that your
                        interview was submitted
                      </li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="tips" className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-semibold mb-2">Before the Interview</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>
                        Find a quiet, well-lit place with minimal distractions
                      </li>
                      <li>
                        Dress professionally as you would for an in-person
                        interview
                      </li>
                      <li>Have a glass of water nearby</li>
                      <li>Review the job description and your resume</li>
                      <li>Prepare some examples of your relevant experience</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">During the Interview</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Speak clearly and at a normal pace</li>
                      <li>
                        Look directly at your camera to maintain "eye contact"
                      </li>
                      <li>
                        Use the STAR method for behavioral questions (Situation,
                        Task, Action, Result)
                      </li>
                      <li>Be concise but thorough in your responses</li>
                      <li>
                        Be authentic - the AI is designed to have a natural
                        conversation
                      </li>
                      <li>If you make a mistake, just continue naturally</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="technical" className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      Technical Requirements
                    </h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>A computer with a working webcam and microphone</li>
                      <li>A stable internet connection</li>
                      <li>
                        A modern web browser (Chrome, Firefox, Safari, or Edge)
                      </li>
                      <li>
                        Camera and microphone permissions enabled for this
                        website
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Troubleshooting</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>
                        If your camera or microphone isn't working, check your
                        browser permissions
                      </li>
                      <li>
                        Try refreshing the page if you encounter any issues
                      </li>
                      <li>
                        Close other applications that might be using your camera
                        or microphone
                      </li>
                      <li>
                        If problems persist, try using a different browser
                      </li>
                      <li>Contact support if you need assistance</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="p-4 bg-muted rounded-md space-y-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    By proceeding, you agree to have your video and audio
                    recorded for evaluation by the hiring team. All data is
                    processed according to our privacy policy.
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreement"
                    checked={isAgreementChecked}
                    onCheckedChange={(checked) =>
                      setIsAgreementChecked(checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="agreement"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I understand and agree to proceed with the video interview
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveStep("device")}>
                Back
              </Button>
              <Button
                onClick={proceedToNextStep}
                disabled={!isAgreementChecked}
              >
                Start Interview <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CandidatePreCheck;
