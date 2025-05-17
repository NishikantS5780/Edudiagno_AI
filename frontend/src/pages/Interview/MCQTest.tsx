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
  type: 'single' | 'multiple' | 'true_false';
  category: 'technical' | 'aptitude';
  answerType: 'single' | 'multiple' | 'true_false';
  time_seconds: number;
}

interface QuestionTimer {
  questionId: number;
  timeLeft: number;
  isActive: boolean;
  isExpired: boolean;
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
  const [questionTimers, setQuestionTimers] = useState<QuestionTimer[]>([]);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [warningShown, setWarningShown] = useState(false);
  const [markedForLater, setMarkedForLater] = useState<{
    technical: boolean[];
    aptitude: boolean[];
  }>({ technical: [], aptitude: [] });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log('Fetching quiz questions...');
        const response = await quizAPI.getQuizQuestions(interviewId || '');
        console.log('Raw quiz questions response:', response);
        console.log('Quiz questions data:', response.data);
        
        const processedQuestions = response.data.map((question: any) => {
          const answerType = question.type;
          const category = (question.category).toLowerCase();
          const time_seconds = question.time_seconds || 60;
          
          return {
            ...question,
            answerType,
            category,
            time_seconds
          };
        });

        const technicalQuestions = processedQuestions.filter((q: QuizQuestion) => q.category.toLowerCase() === 'technical');
        const aptitudeQuestions = processedQuestions.filter((q: QuizQuestion) => q.category.toLowerCase() === 'aptitude');
        
        setQuestions({
          technical: technicalQuestions,
          aptitude: aptitudeQuestions
        });

        setAnswers({
          technical: technicalQuestions.map((q: QuizQuestion) => q.answerType === 'multiple' ? [] : -1),
          aptitude: aptitudeQuestions.map((q: QuizQuestion) => q.answerType === 'multiple' ? [] : -1)
        });

        setMarkedForLater({
          technical: new Array(technicalQuestions.length).fill(false),
          aptitude: new Array(aptitudeQuestions.length).fill(false)
        });

