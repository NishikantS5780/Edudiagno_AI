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
import { jobAPI } from "@/lib/api";
import { api } from "@/lib/api";

interface QuizQuestion {
  id: number;
  description: string;
  options: {
    id: number;
    label: string;
    correct: boolean;
  }[];
  type: 'technical' | 'aptitude';
  answerType: 'single' | 'multiple' | 'true_false';
}

const MCQTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const interviewId = searchParams.get('i_id');
  const companyName = searchParams.get('company');
  const { interviewId: existingInterviewId, companyName: existingCompanyName } = location.state || {};
  const [questions, setQuestions] = useState<{
    technical: QuizQuestion[];
    aptitude: QuizQuestion[];
  }>({ technical: [], aptitude: [] });
  const [currentSection, setCurrentSection] = useState<'technical' | 'aptitude'>('aptitude');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{
    technical: (number | number[])[];
    aptitude: (number | number[])[];
  }>({ technical: [], aptitude: [] });
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
          let answerType: 'single' | 'multiple' | 'true_false' = 'single';
          
          if (question.options.length === 2) {
            answerType = 'true_false';
          } else if (correctOptions > 1) {
            answerType = 'multiple';
          }
          
          return {
            ...question,
            answerType
          };
        });

        // Separate questions by type
        const technicalQuestions = processedQuestions.filter((q: QuizQuestion) => q.type === 'technical');
        const aptitudeQuestions = processedQuestions.filter((q: QuizQuestion) => q.type === 'aptitude');
        
        setQuestions({
          technical: technicalQuestions,
          aptitude: aptitudeQuestions
        });

        // Initialize answers arrays
        setAnswers({
          technical: technicalQuestions.map((q: QuizQuestion) => q.answerType === 'multiple' ? [] : -1),
          aptitude: aptitudeQuestions.map((q: QuizQuestion) => q.answerType === 'multiple' ? [] : -1)
        });

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
    const currentQuestions = questions[currentSection];
    const question = currentQuestions[questionIndex];
    const newAnswers = { ...answers };
    const sectionAnswers = [...newAnswers[currentSection]];
    
    if (question.answerType === 'single' || question.answerType === 'true_false') {
      sectionAnswers[questionIndex] = optionId;
    } else if (question.answerType === 'multiple') {
      const currentAnswers = (sectionAnswers[questionIndex] as number[]) || [];
      if (currentAnswers.includes(optionId)) {
        sectionAnswers[questionIndex] = currentAnswers.filter(id => id !== optionId);
      } else {
        sectionAnswers[questionIndex] = [...currentAnswers, optionId];
      }
    }
    
    newAnswers[currentSection] = sectionAnswers;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const currentAnswers = answers[currentSection];
    const unanswered = currentAnswers.filter(answer => 
      Array.isArray(answer) ? answer.length === 0 : answer === -1
    ).length;
    
    if (unanswered > 0) {
      toast.warning(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`);
      return;
    }

    if (currentSection === 'aptitude' && questions.technical.length > 0) {
      // Move to technical section
      setCurrentSection('technical');
      setCurrentQuestionIndex(0);
      return;
    }

    try {
      const allResponses = [
        ...questions.aptitude.map((question, index) => {
          const answer = answers.aptitude[index];
          if (Array.isArray(answer)) {
            return answer.map(optionId => ({
              question_id: question.id,
              option_id: optionId
            }));
          }
          return [{
            question_id: question.id,
            option_id: answer
          }];
        }),
        ...questions.technical.map((question, index) => {
          const answer = answers.technical[index];
          if (Array.isArray(answer)) {
            return answer.map(optionId => ({
              question_id: question.id,
              option_id: optionId
            }));
          }
          return [{
            question_id: question.id,
            option_id: answer
          }];
        })
      ].flat();

      await quizAPI.submitQuizResponses(allResponses);
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
      // First get the job_id from the interview
      api.get(`/interview?id=${i_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      }).then(interviewResponse => {
        const jobId = interviewResponse.data.job_id;
        
        // Then fetch the job data
        return jobAPI.candidateGetJob(jobId);
      }).then(response => {
        const jobData = response.data;
        if (jobData.hasDSATest) {
          navigate(`/interview/dsa-playground?i_id=${i_id}&company=${company}`);
        } else {
          navigate(`/interview/video?i_id=${i_id}&company=${company}`);
        }
      }).catch(error => {
        console.error('Error fetching job data:', error);
        navigate(`/interview/video?i_id=${i_id}&company=${company}`);
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions[currentSection].length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const renderQuestionOptions = (question: QuizQuestion, questionIndex: number) => {
    if (question.answerType === 'true_false') {
      return (
        <div className="space-y-4">
          <RadioGroup
            value={answers[currentSection][questionIndex]?.toString()}
            onValueChange={(value) => handleAnswerSelect(questionIndex, parseInt(value))}
            name={`question-${currentSection}-${question.id}`}
          >
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.id.toString()} 
                  id={`option-${currentSection}-${question.id}-${option.id}`}
                />
                <Label htmlFor={`option-${currentSection}-${question.id}-${option.id}`} className="text-lg">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    if (question.answerType === 'multiple') {
      return (
        <div className="space-y-4">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${currentSection}-${question.id}-${option.id}`}
                checked={Array.isArray(answers[currentSection][questionIndex]) 
                  ? (answers[currentSection][questionIndex] as number[]).includes(option.id)
                  : false}
                onCheckedChange={() => handleAnswerSelect(questionIndex, option.id)}
              />
              <Label htmlFor={`option-${currentSection}-${question.id}-${option.id}`} className="text-lg">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    if (question.answerType === 'single') {
      return (
        <RadioGroup
          value={answers[currentSection][questionIndex]?.toString()}
          onValueChange={(value) => handleAnswerSelect(questionIndex, parseInt(value))}
          name={`question-${currentSection}-${question.id}`}
          className="space-y-2"
        >
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.id.toString()} 
                id={`option-${currentSection}-${question.id}-${option.id}`}
              />
              <Label htmlFor={`option-${currentSection}-${question.id}-${option.id}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questions.aptitude.length === 0 && questions.technical.length === 0) {
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
                Welcome to the MCQ test section. This test consists of {questions.aptitude.length + questions.technical.length} questions.
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
                    <p className="text-sm text-muted-foreground">{questions.aptitude.length + questions.technical.length}</p>
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
                  {currentSection === 'aptitude' 
                    ? `${answers.aptitude.filter(a => a !== -1 && (Array.isArray(a) ? a.length > 0 : true)).length} of ${questions.aptitude.length} answered`
                    : `${answers.technical.filter(a => a !== -1 && (Array.isArray(a) ? a.length > 0 : true)).length} of ${questions.technical.length} answered`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Aptitude Questions</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {questions.aptitude.map((_, index) => (
                        <Button
                          key={index}
                          variant={answers.aptitude[index] !== undefined && (Array.isArray(answers.aptitude[index]) ? answers.aptitude[index].length > 0 : true)
                            ? "default"
                            : "outline"}
                          size="sm"
                          className={`w-full h-10 ${
                            answers.aptitude[index] !== undefined && (Array.isArray(answers.aptitude[index]) ? answers.aptitude[index].length > 0 : true)
                              ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/20 text-foreground"
                              : ""
                          }`}
                          onClick={() => setCurrentSection('aptitude')}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {questions.technical.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Technical Questions</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {questions.technical.map((_, index) => (
                          <Button
                            key={index}
                            variant={answers.technical[index] !== undefined && (Array.isArray(answers.technical[index]) ? answers.technical[index].length > 0 : true)
                              ? "default"
                              : "outline"}
                            size="sm"
                            className={`w-full h-10 ${
                              answers.technical[index] !== undefined && (Array.isArray(answers.technical[index]) ? answers.technical[index].length > 0 : true)
                                ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/20 text-foreground"
                                : ""
                            }`}
                            onClick={() => setCurrentSection('technical')}
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <CardTitle>MCQ Test - {currentSection === 'aptitude' ? 'Aptitude' : 'Technical'} Section</CardTitle>
                      <CardDescription>
                        Time Remaining: {formatTime(timeLeft)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions[currentSection].map((question, index) => (
                  <div 
                    key={question.id} 
                    className="p-6 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                      <Badge variant="outline">
                        {question.answerType === 'true_false' ? 'True/False' : 
                         question.answerType === 'multiple' ? 'Multiple Choice' : 
                         'Single Choice'}
                      </Badge>
                    </div>
                    <p className="text-base mb-4">{question.description}</p>
                    {renderQuestionOptions(question, index)}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button onClick={handleSubmit}>
                  {currentSection === 'aptitude' && questions.technical.length > 0 ? 'Next Section' : 'Submit'}
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