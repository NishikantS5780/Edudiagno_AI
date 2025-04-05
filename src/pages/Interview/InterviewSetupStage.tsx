import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Video, Mic, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { publicInterviewApi } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const InterviewSetupStage = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<'setup' | 'tips' | 'terms'>('setup');
  const [isCameraWorking, setIsCameraWorking] = useState(false);
  const [isMicWorking, setIsMicWorking] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [jobDetails, setJobDetails] = useState<{ title: string; company: string } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await publicInterviewApi.getByAccessCode(accessCode!);
        setJobDetails({
          title: response.data.job.title,
          company: response.data.job.company_name
        });
      } catch (error) {
        toast.error('Failed to load job details');
        navigate(`/interview/${accessCode}`);
      }
    };

    fetchJobDetails();
  }, [accessCode, navigate]);

  const monitorMicVolume = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    setMicVolume(average);
    
    if (average > 10) {
      setIsMicWorking(true);
    }
    
    requestAnimationFrame(monitorMicVolume);
  };

  const handleDeviceTest = async () => {
    try {
      // Try to get audio first
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context and analyzer
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(audioStream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      dataArrayRef.current = dataArray;

      // Start volume monitoring
      const checkVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
        setMicVolume(average);
        setIsMicWorking(average > 0);
        requestAnimationFrame(checkVolume);
      };
      checkVolume();

      // Try to get video if available
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
        setIsCameraWorking(true);
      } catch (videoError) {
        console.log('Camera access not available, continuing with audio only');
        setIsCameraWorking(false);
      }
      
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.error('Microphone access is required for the interview. Please allow microphone access in your browser settings.');
        setIsMicWorking(false);
      } else {
        toast.error('Failed to access microphone. Please check your device settings.');
        setIsMicWorking(false);
      }
      setIsCameraWorking(false);
    }
  };

  const stopDeviceTest = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const handleAcceptTerms = () => {
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions to proceed');
      return;
    }
    stopDeviceTest();
    navigate(`/interview/${accessCode}/video-interview`);
  };

  if (!jobDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Device Setup</h2>
            <p className="text-muted-foreground text-lg">
              Let's make sure your microphone is working properly for your interview.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Video Preview */}
            <Card className="p-8 space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="text-xl text-center">Video Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${isCameraWorking ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-base">
                      {isCameraWorking ? 'Camera is working' : 'Camera not required'}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      stopDeviceTest();
                      handleDeviceTest();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Device Status */}
            <Card className="p-8 space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="text-xl text-center">Device Status</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${isCameraWorking ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {isCameraWorking && <CheckCircle2 className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Camera Access</h4>
                      <p className="text-base text-muted-foreground">
                        Camera is optional for this interview
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${isMicWorking ? 'bg-green-500' : 'bg-muted'}`}>
                      {isMicWorking && <CheckCircle2 className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Microphone Access</h4>
                      <p className="text-base text-muted-foreground">
                        Allow access to your microphone for audio recording
                      </p>
                      <div className="mt-2">
                        <p className="text-sm mb-1">Microphone volume:</p>
                        <Progress value={Math.min(micVolume * 2, 100)} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    className="w-full h-12 text-lg"
                    onClick={handleDeviceTest}
                    disabled={isMicWorking}
                  >
                    {isMicWorking ? 'All Set!' : 'Test Devices'}
                  </Button>

                  {isMicWorking && (
                    <Button 
                      className="w-full h-12 text-lg"
                      onClick={() => setStep('tips')}
                    >
                      Continue to Interview Tips
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'tips') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                  <h3 className="font-semibold mb-2">How the Interview Works</h3>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>Your interview will be conducted by our AI interviewer</li>
                    <li>You'll be asked a series of questions related to the position</li>
                    <li>Record your answers using the "Start Recording" button</li>
                    <li>You can only record one response per question</li>
                    <li>The interview typically takes 15-30 minutes to complete</li>
                    <li>Your responses will be reviewed by the hiring team</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">What to Expect</h3>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>The AI interviewer will introduce itself and explain the process</li>
                    <li>You'll have time to prepare before answering each question</li>
                    <li>For each question, click "Start Recording" when you're ready to answer</li>
                    <li>Click "Stop Recording" when you've completed your answer</li>
                    <li>The interview will automatically proceed to the next question</li>
                    <li>At the end, you'll receive confirmation that your interview was submitted</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="tips" className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">Before the Interview</h3>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>Find a quiet, well-lit place with minimal distractions</li>
                    <li>Dress professionally as you would for an in-person interview</li>
                    <li>Have a glass of water nearby</li>
                    <li>Review the job description and your resume</li>
                    <li>Prepare some examples of your relevant experience</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">During the Interview</h3>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>Speak clearly and at a normal pace</li>
                    <li>Look directly at your camera to maintain "eye contact"</li>
                    <li>Use the STAR method for behavioral questions (Situation, Task, Action, Result)</li>
                    <li>Be concise but thorough in your responses</li>
                    <li>Be authentic - the AI is designed to have a natural conversation</li>
                    <li>If you make a mistake, just continue naturally</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">Technical Requirements</h3>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>A computer with a working webcam and microphone</li>
                    <li>A stable internet connection</li>
                    <li>A modern web browser (Chrome, Firefox, Safari, or Edge)</li>
                    <li>Camera and microphone permissions enabled for this website</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Troubleshooting</h3>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>If your camera or microphone isn't working, check your browser permissions</li>
                    <li>Try refreshing the page if you encounter any issues</li>
                    <li>Close other applications that might be using your camera or microphone</li>
                    <li>If problems persist, try using a different browser</li>
                    <li>Contact support if you need assistance</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="p-4 bg-muted rounded-md space-y-4">
              <div className="flex">
                <Info className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  By proceeding, you agree to have your video and audio recorded for evaluation by the hiring team. 
                  All data is processed according to our privacy policy.
                </p>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="agreement" 
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
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
            <Button variant="outline" onClick={() => setStep('setup')}>
              Back
            </Button>
            <Button 
              onClick={handleAcceptTerms} 
              disabled={!acceptedTerms}
            >
              Start Interview <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
};

export default InterviewSetupStage; 