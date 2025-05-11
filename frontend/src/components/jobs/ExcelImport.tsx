import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { read, utils, writeFile } from 'xlsx';
import { Download } from 'lucide-react';

interface ExcelImportProps {
  onImport: (questions: any[]) => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImport }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(worksheet);

        // Validate and transform the data
        const questions = jsonData.map((row: any) => {
          // Validate required fields
          if (!row.question || !row.type || !row.category || !row.time_seconds) {
            throw new Error('Missing required fields in Excel file');
          }

          // Validate type and category
          const normalizedType = row.type.toLowerCase();
          const normalizedCategory = row.category.toLowerCase();
          
          if (!['single', 'multiple', 'true_false'].includes(normalizedType)) {
            throw new Error(`Invalid question type: ${row.type}`);
          }
          if (!['technical', 'aptitude'].includes(normalizedCategory)) {
            throw new Error(`Invalid category: ${row.category}`);
          }

          // Process options
          const options = [];
          for (let i = 1; i <= 4; i++) {
            const option = row[`option${i}`];
            if (option) {
              options.push(option);
            }
          }

          // For true/false questions, ensure we have exactly True and False options
          if (normalizedType === 'true_false') {
            console.log('True/False options:', options);
            const hasTrue = options.some(opt => opt === 'True');
            const hasFalse = options.some(opt => opt === 'False');
            console.log('Has True:', hasTrue, 'Has False:', hasFalse);
            
            if (options.length !== 2) {
              throw new Error(`True/False questions must have exactly 2 options. Found ${options.length} options.`);
            }
            if (!hasTrue) {
              throw new Error('True/False questions must include the option "True"');
            }
            if (!hasFalse) {
              throw new Error('True/False questions must include the option "False"');
            }
          }

          // Process correct options
          let correct_options: number[] = [];
          if (row.correct_options) {
            correct_options = row.correct_options.split(',').map((n: string) => parseInt(n.trim()));
          }

          return {
            title: row.question,
            type: normalizedType,
            category: normalizedCategory,
            time_seconds: parseInt(row.time_seconds),
            options: options,
            correct_options: correct_options
          };
        });

        onImport(questions);
        toast.success('Questions imported successfully');
      } catch (error: any) {
        toast.error(`Error importing questions: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file');
      setIsLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        question: "What is the time complexity of binary search?",
        type: "single",
        category: "technical",
        time_seconds: 60,
        option1: "O(1)",
        option2: "O(log n)",
        option3: "O(n)",
        option4: "O(n log n)",
        correct_options: "1"
      },
      {
        question: "Is JavaScript a compiled language?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "1"
      },
      {
        question: "Which of these are sorting algorithms?",
        type: "multiple",
        category: "technical",
        time_seconds: 90,
        option1: "Bubble Sort",
        option2: "Quick Sort",
        option3: "Binary Search",
        option4: "Merge Sort",
        correct_options: "0,1,3"
      },
      {
        question: "What are the benefits of using React?",
        type: "multiple",
        category: "technical",
        time_seconds: 120,
        option1: "Virtual DOM",
        option2: "Component Reusability",
        option3: "Server-side Rendering",
        option4: "Built-in State Management",
        correct_options: "0,1,2"
      },
      {
        question: "Is Python an interpreted language?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript frameworks?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "React",
        option2: "Angular",
        option3: "Django",
        option4: "Vue",
        correct_options: "0,1,3"
      },
      {
        question: "What is the primary purpose of Docker?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Version Control",
        option2: "Containerization",
        option3: "Database Management",
        option4: "Load Balancing",
        correct_options: "1"
      },
      {
        question: "Is HTML a programming language?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "1"
      },
      {
        question: "Which of these are NoSQL databases?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "MongoDB",
        option2: "PostgreSQL",
        option3: "Cassandra",
        option4: "Redis",
        correct_options: "0,2,3"
      },
      {
        question: "What is the main advantage of using Git?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Code Compilation",
        option2: "Version Control",
        option3: "Database Management",
        option4: "Web Hosting",
        correct_options: "1"
      },
      {
        question: "Is CSS a programming language?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "1"
      },
      {
        question: "Which of these are cloud service providers?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "AWS",
        option2: "Azure",
        option3: "Oracle",
        option4: "Google Cloud",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a CDN?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Code Development",
        option2: "Content Delivery",
        option3: "Database Management",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is REST an API design pattern?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript data types?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "String",
        option2: "Integer",
        option3: "Boolean",
        option4: "Float",
        correct_options: "0,2"
      },
      {
        question: "What is the purpose of a load balancer?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Traffic Distribution",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is TypeScript a superset of JavaScript?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are HTTP methods?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "GET",
        option2: "POST",
        option3: "SEND",
        option4: "PUT",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a firewall?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Network Security",
        option3: "Code Compilation",
        option4: "Load Balancing",
        correct_options: "1"
      },
      {
        question: "Is Node.js a runtime environment?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are design patterns?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "Singleton",
        option2: "Factory",
        option3: "Database",
        option4: "Observer",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a proxy server?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Request Interception",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is MongoDB a relational database?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "1"
      },
      {
        question: "Which of these are JavaScript frameworks?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "Express",
        option2: "Next.js",
        option3: "Laravel",
        option4: "NestJS",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a cache?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Performance Optimization",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is GraphQL a query language?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are cloud deployment models?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "Public Cloud",
        option2: "Private Cloud",
        option3: "Local Cloud",
        option4: "Hybrid Cloud",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a VPN?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Secure Connection",
        option3: "Code Compilation",
        option4: "Load Balancing",
        correct_options: "1"
      },
      {
        question: "Is WebSocket a protocol?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript testing frameworks?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "Jest",
        option2: "Mocha",
        option3: "Selenium",
        option4: "Cypress",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a CDN?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Content Delivery",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is Redis a database?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript build tools?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "Webpack",
        option2: "Babel",
        option3: "Docker",
        option4: "Vite",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a reverse proxy?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Request Forwarding",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is Docker a containerization platform?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript package managers?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "npm",
        option2: "yarn",
        option3: "pip",
        option4: "pnpm",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a load balancer?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Traffic Distribution",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is Kubernetes an orchestration tool?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript runtime environments?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "Node.js",
        option2: "Deno",
        option3: "Python",
        option4: "Bun",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a message queue?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Asynchronous Communication",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is WebRTC a protocol?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript UI frameworks?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "React",
        option2: "Vue",
        option3: "Django",
        option4: "Svelte",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a service worker?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Offline Support",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is WebAssembly a programming language?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "1"
      },
      {
        question: "Which of these are JavaScript module systems?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "CommonJS",
        option2: "ES Modules",
        option3: "Python",
        option4: "AMD",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a CDN?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Content Delivery",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is WebSocket a protocol?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript testing frameworks?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "Jest",
        option2: "Mocha",
        option3: "Selenium",
        option4: "Cypress",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a reverse proxy?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Request Forwarding",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is Redis a database?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript build tools?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "Webpack",
        option2: "Babel",
        option3: "Docker",
        option4: "Vite",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a message queue?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Asynchronous Communication",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is WebRTC a protocol?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "0"
      },
      {
        question: "Which of these are JavaScript UI frameworks?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "React",
        option2: "Vue",
        option3: "Django",
        option4: "Svelte",
        correct_options: "0,1,3"
      },
      {
        question: "What is the purpose of a service worker?",
        type: "single",
        category: "technical",
        time_seconds: 45,
        option1: "Data Storage",
        option2: "Offline Support",
        option3: "Code Compilation",
        option4: "Security",
        correct_options: "1"
      },
      {
        question: "Is WebAssembly a programming language?",
        type: "true_false",
        category: "technical",
        time_seconds: 30,
        option1: "True",
        option2: "False",
        option3: "",
        option4: "",
        correct_options: "1"
      },
      {
        question: "Which of these are JavaScript module systems?",
        type: "multiple",
        category: "technical",
        time_seconds: 60,
        option1: "CommonJS",
        option2: "ES Modules",
        option3: "Python",
        option4: "AMD",
        correct_options: "0,1,3"
      }
    ];

    const ws = utils.json_to_sheet(template);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Template");
    writeFile(wb, "mcq_template.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="excel-file">Upload Excel File</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="mt-6 hidden"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Feature under development. DON'T USE THIS FEATURE.
      </p>
    </div>
  );
};

export default ExcelImport; 