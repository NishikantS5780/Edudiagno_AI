import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Timer, Brain, Code, Award, CheckCircle2, XCircle, Flag, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Demo questions for SDE roles
const demoQuestions = {
  aptitude: [
    {
      id: 1,
      category: "Aptitude",
      question: "If a train travels at 60 km/h for 2.5 hours, how far does it go?",
      options: [
        "120 km",
        "150 km",
        "180 km",
        "200 km"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      category: "Aptitude",
      question: "What comes next in the sequence: 2, 4, 8, 16, ...?",
      options: [
        "20",
        "24",
        "32",
        "36"
      ],
      correctAnswer: 2
    },
    {
      id: 3,
      category: "Aptitude",
      question: "If 20% of a number is 40, what is the number?",
      options: [
        "160",
        "180",
        "200",
        "220"
      ],
      correctAnswer: 2
    },
    {
      id: 4,
      category: "Aptitude",
      question: "A rectangle has a perimeter of 20 units and an area of 24 square units. What are its dimensions?",
      options: [
        "4 × 6",
        "5 × 5",
        "3 × 8",
        "2 × 10"
      ],
      correctAnswer: 0
    },
    {
      id: 5,
      category: "Aptitude",
      question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
      options: [
        "1 minute",
        "5 minutes",
        "20 minutes",
        "100 minutes"
      ],
      correctAnswer: 1
    }
  ],
  technical: [
    {
      id: 6,
      category: "Technical",
      question: "What is the time complexity of binary search?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n log n)"
      ],
      correctAnswer: 1
    },
    {
      id: 7,
      category: "Technical",
      question: "Which of the following is NOT a valid HTTP method?",
      options: [
        "GET",
        "POST",
        "FETCH",
        "DELETE"
      ],
      correctAnswer: 2
    },
    {
      id: 8,
      category: "Technical",
      question: "What is the main purpose of a CDN?",
      options: [
        "To store user data",
        "To improve website performance and availability",
        "To handle database operations",
        "To manage user authentication"
      ],
      correctAnswer: 1
    },
    {
      id: 9,
      category: "Technical",
      question: "Which data structure is best for implementing a queue?",
      options: [
        "Array",
        "Linked List",
        "Stack",
        "Tree"
      ],
      correctAnswer: 1
    },
    {
      id: 10,
      category: "Technical",
      question: "What is the difference between let and const in JavaScript?",
      options: [
        "let is for numbers, const is for strings",
        "let can be reassigned, const cannot be reassigned",
        "let is for variables, const is for functions",
        "There is no difference"
      ],
      correctAnswer: 1
    }
  ]
};

const MCQTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const interviewId = searchParams.get('i_id');
  const companyName = searchParams.get('company');
  const { interviewId: existingInterviewId, companyName: existingCompanyName } = location.state || {};
  const [activeSection, setActiveSection] = useState<'aptitude' | 'technical'>('aptitude');
  const [currentQuestions, setCurrentQuestions] = useState(demoQuestions.aptitude);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(5).fill(-1));
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes per section
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [aptitudeCompleted, setAptitudeCompleted] = useState(false);
  const [technicalCompleted, setTechnicalCompleted] = useState(false);

  useEffect(() => {
    setCurrentQuestions(demoQuestions[activeSection]);
    setCurrentQuestionIndex(0);
    setAnswers(Array(5).fill(-1));
  }, [activeSection]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isTestStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft, isTestStarted]);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    
    if (isCountingDown && countdown > 0) {
      countdownTimer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setIsTestStarted(true);
      setTimeLeft(600);
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [countdown, isCountingDown]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const unanswered = answers.filter(answer => answer === -1).length;
    if (unanswered > 0) {
      toast.warning(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`);
      return;
    }
    handleTestComplete();
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === currentQuestions[index].correctAnswer) {
        correctAnswers++;
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setShowConfirmation(true);
  };

  const handleConfirmStart = () => {
    setShowConfirmation(false);
    setIsCountingDown(true);
    setCountdown(3);
  };

  const handleTestComplete = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const i_id = urlParams.get('i_id');
    const company = urlParams.get('company');
    
    if (i_id && company) {
      navigate(`/interview/dsa-playground?i_id=${i_id}&company=${company}`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (activeSection === 'aptitude' && !aptitudeCompleted) {
        setAptitudeCompleted(true);
        setActiveSection('technical');
        setCurrentQuestionIndex(0);
        setAnswers(Array(5).fill(-1));
        setTimeLeft(600);
      } else if (activeSection === 'technical' && !technicalCompleted) {
        setTechnicalCompleted(true);
        handleTestComplete();
      }
    }
  };

  const handleSectionChange = (section: 'aptitude' | 'technical') => {
    setActiveSection(section);
  };

  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-3xl py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-2xl text-center">Welcome to the MCQ Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Time Limit</h3>
                      <p className="text-muted-foreground">
                        You have {timeLeft / 60} minutes to complete {currentQuestions.length} questions.
                        The timer will start when you click "Start Test".
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Test Format</h3>
                      <p className="text-muted-foreground">
                        The test consists of {currentQuestions.length} multiple-choice questions.
                        Each question has 4 options, and you must select one answer.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Important Notes</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>You cannot go back to previous questions once submitted</li>
                        <li>All questions must be answered before submission</li>
                        <li>The test will auto-submit when time runs out</li>
                        <li>You can navigate between questions using the sidebar</li>
                        <li>Make sure you have a stable internet connection</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Question Categories</h3>
                      <p className="text-muted-foreground">
                        The test includes both Technical and Aptitude questions.
                        Technical questions focus on programming concepts, while Aptitude questions test logical reasoning.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={handleStartTest}
                  >
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-medium mb-2">Ready to Start?</h3>
              <p className="text-muted-foreground mb-4">
                Once you start the test:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The timer will begin immediately</li>
                  <li>You cannot pause the test</li>
                  <li>All questions must be answered</li>
                  <li>The test will auto-submit when time runs out</li>
                </ul>
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirmStart}
                >
                  Start Now
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Countdown Overlay */}
        {isCountingDown && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-6xl font-bold mb-4">{countdown}</h2>
              <p className="text-muted-foreground">Test starting in...</p>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-foreground">MCQ Assessment</h1>
          
          {/* Progress Indicator */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                activeSection === 'aptitude' 
                  ? 'bg-primary text-primary-foreground' 
                  : aptitudeCompleted 
                    ? 'bg-green-600 text-white' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                <Brain className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-foreground">Aptitude</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                activeSection === 'technical' 
                  ? 'bg-primary text-primary-foreground' 
                  : technicalCompleted 
                    ? 'bg-green-600 text-white' 
                    : !aptitudeCompleted 
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-muted text-muted-foreground'
              }`}>
                <Code className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-foreground">Technical</span>
            </div>
          </div>

          <p className="text-center text-muted-foreground mb-8">
            {activeSection === 'aptitude' 
              ? "Complete the aptitude questions to proceed to technical section"
              : "Complete the technical questions to finish the assessment"}
          </p>
        </div>

        {/* Test Interface */}
        <Card className="bg-card">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-card-foreground">
                  {activeSection === 'aptitude' ? 'Aptitude Test' : 'Technical Test'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {currentQuestions.length}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {currentQuestions[currentQuestionIndex].category}
                </span>
                <h2 className="text-lg font-medium text-card-foreground">
                  {currentQuestions[currentQuestionIndex].question}
                </h2>
              </div>
              
              <RadioGroup
                value={answers[currentQuestionIndex]?.toString()}
                onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
                className="space-y-3"
              >
                {currentQuestions[currentQuestionIndex].options.map((option, optIndex) => (
                  <motion.div
                    key={optIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: optIndex * 0.1 }}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors cursor-pointer"
                  >
                    <RadioGroupItem 
                      value={optIndex.toString()} 
                      id={`option-${currentQuestionIndex}-${optIndex}`} 
                    />
                    <Label 
                      htmlFor={`option-${currentQuestionIndex}-${optIndex}`} 
                      className="cursor-pointer text-card-foreground"
                    >
                      {option}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="w-32"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestionIndex] === -1}
              className="w-40"
            >
              {currentQuestionIndex === currentQuestions.length - 1 
                ? activeSection === 'aptitude' 
                  ? "Next Section" 
                  : "Submit"
                : "Next"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default MCQTest; 