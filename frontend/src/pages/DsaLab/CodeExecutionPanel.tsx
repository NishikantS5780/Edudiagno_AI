import React from "react";
import { Editor } from "@monaco-editor/react";
import { Play, Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { dsaAPI } from "@/lib/api";

interface CodeExecutionPanelProps {
  questionId: number;
  expectedOutput: string;
  onCompilationStatusChange?: (status: string) => void;
  onSuccessRateChange?: (rate: string) => void;
}

function CodeExecutionPanel({
  questionId,
  expectedOutput,
  onCompilationStatusChange,
  onSuccessRateChange,
}: CodeExecutionPanelProps) {
  const [taskId, setTaskId] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [codeError, setCodeError] = React.useState("");
  const [syntaxError, setSyntaxError] = React.useState("");
  const [runStatus, setRunStatus] = React.useState("");
  const [successRate, setSuccessRate] = React.useState("0%");
  const apiKey = import.meta.env.VITE_FERMION_API_KEY;

  if (!apiKey) {
    console.error("Fermion API key is not set in environment variables");
    setCodeError("API configuration error. Please contact support.");
  }

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const handleFinish = () => {
    navigate(`/interview/precheck?i_id=${searchParams.get("i_id")}`);
  };

  React.useEffect(() => console.log(taskId), [taskId]);

  const availableLanguages: string[] = [
    "C",
    "Python",
    "Java",
    "Cpp",
    "Nodejs",
    "Sqlite_3_48_0",
  ];

  // const expectedOutput = "Hello"; // set What result is required here nowww ...
  const codeTemplates: Record<string, string> = {
    C: '#include <stdio.h>\nint main(){\n\tprintf("Hello, World!");\n\treturn 0;\n}',
    Python: 'print("Hello, World!")',
    Java: 'public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}',
    Cpp: '#include <iostream>\nint main() {\n\tstd::cout << "Hello, World!" << std::endl;\n\treturn 0;\n}',
    Sqlite_3_48_0: "SELECT 'Hello, World!' AS message;",
    Nodejs: 'console.log("Hello, World!");',
  };
  const monacoLanguages: Record<string, string> = {
    C: "c",
    Python: "python",
    Java: "java",
    Cpp: "cpp",
    Sqlite_3_48_0: "sql",
    Nodejs: "javascript",
  };
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("C");
  const [code, setCode] = React.useState(codeTemplates["C"]);
  React.useEffect(() => {
    setCode(codeTemplates[selectedLanguage]);
  }, [selectedLanguage]);
  const handleCodeRun = () => {
    if (!apiKey) {
      setCodeError("API configuration error. Please contact support.");
      return;
    }

    // Reset states before running
    setOutput("");
    setCodeError("");
    setSyntaxError("");
    setRunStatus("");

    // Store the current code in state before sending to API
    const currentCode = code || codeTemplates[selectedLanguage];
    setCode(currentCode);

    fetch(
      "https://backend.codedamn.com/api/public/request-dsa-code-execution",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "FERMION-API-KEY": apiKey,
        },
        body: JSON.stringify({
          data: [
            {
              data: {
                language: selectedLanguage,
                runConfig: {
                  customMatcherToUseForExpectedOutput:
                    "IgnoreWhitespaceAtStartAndEndForEveryLine",
                  expectedOutputAsBase64UrlEncoded: btoa(expectedOutput)
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_")
                    .replace(/=+$/, ""),
                  stdinStringAsBase64UrlEncoded: "",
                  shouldEnablePerProcessAndThreadCpuTimeLimit: false,
                  shouldEnablePerProcessAndThreadMemoryLimit: false,
                  shouldAllowInternetAccess: false,
                  compilerFlagString: "",
                  maxFileSizeInKilobytesFilesCreatedOrModified: 1024,
                  stackSizeLimitInKilobytes: 65536,
                  cpuTimeLimitInMilliseconds: 2000,
                  wallTimeLimitInMilliseconds: 5000,
                  memoryLimitInKilobyte: 131072,
                  maxProcessesAndOrThreads: 60,
                },
                sourceCodeAsBase64UrlEncoded: btoa(currentCode)
                  .replace(/\+/g, "-")
                  .replace(/\//g, "_")
                  .replace(/=+$/, ""),
              },
            },
          ],
        }),
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        dsaAPI.runCode({ code: currentCode, question_id: 1 }).then().catch();
        return res.json();
      })
      .then((body) => {
        console.log("API Response:", body);
        if (
          !body ||
          !Array.isArray(body) ||
          !body[0] ||
          !body[0].output ||
          !body[0].output.data ||
          !body[0].output.data.taskId
        ) {
          throw new Error("Invalid response format from API");
        }
        setTaskId(body[0].output.data.taskId);
        // Start checking status immediately
        handleViewStatus();
      })
      .catch((error) => {
        console.error("Error running code:", error);
        setCodeError(`Error: ${error.message}`);
        setRunStatus("error");
      });
  };

  const handleViewStatus = () => {
    if (!taskId) {
      setCodeError("No task ID available. Please run the code first.");
      return;
    }

    const checkStatus = () => {
      if (!apiKey) {
        setCodeError("API configuration error. Please contact support.");
        return;
      }

      fetch(
        "https://backend.codedamn.com/api/public/get-dsa-code-execution-result",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "FERMION-API-KEY": apiKey,
          },
          body: JSON.stringify({
            data: [
              {
                data: {
                  taskUniqueId: taskId,
                },
              },
            ],
          }),
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((body) => {
          console.log("Raw Status API Response:", body);

          if (!Array.isArray(body) || body.length === 0) {
            console.error("Response is not an array or is empty:", body);
            throw new Error("Invalid response format: expected array");
          }

          const firstResponse = body[0];
          console.log("First response element:", firstResponse);

          if (!firstResponse || !firstResponse.output) {
            console.error(
              "First response element missing output:",
              firstResponse
            );
            throw new Error("Invalid response format: missing output");
          }

          const output = firstResponse.output;
          console.log("Output object:", output);

          if (!output.data) {
            console.error("Output missing data:", output);
            throw new Error("Invalid response format: missing data");
          }

          const data = output.data;
          console.log("Data object:", data);

          // Update the editor with the submitted code
          if (data.sourceCodeAsBase64UrlEncoded) {
            const decodedCode = atob(
              data.sourceCodeAsBase64UrlEncoded
                .replace(/-/g, "+")
                .replace(/_/g, "/")
            );
            console.log("Decoded submitted code:", decodedCode);
            setCode(decodedCode);
          }

          // Check if the task is still pending
          if (data.codingTaskStatus === "Pending") {
            console.log(
              "Task is still pending, checking again in 2 seconds..."
            );
            setTimeout(checkStatus, 2000); // Poll every 2 seconds
            return;
          }

          // If task is completed, check for runResult
          if (!data.runResult) {
            console.error("Data missing runResult:", data);
            throw new Error("Invalid response format: missing runResult");
          }

          let runResult = data.runResult;
          console.log("Run Result Data:", runResult);

          if (runResult.programRunData != null) {
            let err = runResult.programRunData.stderrBase64UrlEncoded
              ?.replace(/-/g, "+")
              ?.replace(/_/g, "/");
            if (err) {
              const decodedError = atob(err);
              console.log("error = ", decodedError);
              if (!decodedError.includes("cannot read ~/.sqliterc")) {
                setCodeError(decodedError);
              }
            }

            let output = runResult.programRunData.stdoutBase64UrlEncoded
              ?.replace(/-/g, "+")
              ?.replace(/_/g, "/");
            if (output) {
              console.log("o/p - ", atob(output));
              setOutput(atob(output));
            }
          }

          let compiler_syntax_error =
            runResult.compilerOutputAfterCompilationBase64UrlEncoded
              ?.replace(/-/g, "+")
              ?.replace(/_/g, "/");
          if (compiler_syntax_error) {
            setSyntaxError(atob(compiler_syntax_error));
          }

          let run_status = runResult.runStatus;
          setRunStatus(run_status);

          // Calculate success rate based on output matching
          const isSuccess = output === expectedOutput;
          const newSuccessRate = isSuccess ? "100%" : "0%";
          setSuccessRate(newSuccessRate);
          onSuccessRateChange?.(newSuccessRate);

          // Update compilation status
          const compilationStatus =
            run_status === "Success"
              ? "Compiled Successfully"
              : run_status === "Error"
              ? "Compilation Failed"
              : "Compiling...";
          onCompilationStatusChange?.(compilationStatus);
        })
        .catch((error) => {
          console.error("Error checking status:", error);
          setCodeError(`Error: ${error.message}`);
          setRunStatus("error");
          onCompilationStatusChange?.("Compilation Failed");
        });
    };

    checkStatus();
  };
  return (
    <div className="bg-[#18181b] min-h-screen">
      <div className="flex flex-col h-full">
        {/* Header with controls */}
        <div className="flex justify-between items-center p-4 bg-[#27272a] border-b border-[#3f3f46]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setOutput("");
                setCodeError("");
                setSyntaxError("");
                setRunStatus("");

                const currentCode = code || codeTemplates[selectedLanguage];
                setCode(currentCode);

                fetch(import.meta.env.VITE_API_BASE_URL + "/dsa-response", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    code: currentCode,
                    question_id: questionId,
                  }),
                });
              }}
            >
              Run Via Backend
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-green-500/20"
              onClick={handleCodeRun}
            >
              <Play size={16} />
              <span>Run Code</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-blue-500/20"
              onClick={handleViewStatus}
            >
              <Terminal size={16} />
              <span>View Status</span>
            </button>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="appearance-none bg-[#3f3f46] text-white rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleFinish}
              size="sm"
              className={cn(
                "px-4 py-2 rounded-lg transition-colors shadow-lg",
                runStatus === "successful"
                  ? "bg-green-500 hover:bg-green-600 text-white hover:shadow-green-500/20"
                  : "hidden"
              )}
              disabled={runStatus !== "successful"}
            >
              Continue
            </Button>
            <Button
              onClick={handleFinish}
              size="sm"
              className={cn(
                "px-4 py-2 rounded-lg transition-colors shadow-lg",
                runStatus !== "successful"
                  ? "bg-red-500 hover:bg-red-600 text-white hover:shadow-red-500/20"
                  : "hidden"
              )}
              disabled={runStatus === "successful"}
            >
              Skip & Next
            </Button>
          </div>
        </div>

        {/* Editor and Output Area */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 min-h-[400px] relative">
            <div className="absolute top-0 left-0 right-0 h-8 bg-[#1e1e1e] flex items-center px-4 border-b border-[#3f3f46]">
              <span className="text-sm text-gray-400">{selectedLanguage}</span>
            </div>
            <div className="absolute top-8 bottom-0 left-0 right-0">
              <Editor
                height="100%"
                width="100%"
                language={monacoLanguages[selectedLanguage] || "plaintext"}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  scrollbar: {
                    vertical: "visible",
                    horizontal: "visible",
                    useShadows: false,
                  },
                  renderWhitespace: "boundary",
                  wordWrap: "on",
                  bracketPairColorization: {
                    enabled: true,
                  },
                  guides: {
                    bracketPairs: true,
                  },
                }}
              />
            </div>
          </div>

          {/* Output Tabs */}
          <div className="bg-[#18181b] border-t border-[#3f3f46]">
            <Tabs defaultValue="result" className="w-full">
              <TabsList className="bg-[#27272a] w-full justify-start border-b border-[#3f3f46]">
                <TabsTrigger
                  value="result"
                  className="data-[state=active]:bg-[#18181b] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-4 py-2"
                >
                  Result
                </TabsTrigger>
                <TabsTrigger
                  value="test-case"
                  className="data-[state=active]:bg-[#18181b] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-4 py-2"
                >
                  Test Case
                </TabsTrigger>
              </TabsList>

              <TabsContent value="result" className="p-4 space-y-4">
                {runStatus === "compilation-error" ? null : (
                  <div className="flex items-start gap-2 text-green-400 bg-[#27272a] p-3 rounded-lg">
                    <Terminal className="mt-1 flex-shrink-0" />
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {output}
                    </pre>
                  </div>
                )}
                {codeError && (
                  <div className="text-red-500 bg-[#27272a] p-3 rounded-lg">
                    <h3 className="font-semibold mb-1 text-red-400">
                      Runtime Error:
                    </h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {codeError}
                    </pre>
                  </div>
                )}
                {syntaxError && (
                  <div className="text-red-500 bg-[#27272a] p-3 rounded-lg">
                    <h3 className="font-semibold mb-1 text-red-400">
                      Compilation Error:
                    </h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {syntaxError}
                    </pre>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-[#27272a] p-3 rounded-lg">
                  <span className="font-semibold text-gray-400">
                    Compilation Status:
                  </span>
                  <span
                    className={`${
                      !syntaxError ? "text-green-400" : "text-red-500"
                    } font-mono`}
                  >
                    {!syntaxError
                      ? "Successfully Compiled"
                      : "Compilation Failed"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#27272a] p-3 rounded-lg">
                  <span className="font-semibold text-gray-400">
                    Execution Status:
                  </span>
                  <span
                    className={`${
                      runStatus === "successful"
                        ? "text-green-400"
                        : "text-red-500"
                    } font-mono`}
                  >
                    {runStatus === "successful"
                      ? "Successfully Executed"
                      : runStatus === "wrong-answer"
                      ? "Wrong Answer"
                      : runStatus === "compilation-error"
                      ? "Compilation Error"
                      : runStatus === "error"
                      ? "Runtime Error"
                      : runStatus || "Not Executed"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#27272a] p-3 rounded-lg">
                  <span className="font-semibold text-gray-400">
                    Expected Output:
                  </span>
                  <span className="text-yellow-400 font-mono">
                    {expectedOutput}
                  </span>
                </div>
              </TabsContent>

              <TabsContent value="test-case" className="p-4 space-y-4">
                <div className="flex items-center gap-2 bg-[#27272a] p-3 rounded-lg">
                  <span className="font-semibold text-gray-400">Status:</span>
                  <span
                    className={`${
                      runStatus === "successful"
                        ? "text-green-400"
                        : "text-red-500"
                    } font-mono`}
                  >
                    {runStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#27272a] p-3 rounded-lg">
                  <span className="font-semibold text-gray-400">
                    Expected Output:
                  </span>
                  <span className="text-yellow-400 font-mono">
                    {expectedOutput}
                  </span>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeExecutionPanel;
