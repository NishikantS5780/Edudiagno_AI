import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Timer,
  Brain,
  Code,
  Award,
  CheckCircle2,
  XCircle,
  Flag,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

// Demo questions for SDE roles
const demoQuestions = [
  // Technical Questions
  {
    id: 1,
    category: "Technical",
    question: "What is the time complexity of binary search?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
  },
  {
    id: 2,
    category: "Technical",
    question: "Which of the following is NOT a valid HTTP method?",
    options: ["GET", "POST", "FETCH", "DELETE"],
    correctAnswer: 2,
  },
  {
    id: 3,
    category: "Technical",
    question: "What is the main purpose of a CDN?",
    options: [
      "To store user data",
      "To improve website performance and availability",
      "To handle database operations",
      "To manage user authentication",
    ],
    correctAnswer: 1,
  },
  {
    id: 4,
    category: "Technical",
    question: "Which data structure is best for implementing a queue?",
    options: ["Array", "Linked List", "Stack", "Tree"],
    correctAnswer: 1,
  },
  {
    id: 5,
    category: "Technical",
    question: "What is the difference between let and const in JavaScript?",
    options: [
      "let is for numbers, const is for strings",
      "let can be reassigned, const cannot be reassigned",
      "let is for variables, const is for functions",
      "There is no difference",
    ],
    correctAnswer: 1,
  },
  // Aptitude Questions
  {
    id: 6,
    category: "Aptitude",
    question:
      "If a train travels at 60 km/h for 2.5 hours, how far does it go?",
    options: ["120 km", "150 km", "180 km", "200 km"],
    correctAnswer: 1,
  },
  {
    id: 7,
    category: "Aptitude",
    question: "What comes next in the sequence: 2, 4, 8, 16, ...?",
    options: ["20", "24", "32", "36"],
    correctAnswer: 2,
  },
  {
    id: 8,
    category: "Aptitude",
    question: "If 20% of a number is 40, what is the number?",
    options: ["160", "180", "200", "220"],
    correctAnswer: 2,
  },
  {
    id: 9,
    category: "Aptitude",
    question:
      "A rectangle has a perimeter of 20 units and an area of 24 square units. What are its dimensions?",
    options: ["4 × 6", "5 × 5", "3 × 8", "2 × 10"],
    correctAnswer: 0,
  },
  {
    id: 10,
    category: "Aptitude",
    question:
      "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: ["1 minute", "5 minutes", "20 minutes", "100 minutes"],
    correctAnswer: 1,
  },
];

const MCQTest = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<number[]>(
    Array(demoQuestions.length).fill(null)
  );
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(demoQuestions.length * 60);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isTestStarted && timeLeft > 0 && !isTestComplete) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isTestComplete) {
      handleSubmit();
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft, isTestComplete, isTestStarted]);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;

    if (isCountingDown && countdown > 0) {
      countdownTimer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setIsTestStarted(true);
      setTimeLeft(demoQuestions.length * 60);
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
    const unanswered = answers.filter((answer) => answer === null).length;
    if (unanswered > 0) {
      toast.warning(
        `You have ${unanswered} unanswered questions. Are you sure you want to submit?`
      );
      return;
    }
    calculateScore();
    setIsTestComplete(true);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === demoQuestions[index].correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
    const interviewId = urlParams.get("i_id");
    const companyName = urlParams.get("company");

    if (interviewId && companyName) {
      navigate(
        `/interview/dsa-playground?i_id=${interviewId}&company=${companyName}`
      );
    } else {
      navigate("/interview/dsa-playground");
    }
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
                <CardTitle className="text-2xl text-center">
                  Welcome to the MCQ Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Time Limit</h3>
                      <p className="text-muted-foreground">
                        You have {demoQuestions.length} minutes to complete{" "}
                        {demoQuestions.length} questions. The timer will start
                        when you click "Start Test".
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Test Format</h3>
                      <p className="text-muted-foreground">
                        The test consists of {demoQuestions.length}{" "}
                        multiple-choice questions. Each question has 4 options,
                        and you must select one answer.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Important Notes</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>
                          You cannot go back to previous questions once
                          submitted
                        </li>
                        <li>
                          All questions must be answered before submission
                        </li>
                        <li>The test will auto-submit when time runs out</li>
                        <li>
                          You can navigate between questions using the sidebar
                        </li>
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
                        Technical questions focus on programming concepts, while
                        Aptitude questions test logical reasoning.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full" onClick={handleStartTest}>
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
                <Button className="flex-1" onClick={handleConfirmStart}>
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

  if (isTestComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-2xl text-center">
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-4xl font-bold mb-2">
                      {score}/{demoQuestions.length}
                    </h2>
                    <p className="text-muted-foreground">
                      {score === demoQuestions.length
                        ? "Perfect score! 🎉"
                        : "Keep practicing! 💪"}
                    </p>
                  </motion.div>
                </div>
                <div className="space-y-4">
                  {demoQuestions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {answers[index] === question.correctAnswer ? (
                          <CheckCircle2 className="text-green-500" />
                        ) : (
                          <XCircle className="text-red-500" />
                        )}
                        <span className="font-medium">
                          Question {index + 1}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({question.category})
                        </span>
                      </div>
                      <p className="mb-2">{question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded transition-colors ${
                              optIndex === question.correctAnswer
                                ? "bg-green-100 dark:bg-green-900/20"
                                : optIndex === answers[index] &&
                                  optIndex !== question.correctAnswer
                                ? "bg-red-100 dark:bg-red-900/20"
                                : "hover:bg-accent"
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button className="w-full" onClick={handleTestComplete}>
                  Continue to DSA Playground
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-12 gap-4 py-4">
          {/* Left Sidebar - Question Navigation */}
          <div className="col-span-3">
            <Card className="border-border sticky top-4">
              <CardHeader className="border-b border-border">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Questions</CardTitle>
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-destructive" />
                    <span className="font-medium">{formatTime(timeLeft)}</span>
                  </div>
                </div>
                <Progress
                  value={(timeLeft / (demoQuestions.length * 60)) * 100}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {demoQuestions.map((_, index) => (
                    <Button
                      key={index}
                      variant={answers[index] !== null ? "default" : "outline"}
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const element = document.getElementById(
                          `question-${index}`
                        );
                        element?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-muted"></div>
                    <span>Not Answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Questions */}
          <div className="col-span-9">
            <Card className="border-border">
              <CardHeader className="border-b border-border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    <CardTitle>MCQ Test</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Flag className="h-4 w-4" />
                    Report Issue
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <div className="space-y-8">
                  {demoQuestions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      id={`question-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Question {index + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({question.category})
                        </span>
                      </div>
                      <h2 className="text-lg font-medium">
                        {question.question}
                      </h2>
                      <RadioGroup
                        value={answers[index]?.toString()}
                        onValueChange={(value) =>
                          handleAnswerSelect(index, parseInt(value))
                        }
                        className="space-y-3"
                      >
                        {question.options.map((option, optIndex) => (
                          <motion.div
                            key={optIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: optIndex * 0.1 }}
                            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          >
                            <RadioGroupItem
                              value={optIndex.toString()}
                              id={`option-${index}-${optIndex}`}
                            />
                            <Label
                              htmlFor={`option-${index}-${optIndex}`}
                              className="cursor-pointer"
                            >
                              {option}
                            </Label>
                          </motion.div>
                        ))}
                      </RadioGroup>
                    </motion.div>
                  ))}
                </div>
                <div className="sticky bottom-0 bg-background border-t border-border p-4 -mx-6 -mb-6">
                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={answers.some((answer) => answer === null)}
                  >
                    Submit Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQTest;
