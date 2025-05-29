import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DsaQuestion from "../DsaLab/DsaQuestion";
import CodeExecutionPanel from "../DsaLab/CodeExecutionPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Code,
  Clock,
  CheckCircle,
  Terminal,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";

interface DSAQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  constraints: string;
  time_minutes: number;
}

interface TestCase {
  id: number;
  input: string;
  expected_output: string;
}

const DSAPlayground = () => {
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get("i_id");
  const [activeTab, setActiveTab] = React.useState("welcome");
  const [compilationStatus, setCompilationStatus] = React.useState<string>("");
  const [successRate, setSuccessRate] = React.useState<string>("");
  const [socket, setSocket] = React.useState<WebSocket>();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [warningShown, setWarningShown] = useState(false);

  // Add fullscreen effect hook with other useEffect hooks
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !(document as any).webkitFullscreenElement &&
        !(document as any).msFullscreenElement
      ) {
        toast.warning("Please stay in fullscreen mode during the assessment");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  React.useEffect(() => {
    const socket = new WebSocket(
      import.meta.env.VITE_WS_BASE_URL +
        "?i_token=" +
        localStorage.getItem("i_token")
    );

    socket.onopen = () => {
      socket.send(JSON.stringify({ hi: "hi" }));
      console.log("Websocket connection established");
    };
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.event == "execution_result") {
        if (data.status == "successful") {
          console.log("Total Test Cases Passed: ", data.passed_count);
          setCompilationStatus(
            "Passed All Test Cases " +
              data.passed_count +
              "/" +
              data.passed_count
          );
        } else if (data.status == "failed") {
          console.log("Failed Test Case: ", data.failed_test_case);
          setCompilationStatus(
            "Failed a test case \nInput: " +
              data.failed_test_case.input +
              "\nExpected output: " +
              data.failed_test_case.expected_output +
              "\nYour Output: " +
              data.failed_test_case.status ==
              "compilation-error"
              ? data.failed_test_case.compilation_output
              : data.failed_test_case.output
          );
        }
      }
    };
    setSocket(socket);
  }, []);

  // Fetch interview data to get job_id
  const { data: interviewData, isLoading: isLoadingInterview } = useQuery({
    queryKey: ["interview", interviewId],
    queryFn: async () => {
      const response = await api.get("/interview", {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      });
      return response.data;
    },
    enabled: !!interviewId,
  });

  // Fetch DSA questions using job_id
  const { data: dsaQuestions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["dsa-questions", interviewData?.job_id],
    queryFn: async () => {
      const response = await api.get(`/dsa-question`, {
        params: { job_id: interviewData?.job_id },
      });
      return response.data;
    },
    enabled: !!interviewData?.job_id,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

  // Get current question and test cases
  const currentQuestion = dsaQuestions?.[currentQuestionIndex];

  const { data: testCases, isLoading: isLoadingTestCases } = useQuery({
    queryKey: ["dsa-test-cases", currentQuestion?.id],
    queryFn: async () => {
      const response = await api.get(`/dsa-test-case`, {
        params: { question_id: currentQuestion?.id },
      });
      return response.data;
    },
    enabled: !!currentQuestion?.id,
  });

  const handleNext = () => {
    if (currentQuestionIndex < dsaQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      console.log("Go to next question: index", currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    console.log("Submit DSA exam at question index", currentQuestionIndex);
    handleComplete();
  };

  const handleComplete = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const i_id = urlParams.get("i_id");
    const company = urlParams.get("company");

    if (i_id && company) {
      navigate(`/interview/video?i_id=${i_id}&company=${company}`);
    }
  };

  // Add loggers before rendering navigation buttons
  console.log("DSA Questions:", dsaQuestions);
  console.log("Current Question Index:", currentQuestionIndex);
  console.log("Current Question:", currentQuestion);

  // Calculate total time based on questions' time_minutes
  const calculateTotalTime = (questions: DSAQuestion[]) => {
    console.log("Calculating total time for DSA questions:", questions);
    const totalTime = questions.reduce((total, question) => {
      const questionTime = question.time_minutes || 30;
      console.log(`DSA Question ${question.id}: ${questionTime} minutes`);
      return total + questionTime;
    }, 0);
    const totalSeconds = totalTime * 60;
    console.log(
      "Total time calculated:",
      totalTime,
      "minutes (",
      totalSeconds,
      "seconds)"
    );
    return totalSeconds;
  };

  useEffect(() => {
    if (dsaQuestions && dsaQuestions.length > 0) {
      console.log("Setting up timer for DSA questions:", dsaQuestions);
      const totalTime = calculateTotalTime(dsaQuestions);
      console.log(
        "Setting total time for DSA assessment:",
        totalTime,
        "seconds"
      );
      setTimeLeft(totalTime);
      setIsTestStarted(true);

      // Request fullscreen when test starts
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    }
  }, [dsaQuestions]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isTestStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          // Show warning when 5 minutes is left
          if (newTime === 300 && !warningShown) {
            console.log("5 minutes remaining warning triggered");
            toast.warning("5 minutes remaining!");
            setWarningShown(true);
          }

          return newTime;
        });
      }, 1000);
    } else if (isTestStarted && timeLeft === 0) {
      console.log("Time is up, submitting DSA assessment");
      // Time's up, submit the test
      handleSubmit();
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft, isTestStarted, warningShown]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoadingInterview || isLoadingQuestions || isLoadingTestCases) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!dsaQuestions || dsaQuestions.length === 0 || !testCases) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">No DSA questions or test cases found</p>
      </div>
    );
  }

  if (!currentQuestion) {
    console.error(
      "Current question is undefined! Index:",
      currentQuestionIndex,
      "Questions:",
      dsaQuestions
    );
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">
          Error: Current question is undefined. Please refresh or contact
          support.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">DSA Playground</h1>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-destructive" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="h-screen flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="bg-muted/20 w-full justify-start border-b shrink-0">
                <TabsTrigger
                  value="welcome"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
                >
                  Welcome
                </TabsTrigger>
                <TabsTrigger
                  value="playground"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
                >
                  DSA Playground
                </TabsTrigger>
              </TabsList>

              <TabsContent value="welcome" className="flex-1 overflow-auto p-4">
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold mb-2">
                      Welcome to DSA Assessment
                    </h1>
                    <p className="text-muted-foreground">
                      Let's test your problem-solving skills
                    </p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>What to Expect</CardTitle>
                        <CardDescription>
                          Here's what you'll be doing in this assessment
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Code className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">Problem Solving</h3>
                              <p className="text-muted-foreground text-sm">
                                You'll be given a coding problem to solve. Take
                                your time to understand the requirements and
                                constraints.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">Time Management</h3>
                              <p className="text-muted-foreground text-sm">
                                There's no strict time limit, but we recommend
                                spending about 15-20 minutes on this assessment.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                Evaluation Criteria
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                Your solution will be evaluated on correctness,
                                efficiency, and code quality.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Getting Started</CardTitle>
                        <CardDescription>
                          Follow these steps to complete your assessment
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                          <li>Read the problem statement carefully</li>
                          <li>Understand the test cases and constraints</li>
                          <li>Write your solution in the code editor</li>
                          <li>
                            Test your solution using the provided test cases
                          </li>
                          <li>Submit when you're confident in your solution</li>
                        </ol>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => setActiveTab("playground")}
                        size="lg"
                      >
                        Start Assessment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="playground"
                className="flex-1 overflow-auto p-4"
              >
                <PanelGroup direction="horizontal" className="h-full">
                  <Panel defaultSize={50} minSize={30}>
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-primary" />
                          <CardTitle>DSA Assessment</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-auto">
                        <DsaQuestion
                          title={`Question ${currentQuestionIndex + 1} of ${
                            dsaQuestions.length
                          }`}
                          successRate={successRate}
                          questionNumber={`${currentQuestionIndex + 1}.`}
                          questionTitle={currentQuestion.title}
                          difficulty={currentQuestion.difficulty}
                          description={currentQuestion.description}
                          testCases={testCases.map((testCase: TestCase) => ({
                            input: testCase.input,
                            expectedOutput: testCase.expected_output,
                          }))}
                          constraints={currentQuestion.constraints}
                          compilationStatus={compilationStatus}
                        />
                      </CardContent>
                    </Card>
                  </Panel>

                  <PanelResizeHandle className="w-2 bg-border hover:bg-primary/50 transition-colors" />

                  <Panel defaultSize={50} minSize={30}>
                    <Card className="h-full">
                      <CardContent className="p-0 h-full">
                        <CodeExecutionPanel
                          questionId={currentQuestion.id}
                          expectedOutput={testCases[0]?.expected_output || ""}
                          setCompilationStatus={setCompilationStatus}
                          onCompilationStatusChange={setCompilationStatus}
                          onSuccessRateChange={setSuccessRate}
                          compilationStatus={compilationStatus}
                          onNext={handleNext}
                          onSubmit={handleSubmit}
                          isLastQuestion={
                            currentQuestionIndex === dsaQuestions.length - 1
                          }
                          isOnlyQuestion={dsaQuestions.length === 1}
                          isFirstQuestion={currentQuestionIndex === 0}
                          currentQuestionIndex={currentQuestionIndex}
                          totalQuestions={dsaQuestions.length}
                        />
                      </CardContent>
                    </Card>
                  </Panel>
                </PanelGroup>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSAPlayground;
