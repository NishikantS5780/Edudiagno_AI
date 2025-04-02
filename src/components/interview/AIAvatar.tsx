
import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

interface AIAvatarProps {
  isSpeaking: boolean;
  size?: "sm" | "md" | "lg";
  avatarUrl?: string;
}

const AIAvatar: React.FC<AIAvatarProps> = ({ 
  isSpeaking, 
  size = "md",
  avatarUrl = "https://randomuser.me/api/portraits/women/44.jpg" 
}) => {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  
  // Size mapping
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  };
  
  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48
  };
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSpeaking) {
      // Create a pulsating effect when the AI is speaking
      interval = setInterval(() => {
        setPulseIntensity(prev => {
          // Oscillate between 0 and 100
          const newValue = prev + (Math.random() * 15);
          return newValue > 100 ? 0 : newValue;
        });
      }, 150);
    } else {
      setPulseIntensity(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);
  
  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Pulsating border effect */}
      <div 
        className={`absolute inset-0 rounded-full bg-brand/20 transition-all duration-200 ease-in-out ${isSpeaking ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}`}
        style={{ 
          transform: `scale(${1 + (pulseIntensity / 100) * 0.3})`,
          opacity: pulseIntensity / 100
        }}
      />
      
      {/* Avatar */}
      <Avatar className={`${sizeClasses[size]} border-2 ${isSpeaking ? 'border-brand' : 'border-transparent'}`}>
        <AvatarImage src={avatarUrl} alt="AI Interviewer" />
        <AvatarFallback className="bg-brand/10">
          <Bot size={iconSizes[size]} className="text-brand" />
        </AvatarFallback>
      </Avatar>
      
      {/* Sound wave visualization (when speaking) */}
      {isSpeaking && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-0.5 bg-background/80 px-2 py-1 rounded-full">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-0.5 bg-brand rounded-full"
              style={{ 
                height: `${4 + Math.sin((Date.now() / 200) + i) * 3 + Math.random() * 4}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAvatar;
