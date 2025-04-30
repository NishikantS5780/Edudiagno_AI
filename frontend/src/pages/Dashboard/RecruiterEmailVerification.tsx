import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function RecruiterEmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  const sendOtp = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("Send OTP response:", data);

      if (
        response.ok &&
        (data.success || data.message?.toLowerCase().includes("success"))
      ) {
        setIsOtpSent(true);
        alert("OTP sent to your email.");
      } else {
        alert("Failed to send OTP: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP due to network error.");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
  
      const data = await response.json();
      console.log("OTP Verify Response:", data);
  
      
      if (response.ok) {
        alert("Email verified successfully!");
        navigate("/dashboard/profile", { state: { shouldRefetch: true } });
      } else {
        alert("Invalid OTP: " + (data.message || "Please try again."));
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Verification failed due to network error.");
    }
  };
  
  
  
  
  useEffect(() => {
    if (!email) {
      alert("No email provided.");
      navigate("/profile");
    }
  }, [email, navigate]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-black">Verify Your Email</h2>

      {!isOtpSent && (
        <>
          <input
            className="w-full p-2 border rounded mb-2 placeholder-gray-500 text-black"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-600 transition duration-300 w-full mt-6"
            onClick={sendOtp}
            disabled={!email}
          >
            Send OTP
          </button>
        </>
      )}

      {isOtpSent && (
        <>
          <input
            className="w-full p-2 border rounded mt-4 placeholder-gray-500 text-black"
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            className="bg-blue-400 text-black px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-500 transition duration-300 w-full mt-6"
            onClick={verifyOtp}
            disabled={!otp}
          >
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}
