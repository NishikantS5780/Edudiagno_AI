import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Timer, Brain, Code, Award, CheckCircle2, XCircle, Flag, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { quizAPI } from "@/lib/api";

interface QuizQuestion {
  id: number;
  description: string;
  options: {
    id: number;
    label: string;
    correct: boolean;
  }[];
  type: 'single' | 'multiple' | 'true_false';
}

const MCQTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const interviewId = searchParams.get('i_id');
  const companyName = searchParams.get('company');
  const { interviewId: existingInterviewId, companyName: existingCompanyName } = location.state || {};
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | number[])[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log('Fetching quiz questions...');
        const response = await quizAPI.getQuizQuestions();
        console.log('Raw quiz questions response:', response);
        console.log('Quiz questions data:', response.data);
        
        // Process questions to determine their type
        const processedQuestions = response.data.map((question: any) => {
          const correctOptions = question.options.filter((opt: any) => opt.correct).length;
          let type: 'single' | 'multiple' | 'true_false' = 'single';
          
          if (question.options.length === 2) {
            type = 'true_false';
          } else if (correctOptions > 1) {
            type = 'multiple';
          }
          
          return {
            ...question,
            type
          };
        });
        
        console.log('Processed questions:', processedQuestions);
        
        setQuestions(processedQuestions);
        setAnswers(Array(processedQuestions.length).fill([]));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        toast.error("Failed to load questions");
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

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

  const handleAnswerSelect = (questionIndex: number, optionId: number) => {
    const question = questions[questionIndex];
    const newAnswers = [...answers];
    
    if (question.type === 'single' || question.type === 'true_false') {
      newAnswers[questionIndex] = optionId;
    } else if (question.type === 'multiple') {
      const currentAnswers = (newAnswers[questionIndex] as number[]) || [];
      if (currentAnswers.includes(optionId)) {
        newAnswers[questionIndex] = currentAnswers.filter(id => id !== optionId);
      } else {
        newAnswers[questionIndex] = [...currentAnswers, optionId];
      }
    }
    
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter(answer => 
      Array.isArray(answer) ? answer.length === 0 : answer === -1
    ).length;
    
    if (unanswered > 0) {
      toast.warning(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`);
      return;
    }

    try {
      const responses = questions.map((question, index) => {
        const answer = answers[index];
        // For multiple choice, submit each selected option as a separate response
        if (Array.isArray(answer)) {
          return answer.map(optionId => ({
            question_id: question.id,
            option_id: optionId
          }));
        }
        // For single choice and true/false
        return [{
          question_id: question.id,
          option_id: answer
        }];
      }).flat(); // Flatten the array of arrays into a single array

      await quizAPI.submitQuizResponses(responses);
      handleTestComplete();
    } catch (error) {
      toast.error("Failed to submit answers");
    }
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
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const renderQuestionOptions = (question: QuizQuestion) => {
    if (question.type === 'true_false') {
      return (
        <div className="space-y-4">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.id.toString()} 
                id={`option-${option.id}`}
                checked={answers[currentQuestionIndex] === option.id}
              />
              <Label htmlFor={`option-${option.id}`} className="text-lg">
                {option.label || (option.id === question.options[0].id ? 'True' : 'False')}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    if (question.type === 'multiple') {
      return (
        <div className="space-y-4">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${option.id}`}
                checked={(answers[currentQuestionIndex] as number[])?.includes(option.id)}
                onCheckedChange={() => handleAnswerSelect(currentQuestionIndex, option.id)}
              />
              <Label htmlFor={`option-${option.id}`} className="text-lg">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    if (question.type === 'single') {
      return (
        <RadioGroup
          value={Array.isArray(answers[currentQuestionIndex]) 
            ? (answers[currentQuestionIndex] as number[])[0]?.toString() 
            : answers[currentQuestionIndex]?.toString()}
          onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
          className="space-y-2"
        >
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id.toString()} id={`${question.id}-${option.id}`} />
              <Label htmlFor={`${question.id}-${option.id}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    return (
      <div className="space-y-4">
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option.id.toString()} 
              id={`option-${option.id}`}
              checked={answers[currentQuestionIndex] === option.id}
            />
            <Label htmlFor={`option-${option.id}`} className="text-lg">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no quiz questions available for this interview.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {!isTestStarted && !isCountingDown && (
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">MCQ Test</CardTitle>
              <CardDescription>
                Welcome to the MCQ test section. This test consists of {questions.length} questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Timer className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Time Limit</p>
                    <p className="text-sm text-muted-foreground">10 minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Total Questions</p>
                    <p className="text-sm text-muted-foreground">{questions.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Passing Score</p>
                    <p className="text-sm text-muted-foreground">60%</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartTest} className="w-full">
                Start Test
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {isCountingDown && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-6xl font-bold text-foreground"
          >
            {countdown}
          </motion.div>
        </div>
      )}

      {isTestStarted && (
        <div className="flex gap-6">
          {/* Side Panel */}
          <div className="w-64 shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
                <CardDescription>
                  {answers.filter(a => a !== undefined && (Array.isArray(a) ? a.length > 0 : true)).length} of {questions.length} answered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentQuestionIndex === index ? "default" : "outline"}
                      size="sm"
                      className={`w-full h-10 ${
                        answers[index] !== undefined && (Array.isArray(answers[index]) ? answers[index].length > 0 : true)
                          ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/20"
                          : ""
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>MCQ Test</CardTitle>
                      <CardDescription>
                        Time Remaining: {formatTime(timeLeft)}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {Math.round((answers.filter(a => a !== undefined && (Array.isArray(a) ? a.length > 0 : true)).length / questions.length) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(answers.filter(a => a !== undefined && (Array.isArray(a) ? a.length > 0 : true)).length / questions.length) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, index) => (
                  <div 
                    key={question.id} 
                    className={`p-6 rounded-lg border ${
                      index === currentQuestionIndex 
                        ? 'border-primary' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                      <Badge variant="outline">
                        {question.type === 'true_false' ? 'True/False' : 
                         question.type === 'multiple' ? 'Multiple Choice' : 
                         'Single Choice'}
                      </Badge>
                    </div>
                    <p className="text-base mb-4">{question.description}</p>
                    {question.type === 'single' && (
                      <RadioGroup
                        value={Array.isArray(answers[index]) 
                          ? (answers[index] as number[])[0]?.toString() 
                          : answers[index]?.toString()}
                        onValueChange={(value) => handleAnswerSelect(index, parseInt(value))}
                        className="space-y-2"
                      >
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id.toString()} id={`${question.id}-${option.id}`} />
                            <Label htmlFor={`${question.id}-${option.id}`} className="text-base">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {question.type === 'multiple' && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${question.id}-${option.id}`}
                              checked={(answers[index] as number[])?.includes(option.id)}
                              onCheckedChange={() => handleAnswerSelect(index, option.id)}
                            />
                            <Label htmlFor={`${question.id}-${option.id}`} className="text-base">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === 'true_false' && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={option.id.toString()} 
                              id={`${question.id}-${option.id}`}
                            />
                            <Label htmlFor={`${question.id}-${option.id}`} className="text-base">
                              {option.label || (option.id === question.options[0].id ? 'True' : 'False')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button onClick={handleSubmit}>
                  Submit
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Start Test?</CardTitle>
              <CardDescription>
                Once you start, you will have 10 minutes to complete the test. Are you ready?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmStart}>
                Start
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MCQTest; 