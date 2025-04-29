import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DsaQuestion from "../DsaLab/DsaQuestion";
import CodeExecutionPanel from "../DsaLab/CodeExecutionPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Clock, CheckCircle, Terminal } from "lucide-react";
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

interface DSAQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  constraints: string;
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
      const data = e.data;
      console.log(e, e.data, data);
      if (data.event == "execution_result") {
        if (data.status == "successful") {
          console.log("Total Test Cases Passed: ", data.passed_count);
        } else if (data.status == "failed") {
          console.log("Failed Test Case: ", data.failed_test_case);
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

  // Fetch DSA question using job_id
  const { data: dsaQuestion, isLoading: isLoadingQuestion } = useQuery({
    queryKey: ["dsa-question", interviewData?.job_id],
    queryFn: async () => {
      const response = await api.get(`/dsa-question`, {
        params: { job_id: interviewData?.job_id },
      });
      // Get the first question from the array
      return response.data[0];
    },
    enabled: !!interviewData?.job_id,
  });

  // Fetch test cases using question_id
  const { data: testCases, isLoading: isLoadingTestCases } = useQuery({
    queryKey: ["dsa-test-cases", dsaQuestion?.id],
    queryFn: async () => {
      const response = await api.get(`/dsa-test-case`, {
        params: { question_id: dsaQuestion?.id },
      });
      return response.data;
    },
    enabled: !!dsaQuestion?.id,
  });

  const handleComplete = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const i_id = urlParams.get("i_id");
    const company = urlParams.get("company");

    if (i_id && company) {
      navigate(`/interview/video?i_id=${i_id}&company=${company}`);
    }
  };

  if (isLoadingInterview || isLoadingQuestion || isLoadingTestCases) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!dsaQuestion || !testCases) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">No DSA question or test cases found</p>
      </div>
    );
  }

  return (
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
                            You'll be given a coding problem to solve. Take your
                            time to understand the requirements and constraints.
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
                          <h3 className="font-medium">Evaluation Criteria</h3>
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
                      <li>Test your solution using the provided test cases</li>
                      <li>Submit when you're confident in your solution</li>
                    </ol>
                  </CardContent>
                </Card>

                <div className="flex justify-end pt-2">
                  <Button onClick={() => setActiveTab("playground")} size="lg">
                    Start Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="playground"
            className="flex-1 overflow-hidden p-4"
          >
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 h-full">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    <CardTitle>DSA Assessment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  <DsaQuestion
                    title={`Question ${dsaQuestion.id}`}
                    successRate={successRate}
                    questionNumber={`${dsaQuestion.id}.`}
                    questionTitle={dsaQuestion.title}
                    difficulty={dsaQuestion.difficulty}
                    description={<>{dsaQuestion.description}</>}
                    testCases={testCases.map((testCase: TestCase) => ({
                      input: testCase.input,
                      expectedOutput: testCase.expected_output,
                    }))}
                    constraints={dsaQuestion.constraints}
                    compilationStatus={compilationStatus}
                  />
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <CodeExecutionPanel
                    questionId={dsaQuestion.id}
                    expectedOutput={testCases[0]?.expected_output || ""}
                    onCompilationStatusChange={setCompilationStatus}
                    onSuccessRateChange={setSuccessRate}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DSAPlayground;
