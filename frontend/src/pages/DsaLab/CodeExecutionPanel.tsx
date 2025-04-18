import React from 'react'
import { Editor } from "@monaco-editor/react";
import { Play, Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
function CodeExecutionPanel({expectedOutput}: {expectedOutput: string}) {
  const [taskId, setTaskId] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [codeError, setCodeError] = React.useState("");
  const [syntaxError, setSyntaxError] = React.useState("");
  const [runStatus, setRunStatus] = React.useState("");
  const apiKey = import.meta.env.VITE_FERMION_API_KEY;

  React.useEffect(() => console.log(taskId), [taskId]);

  const availableLanguages: string[] = ['C', 'Python', 'Java', 'Cpp', 'Nodejs'];

  // const expectedOutput = "Hello"; // set What result is required here nowww ...
  const codeTemplates: Record<string, string> = {
    'C': '#include <stdio.h>\nint main(){\n\tprintf("Hello, World!");\n\treturn 0;\n}',
    'Python': 'print("Hello, World!")',
    'Java': 'public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}',
    'Cpp': '#include <iostream>\nint main() {\n\tstd::cout << "Hello, World!" << std::endl;\n\treturn 0;\n}',
    // 'sqlite_3_48_0': 'SELECT "Hello, World!" AS message;',
    'Nodejs': 'console.log("Hello, World!");',
  };
  const monacoLanguages: Record<string, string> = {
    'C': 'c',
    'Python': 'python',
    'Java': 'java',
    'Cpp': 'cpp',
    // 'sqlite_3_48_0': 'sql',
    'Nodejs': 'javascript',
  };
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('C');
  const [code, setCode] = React.useState(codeTemplates['C']);
  React.useEffect(() => {
    setCode(codeTemplates[selectedLanguage]);
  }, [selectedLanguage]);
  const handleCodeRun = () => {
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
                  customMatcherToUseForExpectedOutput: "ExactMatch",
                  expectedOutputAsBase64UrlEncoded: btoa(expectedOutput) // TO set Expected output 
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_")
                    .replace(/=+$/, ""),
                  stdinStringAsBase64UrlEncoded: "",
                  // callbackUrlOnExecutionCompletion: "", // this is commented line one 
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
                sourceCodeAsBase64UrlEncoded: btoa(code)
                  .replace(/\+/g, "-")
                  .replace(/\//g, "_")
                  .replace(/=+$/, ""),
              },
            },
          ],
        }),
      }
    )
      .then((res) => res.json())
      .then((body) => setTaskId(body[0].output.data.taskId));
  };

  const handleViewStatus = () => {
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
      .then((res) => res.json())
      .then((body) => {
        let data = body[0].output.data.runResult;
        console.log("Dataaa = ", data);
        if (data.programRunData != null) {
          let err = data.programRunData.stderrBase64UrlEncoded
            .replace(/-/g, "+")
            .replace(/_/g, "/");
          console.log("error = ", atob(err));
          setCodeError(atob(err));
          let output = data.programRunData.stdoutBase64UrlEncoded
            .replace(/-/g, "+")
            .replace(/_/g, "/");
          console.log("o/p - ", atob(output));
          setOutput(atob(output)) // output final
        }

        let compiler_syntax_error = data.compilerOutputAfterCompilationBase64UrlEncoded
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        // console.log("checkinggg = ",atob(compiler_syntax_error));
        setSyntaxError(atob(compiler_syntax_error))

        let run_status = data.runStatus;
        setRunStatus(run_status);
      });
  };
  return (
    <div className="bg-[#18181b]">
      <div className="flex justify-center gap-6 py-2">
        <button className="flex bg-green-400 px-4 rounded-xl py-1 justify-center items-center gap-1" onClick={handleCodeRun}>
          <span><Play fill="white" color="white" size={15} /></span>
          <span className="text-white">Run</span>
        </button>
        <button className="bg-white px-4 text-black rounded-xl" onClick={handleViewStatus}>View Status</button>
        <div className="">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-[#27272a] text-white rounded p-1 pr-10"
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>
      <div className=" h-[86vh] bg-[#27272a] rounded-xl">

        <Editor
          height="360px"
          width="100%"
          language={monacoLanguages[selectedLanguage] || 'plaintext'}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
        <div className="bg-[#18181b] p-2"></div>
        <Tabs defaultValue="result" className="w-full ">
          <div className="bg-[#27272a] mt-2 rounded-xl text-white p-2 ">
            <TabsList className="bg-[#3f3f45] w-full justify-start rounded-xl">
              <TabsTrigger value="result"
                className="data-[state=active]:bg-[#27272a] rounded-xl"
              >Result</TabsTrigger>
              <TabsTrigger value="test-case"
                className="data-[state=active]:bg-[#27272a] rounded-xl"
              >Test Case</TabsTrigger>
            </TabsList>
            <TabsContent value="result" className="py-2">
              {runStatus == 'compilation-error' ? <div></div> : <div className="flex gap-2 text-green-400">
                <Terminal />{output}
              </div>}
              <div className="text-red-500">{codeError}</div>
              <div className="text-red-500">{syntaxError}</div>
              <h1>Result Status - </h1>
              <div className={`${runStatus == 'successful' ? 'text-green-400' : 'text-red-500'}`}>{runStatus}</div>
              <h1>Expected Output - </h1>
              <div className="text-yellow-400">{expectedOutput}</div>
            </TabsContent>
            <TabsContent value="test-case" className="py-2">
              <h1>Test Case - </h1>
              <div className={`${runStatus == 'successful' ? 'text-green-400' : 'text-red-500'}`}>{runStatus}</div>
              <h1>Expected Output - </h1>
              <div className="text-yellow-400">{expectedOutput}</div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default CodeExecutionPanel