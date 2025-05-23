import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { interviewAPI } from "@/lib/api";

interface EmailVerificationStageProps {
  resumeEmail: string;
  onVerified: () => void;
}

export function EmailVerificationStage({ resumeEmail, onVerified }: EmailVerificationStageProps) {
  const [email, setEmail] = useState(resumeEmail);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (email !== resumeEmail) {
      toast.error("Email must match the one from your resume");
      return;
    }

    setIsSendingOtp(true);
    try {
      await interviewAPI.sendOtp(email);
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    try {
      await interviewAPI.verifyOtp(email, otp);
      toast.success("Email verified successfully");
      onVerified();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>
          Please verify your email address to continue with the interview process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Mail className="w-4 h-4" /> Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={otpSent}
          />
        </div>
        {otpSent && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter OTP</label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {!otpSent ? (
          <Button
            onClick={handleSendOtp}
            disabled={isSendingOtp}
          >
            {isSendingOtp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        ) : (
          <Button
            onClick={handleVerifyOtp}
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 