import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, ExternalLink, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// These are the questions we show to users based on where they are in the app
// For example, if they're in the dashboard, we show dashboard-specific questions
const getSuggestedQuestions = (pathname: string): string[] => {
  // Dashboard questions - stuff users might need help with while managing their account
  if (pathname.includes("/dashboard")) {
    return [
      "How do I create a new job posting?",
      "How can I share interview links with candidates?",
      "Where can I see interview results?",
      "How do I customize my interview questions?",
      "Can I add my company logo to interviews?"
    ];
  }
  
  // Job-related questions - helping users with job posting and management
  if (pathname.includes("/jobs")) {
    return [
      "How does the AI job description generator work?",
      "What information should I include in my job posting?",
      "How can I edit an existing job?",
      "How do AI interviews work for this job?",
      "Can I customize screening requirements?"
    ];
  }
  
  // Interview questions - helping users understand the interview process
  if (pathname.includes("/interviews")) {
    return [
      "How does the AI evaluate candidate responses?",
      "What metrics are used in the interview scoring?",
      "Can I watch interview recordings?",
      "How do I share interview results with my team?",
      "How accurate is the AI interview assessment?"
    ];
  }
  
  // Default questions for when users are just browsing or on landing pages
  return [
    "How does your AI interview system work?",
    "What pricing plans do you offer?",
    "How can AI improve my hiring process?",
    "Can I customize the interview questions?",
    "How secure is your platform?"
  ];
};

// Quick responses for common questions - saves time instead of generating new responses each time
const getCommonResponse = (question: string): string | null => {
  const questionLower = question.toLowerCase();
  
  // Handle pricing questions
  if (questionLower.includes("pricing") || questionLower.includes("cost") || questionLower.includes("how much")) {
    return "We offer three flexible pricing tiers: Starter ($49/mo), Professional ($99/mo), and Enterprise (custom pricing). Each plan includes different features and interview volumes. You can view detailed pricing on our Pricing page.";
  }
  
  // Explain how the AI interview system works
  if (questionLower.includes("ai interview") || questionLower.includes("how does") && questionLower.includes("work")) {
    return "Our AI interview system works by having candidates join a video interview where our AI asks job-specific questions. The AI analyzes responses in real-time, evaluates them against ideal criteria, and generates a detailed report with scores and insights for employers to review.";
  }
  
  // Address security concerns
  if (questionLower.includes("security") || questionLower.includes("secure") || questionLower.includes("privacy")) {
    return "We take security very seriously. All data is encrypted at rest and in transit. We are GDPR compliant and do not share candidate data with third parties. Interviews are only accessible to authorized users within your organization.";
  }
  
  // Help with branding customization
  if (questionLower.includes("company logo") || questionLower.includes("branding")) {
    return "Yes, you can add your company logo and branding to the interview experience! Go to 'Settings' > 'Company Profile' to upload your logo and set your brand colors. This customization is available on Professional and Enterprise plans.";
  }
  
  // Handle demo and trial requests
  if (questionLower.includes("demo") || questionLower.includes("trial")) {
    return "We offer a 14-day free trial for all plans with no credit card required. You can also request a personalized demo from our team by visiting the 'Request Demo' page or contacting our sales team.";
  }
  
  return null;
};

// Main chatbot component - handles the chat interface and message flow
const ChatbotButton: React.FC = () => {
  // State for managing the chat window and messages
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Set up initial welcome message and context-based suggestions when the component loads
  // or when the user navigates to a different page
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: "1",
        content: "Hello! I'm your EduDiagno assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ];
    setMessages(initialMessages);
    setSuggestedQuestions(getSuggestedQuestions(location.pathname));
  }, [location.pathname]);

  // Toggle the chat window open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // Reset any unread message counters when opening the chat
    if (!isOpen) {
      // Add unread message tracking logic here if needed
    }
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Add the user's message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Check if we have a predefined response for this question
    const predefinedResponse = getCommonResponse(newMessage);
    
    // Simulate the bot thinking and responding
    setTimeout(() => {
      let responseContent = "";
      
      if (predefinedResponse) {
        responseContent = predefinedResponse;
      } else {
        // Generate a context-aware response based on where the user is and what they're asking
        const userQuery = newMessage.toLowerCase();
        
        // Handle job description generation questions
        if (location.pathname.includes("/dashboard/jobs") && userQuery.includes("description")) {
          responseContent = "To generate a job description, click the 'Generate with AI' button in the job editor. You can provide keywords or a brief overview, and our AI will create a professional description that you can edit further.";
        } 
        // Handle interview scoring questions
        else if (location.pathname.includes("/dashboard/interviews") && userQuery.includes("score") || userQuery.includes("result")) {
          responseContent = "Interview scores are calculated based on several factors: relevance of answers, completeness, technical accuracy, and communication skills. You can see detailed breakdowns in the candidate's interview report.";
        } 
        // Handle resume screening questions
        else if (userQuery.includes("resume") || userQuery.includes("screening")) {
          responseContent = "Our AI resume screening technology analyzes candidate resumes against your job requirements. It evaluates skills, experience, education, and even contextual elements to determine the best matches. Only candidates who meet your criteria receive interview invitations.";
        } else {
          // Fallback to generic responses if we don't have a specific context
          const genericResponses = [
            "I'd be happy to help with that! Could you provide a bit more detail about what you're looking for?",
            "That's a great question about our AI hiring platform. The system is designed to streamline your entire recruitment process with automated interviews and candidate assessment.",
            "I can definitely assist with that. Our platform specializes in conducting AI-powered interviews that save time while identifying the best candidates.",
            "Thanks for asking. EduDiagno uses advanced AI to make hiring more efficient through automated screening, interviewing, and analytics.",
            "I understand what you're asking about. Our AI interview system evaluates candidates based on their responses to job-specific questions, providing you with detailed insights."
          ];
          
          responseContent = genericResponses[Math.floor(Math.random() * genericResponses.length)];
        }
      }

      // Add the bot's response to the chat
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle clicking on suggested questions
  const handleSuggestedQuestionClick = (question: string) => {
    setNewMessage(question);
    handleSendMessage();
  };

  // Copy a message to the clipboard (useful for sharing responses)
  const copyMessageToClipboard = (message: string) => {
    navigator.clipboard.writeText(message)
      .then(() => {
        toast.success("Message copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy message");
      });
  };

  // Keep the chat scrolled to the bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle pressing Enter to send a message (Shift+Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg z-50 pulse",
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-brand hover:bg-brand/90"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] rounded-lg border border-border bg-card shadow-xl z-50 flex flex-col overflow-hidden glass-card animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/chatbot-avatar.png" />
                <AvatarFallback className="bg-brand text-brand-foreground">ED</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">EduDiagno Assistant</h3>
                <p className="text-xs text-muted-foreground">AI-powered help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex group",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg p-3 relative",
                    message.sender === "user"
                      ? "bg-brand text-brand-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  
                  {/* Action buttons - only for bot messages */}
                  {message.sender === "bot" && (
                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity -mt-8 bg-background rounded-full shadow-md p-1 flex">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyMessageToClipboard(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg p-3 bg-muted">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggested questions */}
          {messages.length < 3 && suggestedQuestions.length > 0 && (
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs py-1 px-2 h-auto"
                    onClick={() => handleSuggestedQuestionClick(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="resize-none min-h-[44px] max-h-[120px]"
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                size="icon"
                className="h-[44px] w-[44px] shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Powered by AI
              </p>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                Help Center <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotButton;