        // Initialize question timers
        const allQuestions = [...technicalQuestions, ...aptitudeQuestions];
        const timers = allQuestions.map(q => ({
          questionId: q.id,
          timeLeft: q.time_seconds,
          isActive: false,
          isExpired: false
        }));
        setQuestionTimers(timers);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        toast.error("Failed to load questions");
        setIsLoading(false);
      }
    };

    if (interviewId) {
      fetchQuestions();
    }
  }, [interviewId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isTestStarted) {
      timer = setInterval(() => {
        setQuestionTimers(prevTimers => {
          return prevTimers.map(timer => {
            if (timer.isActive && !timer.isExpired && timer.timeLeft > 0) {
              const newTimeLeft = timer.timeLeft - 1;
          
              // Show warning when 10 seconds are left
              if (newTimeLeft === 10 && !warningShown) {
                toast.warning("10 seconds remaining for this question!");
            setWarningShown(true);
          }
          
              // If time runs out
              if (newTimeLeft === 0) {
                toast.error("Time's up for this question!");
                return { ...timer, timeLeft: 0, isExpired: true };
              }
              
              return { ...timer, timeLeft: newTimeLeft };
            }
            return timer;
          });
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isTestStarted, warningShown]);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    
    if (isCountingDown && countdown > 0) {
      countdownTimer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setIsTestStarted(true);
      // Activate timer for first question
      setQuestionTimers(prevTimers => {
        const firstQuestion = questions[currentSection][0];
        return prevTimers.map(timer => ({
          ...timer,
          isActive: timer.questionId === firstQuestion.id
        }));
      });
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [countdown, isCountingDown, questions, currentSection]);

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
      // Activate timer for first technical question
      setQuestionTimers(prevTimers => {
        const firstQuestion = questions.technical[0];
        return prevTimers.map(timer => ({
          ...timer,
          isActive: timer.questionId === firstQuestion.id
        }));
      });
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
      api.get(`/interview?id=${i_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      }).then(interviewResponse => {
        const jobId = interviewResponse.data.job_id;
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
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      const question = questions[currentSection][newIndex];
      
      // Update timers
      setQuestionTimers(prevTimers => {
        return prevTimers.map(timer => ({
          ...timer,
          isActive: timer.questionId === question.id
        }));
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions[currentSection].length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      const question = questions[currentSection][newIndex];
      
      // Update timers
      setQuestionTimers(prevTimers => {
        return prevTimers.map(timer => ({
          ...timer,
          isActive: timer.questionId === question.id
        }));
      });
    }
  };

  const handleMarkForLater = (index: number) => {
    setMarkedForLater(prev => ({
      ...prev,
      [currentSection]: prev[currentSection].map((marked, i) => 
        i === index ? !marked : marked
      )
    }));
  };

  const getCurrentQuestionTimer = () => {
    const currentQuestion = questions[currentSection][currentQuestionIndex];
    return questionTimers.find(timer => timer.questionId === currentQuestion.id);
  };

  const renderQuestionOptions = (question: QuizQuestion, questionIndex: number) => {
    const timer = questionTimers.find(t => t.questionId === question.id);
    const isExpired = timer?.isExpired;

    if (question.answerType === 'single' || question.answerType === 'true_false') {
      return (
          <RadioGroup
            value={answers[currentSection][questionIndex]?.toString()}
            onValueChange={(value) => handleAnswerSelect(questionIndex, parseInt(value))}
            name={`question-${currentSection}-${question.id}`}
          className="space-y-2"
          disabled={isExpired}
          >
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.id.toString()} 
                  id={`option-${currentSection}-${question.id}-${option.id}`}
                disabled={isExpired}
                />
              <Label htmlFor={`option-${currentSection}-${question.id}-${option.id}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
      );
    }

    if (question.answerType === 'multiple') {
      return (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${currentSection}-${question.id}-${option.id}`}
                checked={Array.isArray(answers[currentSection][questionIndex]) 
                  ? (answers[currentSection][questionIndex] as number[]).includes(option.id)
                  : false}
                onCheckedChange={() => handleAnswerSelect(questionIndex, option.id)}
                disabled={isExpired}
              />
              <Label htmlFor={`option-${currentSection}-${question.id}-${option.id}`}>{option.label}</Label>
            </div>
          ))}
        </div>
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
                    <p className="text-sm text-muted-foreground">Individual timers per question</p>
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
        <div className="flex flex-col gap-6">
          {/* Section Navigation */}
          <div className="flex justify-between items-center p-4 bg-card rounded-lg border">
            <div className="flex gap-4">
              <Button
                variant={currentSection === 'aptitude' ? 'default' : 'outline'}
                onClick={() => setCurrentSection('aptitude')}
              >
                Aptitude Section
                <Badge variant="secondary" className="ml-2">
                  {answers.aptitude.filter(a => a !== -1 && (Array.isArray(a) ? a.length > 0 : true)).length}/{questions.aptitude.length}
                </Badge>
              </Button>
              <Button
                variant={currentSection === 'technical' ? 'default' : 'outline'}
                onClick={() => setCurrentSection('technical')}
              >
                Technical Section
                <Badge variant="secondary" className="ml-2">
                  {answers.technical.filter(a => a !== -1 && (Array.isArray(a) ? a.length > 0 : true)).length}/{questions.technical.length}
                </Badge>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-destructive" />
              <span className="font-medium">{formatTime(getCurrentQuestionTimer()?.timeLeft || 0)}</span>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Side Panel */}
            <div className="w-64 shrink-0 sticky top-4 self-start">
              <Card className="sticky top-4">
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
                        {questions.aptitude.map((_, index) => {
                          const isAnswered = answers.aptitude[index] !== -1 && 
                            (Array.isArray(answers.aptitude[index]) ? answers.aptitude[index].length > 0 : true);
                          const isMarked = markedForLater.aptitude[index];
                          const timer = questionTimers.find(t => t.questionId === questions.aptitude[index].id);
                          const isExpired = timer?.isExpired;
                          
                          return (
                            <Button
                              key={index}
                              variant={isMarked ? "secondary" : isAnswered ? "default" : "outline"}
                              size="sm"
                              className={`w-full h-10 ${
                                isMarked
                                  ? "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 border-2 border-amber-400"
                                  : isAnswered
                                    ? "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-2 border-emerald-400"
                                    : isExpired
                                      ? "bg-red-100 hover:bg-red-200 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-2 border-red-400"
                                    : "hover:bg-accent"
                              }`}
                              onClick={() => {
                                setCurrentSection('aptitude');
                                setCurrentQuestionIndex(index);
                                const question = questions.aptitude[index];
                                setQuestionTimers(prevTimers => {
                                  return prevTimers.map(timer => ({
                                    ...timer,
                                    isActive: timer.questionId === question.id
                                  }));
                                });
                              }}
                            >
                              {index + 1}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    {questions.technical.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">Technical Questions</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {questions.technical.map((_, index) => {
                            const isAnswered = answers.technical[index] !== -1 && 
                              (Array.isArray(answers.technical[index]) ? answers.technical[index].length > 0 : true);
                            const isMarked = markedForLater.technical[index];
                            const timer = questionTimers.find(t => t.questionId === questions.technical[index].id);
                            const isExpired = timer?.isExpired;
                            
                            return (
                              <Button
                                key={index}
                                variant={isMarked ? "secondary" : isAnswered ? "default" : "outline"}
                                size="sm"
                                className={`w-full h-10 ${
                                  isMarked
                                    ? "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 border-2 border-amber-400"
                                    : isAnswered
                                      ? "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-2 border-emerald-400"
                                      : isExpired
                                        ? "bg-red-100 hover:bg-red-200 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-2 border-red-400"
                                      : "hover:bg-accent"
                                }`}
                                onClick={() => {
                                  setCurrentSection('technical');
                                  setCurrentQuestionIndex(index);
                                  const question = questions.technical[index];
                                  setQuestionTimers(prevTimers => {
                                    return prevTimers.map(timer => ({
                                      ...timer,
                                      isActive: timer.questionId === question.id
                                    }));
                                  });
                                }}
                              >
                                {index + 1}
                              </Button>
                            );
                          })}
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
                          Question {currentQuestionIndex + 1} of {questions[currentSection].length}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-destructive" />
                        <span className="font-medium">{formatTime(getCurrentQuestionTimer()?.timeLeft || 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    const question = questions[currentSection][currentQuestionIndex];
                    const timer = questionTimers.find(t => t.questionId === question.id);
                    const isExpired = timer?.isExpired;

                    return (
                      <div className="p-6 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1}</h3>
                          <Badge variant="outline">
                            {question.answerType === 'true_false' ? 'True/False' : 
                             question.answerType === 'multiple' ? 'Multiple Choice' : 
                             'Single Choice'}
                          </Badge>
                        </div>
                        <Button
                            variant={markedForLater[currentSection][currentQuestionIndex] ? "secondary" : "outline"}
                          size="sm"
                            onClick={() => handleMarkForLater(currentQuestionIndex)}
                          className={`${
                              markedForLater[currentSection][currentQuestionIndex] 
                              ? "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100" 
                              : "hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
                          }`}
                        >
                            {markedForLater[currentSection][currentQuestionIndex] ? "Marked for Later" : "Mark for Later"}
                        </Button>
                      </div>
                      <p className="text-base mb-4">{question.description}</p>
                        {renderQuestionOptions(question, currentQuestionIndex)}
                        {isExpired && (
                          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 rounded-lg">
                            <p className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5" />
                              Time's up for this question!
                            </p>
                          </div>
                        )}
                    </div>
                    );
                  })()}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                  {currentSection === 'aptitude' && questions.technical.length > 0 ? (
                    <Button onClick={() => setCurrentSection('technical')}>
                      Next Section
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit}
                      disabled={
                        answers.aptitude.some(a => a === -1 || (Array.isArray(a) && a.length === 0)) ||
                        answers.technical.some(a => a === -1 || (Array.isArray(a) && a.length === 0))
                      }
                    >
                      Submit Test
                    </Button>
                  )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions[currentSection].length - 1}
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Start Test?</CardTitle>
              <CardDescription>
                Each question has its own timer. Once you start, you cannot pause the test. Are you ready?
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