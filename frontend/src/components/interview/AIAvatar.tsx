import React from 'react';
import { cn } from '@/lib/utils';

interface AIAvatarProps {
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AIAvatar: React.FC<AIAvatarProps> = ({ isSpeaking = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="relative">
      <div className={cn(
        "rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center",
        sizeClasses[size]
      )}>
        <svg
          className={cn(
            "text-white",
            size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
          )}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
            fill="currentColor"
          />
        </svg>
      </div>
      {isSpeaking && (
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
      )}
    </div>
  );
};

export default AIAvatar;
