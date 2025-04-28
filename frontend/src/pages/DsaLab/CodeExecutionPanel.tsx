import React from "react";
import { Editor } from "@monaco-editor/react";
import { Play, Terminal, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { dsaAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CodeExecutionPanelProps {
  questionId: number;
  expectedOutput: string;
  onCompilationStatusChange: (status: string) => void;
  onSuccessRateChange: (rate: string) => void;
  code?: string;
  setCode?: (code: string) => void;
  selectedLanguage?: string;
  setSelectedLanguage?: (language: string) => void;
  setRunStatus?: (status: string) => void;
  setOutput?: (output: string | ((prev: string) => string)) => void;
  setCodeError?: (error: string) => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CodeExecutionPanel: React.FC<CodeExecutionPanelProps> = ({
  questionId,
  expectedOutput,
  onCompilationStatusChange,
  onSuccessRateChange,
  code = "",
  setCode = () => {},
  selectedLanguage = "Python",
  setSelectedLanguage = () => {},
  setRunStatus = () => {},
  setOutput = () => {},
  setCodeError = () => {},
  onSuccess,
  onError,
}) => {
  const [syntaxError, setSyntaxError] = React.useState("");
  const [isRunning, setIsRunning] = React.useState(false);
  const [executionId, setExecutionId] = React.useState<string | null>(null);
  const apiKey = import.meta.env.VITE_FERMION_API_KEY;
  const { toast } = useToast();

  const languageMap: { [key: string]: string } = {
    C: "c",
    Cpp: "cpp",
    Java: "java",
    Python: "python",
    Nodejs: "javascript",
  };

  const codeTemplates: { [key: string]: string } = {
    Python: `# Python Hello World Program
print("Hello, World!")

def solution():
    # Your solution code here
    return "Hello, World!"

# Example usage
if __name__ == "__main__":
    result = solution()
    print(result)`,
    
    Java: `// Java Hello World Program
public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println(solution());
    }
    
    public static String solution() {
        // Your solution code here
        return "Hello, World!";
    }
}`,
    
    C: `// C Hello World Program
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Your solution code here
    char* result = "Hello, World!";
    printf("%s\\n", result);
    
    return 0;
}`,
    
    Cpp: `// C++ Hello World Program
#include <iostream>
#include <string>
using namespace std;

string solution() {
    // Your solution code here
    return "Hello, World!";
}

int main() {
    cout << "Hello, World!" << endl;
    
    string result = solution();
    cout << result << endl;
    
    return 0;
}`,
    
    Nodejs: `// Node.js Hello World Program
console.log("Hello, World!");

function solution() {
    // Your solution code here
    return "Hello, World!";
}

// Example usage
const result = solution();
console.log(result);`
  };

  // Set initial code template when language changes or component mounts
  React.useEffect(() => {
    if (selectedLanguage && codeTemplates[selectedLanguage]) {
      setCode(codeTemplates[selectedLanguage]);
    }
  }, [selectedLanguage, setCode]);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    setCode(codeTemplates[value]);
  };

  React.useEffect(() => {
    if (!executionId) return;

    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/execution/${executionId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'output':
          setOutput((prev: string) => prev + data.content);
          break;
        case 'error':
          setCodeError(data.content);
          onError?.(data.content);
          break;
        case 'compilation_status':
          onCompilationStatusChange(data.status);
          break;
        case 'success_rate':
          onSuccessRateChange(data.rate);
          break;
        case 'complete':
          setIsRunning(false);
          setRunStatus('completed');
          onSuccess?.();
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setCodeError('Connection error occurred');
      onError?.('Connection error occurred');
    };

    return () => {
      ws.close();
    };
  }, [executionId]);

  const runCode = async () => {
    try {
      // Validate required props
      if (!questionId) {
        throw new Error('Question ID is required');
      }

      if (!code.trim()) {
        throw new Error('Please enter some code before running');
      }

      if (!selectedLanguage || !languageMap[selectedLanguage]) {
        throw new Error('Please select a valid programming language');
      }

      setIsRunning(true);
      setOutput('');
      setCodeError('');
      setRunStatus('running');

      // Construct the API URL using the base URL from environment variable
      const apiUrl = new URL('/api/execute', import.meta.env.VITE_API_URL).toString();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          questionId,
          code,
          language: languageMap[selectedLanguage]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to execute code');
      }

      setExecutionId(data.executionId);
    } catch (error) {
      setIsRunning(false);
      setRunStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setCodeError(errorMessage);
      onError?.(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Code Execution</h3>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="Cpp">C++</SelectItem>
                <SelectItem value="Nodejs">Node.js</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={runCode} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
        </div>

        <Editor
          height="400px"
          defaultLanguage={languageMap[selectedLanguage]}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
          }}
        />
        
        {syntaxError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {syntaxError}
          </div>
        )}

        {isRunning && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
            Code is running...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeExecutionPanel;
