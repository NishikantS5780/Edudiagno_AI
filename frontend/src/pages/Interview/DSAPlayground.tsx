// import React, { useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";
// import { PlayCircle, Timer, CheckCircle, Code2, ChevronRight, Layout, Settings2 } from "lucide-react";

// const DSAPlayground = () => {
// const navigate = useNavigate();
// const [searchParams] = useSearchParams();
// const [selectedLanguage, setSelectedLanguage] = useState("c");
// const [isPracticeComplete, setIsPracticeComplete] = useState(false);
// const [isRunning, setIsRunning] = useState(false);
// const [testsPassed, setTestsPassed] = useState(false);

// const handleFinish = () => {
//   navigate(`/interview/precheck?i_id=${searchParams.get('i_id')}`);
// };

// const handleRun = () => {
//   setIsRunning(true);
//   setTimeout(() => {
//     setIsRunning(false);
//     setTestsPassed(true);
//     setIsPracticeComplete(true);
//   }, 1500);
// };

// return (
//     <div className="h-screen flex flex-col bg-[#0A0A0A] text-[#E4E4E7]">
//       {/* Top Bar */}
//       <div className="flex items-center justify-between px-4 h-12 border-b border-[#27272A] bg-[#18181B]">
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2">
//             <Code2 className="h-5 w-5 text-[#22C55E]" />
//             <span className="text-sm font-medium">Two Sum</span>
//           </div>
//           <div className="h-4 w-px bg-[#27272A]" />
//           <Badge variant="outline" className="text-xs border-[#27272A] bg-[#27272A] text-[#A1A1AA]">
//             Easy
//           </Badge>
//         </div>
//         <div className="flex items-center gap-3">
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-8 text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-[#27272A]"
//           >
//             <Layout className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-8 text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-[#27272A]"
//           >
//             <Settings2 className="h-4 w-4" />
//           </Button>
//           <div className="h-4 w-px bg-[#27272A]" />
//           <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
//             <SelectTrigger className="h-8 w-[110px] bg-[#27272A] border-0 text-sm font-medium">
//               <SelectValue placeholder="Language" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="c">C</SelectItem>
//               <SelectItem value="cpp">C++</SelectItem>
//               <SelectItem value="python">Python</SelectItem>
//               <SelectItem value="java">Java</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button
//             variant="default"
//             size="sm"
//             className={cn(
//               "h-8 bg-[#22C55E] hover:bg-[#16A34A] text-white",
//               "flex items-center gap-2 px-4",
//               isRunning && "opacity-90"
//             )}
//             onClick={handleRun}
//             disabled={isRunning}
//           >
//             {isRunning ? (
//               <>
//                 <Timer className="h-3.5 w-3.5 animate-spin" />
//                 <span className="text-sm">Running</span>
//               </>
//             ) : (
//               <>
//                 <PlayCircle className="h-3.5 w-3.5" />
//                 <span className="text-sm">Run</span>
//               </>
//             )}
//           </Button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex">
//         {/* Left Panel - Problem Description */}
//         <div className="w-[400px] min-w-[400px] border-r border-[#27272A] bg-[#18181B] overflow-y-auto">
//           <div className="p-6 space-y-6">
//             <div className="space-y-4">
//               <div className="prose prose-invert prose-sm max-w-none">
//                 <h2 className="text-lg font-medium text-[#E4E4E7] mt-0">Problem Description</h2>
//                 <p className="text-[#A1A1AA] leading-relaxed">
//                   Given an array of integers nums and an integer target, return indices
//                   of the two numbers such that they add up to target.
//                 </p>
//                 <p className="text-[#A1A1AA] leading-relaxed">
//                   You may assume that each input would have exactly one solution, and
//                   you may not use the same element twice. You can return the answer
//                   in any order.
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <h3 className="text-sm font-medium text-[#A1A1AA]">Examples</h3>
//               <div className="space-y-4">
//                 <div className="rounded-lg border border-[#27272A] overflow-hidden">
//                   <div className="px-4 py-2.5 bg-[#27272A]/50">
//                     <h4 className="text-sm font-medium">Example 1</h4>
//                   </div>
//                   <div className="p-4 space-y-3 bg-[#27272A]/20">
//                     <div>
//                       <div className="text-xs font-medium text-[#A1A1AA] mb-2">Input</div>
//                       <pre className="text-sm font-mono bg-[#27272A] p-3 rounded-md overflow-x-auto">
// nums = [2,7,11,17]
// target = 9</pre>
//                     </div>
//                     <div>
//                       <div className="text-xs font-medium text-[#A1A1AA] mb-2">Output</div>
//                       <pre className="text-sm font-mono bg-[#27272A] p-3 rounded-md overflow-x-auto">
// [0,1]</pre>
//                     </div>
//                     <div>
//                       <div className="text-xs font-medium text-[#A1A1AA] mb-2">Explanation</div>
//                       <div className="text-sm text-[#A1A1AA]">
//                         Because nums[0] + nums[1] == 9, we return [0, 1].
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <h3 className="text-sm font-medium text-[#A1A1AA]">Constraints</h3>
//               <ul className="list-disc list-inside space-y-1 text-sm text-[#A1A1AA]">
//                 <li>2 ≤ nums.length ≤ 10⁴</li>
//                 <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
//                 <li>-10⁹ ≤ target ≤ 10⁹</li>
//                 <li>Only one valid answer exists.</li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Right Panel - Code Editor */}
//         <div className="flex-1 flex flex-col bg-[#0A0A0A]">
//           {/* Code Editor */}
//           <div className="flex-1 font-mono relative group">
//             <div className="absolute inset-0 bg-[#18181B]">
//               <div className="p-4">
//                 <div className="flex">
//                   <div className="text-[#52525B] select-none mr-4 text-right">
//                     {Array.from({ length: 15 }).map((_, i) => (
//                       <div key={i + 1} className="text-xs leading-5">
//                         {i + 1}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="flex-1 text-[#E4E4E7] leading-5">
//                     <pre className="text-sm">
//                       <span className="text-[#22C55E]">#include</span> <span className="text-[#E4E4E7]">&lt;stdio.h&gt;</span>
//                       {"\n"}
//                       <span className="text-[#22C55E]">#include</span> <span className="text-[#E4E4E7]">&lt;stdlib.h&gt;</span>
//                       {"\n\n"}
//                       <span className="text-[#22C55E]">int</span>* <span className="text-[#60A5FA]">twoSum</span>(<span className="text-[#22C55E]">int</span>* nums, <span className="text-[#22C55E]">int</span> numsSize, <span className="text-[#22C55E]">int</span> target, <span className="text-[#22C55E]">int</span>* returnSize) {"{"}
//                       {"\n    "}
//                       <span className="text-[#22C55E]">int</span>* result = (<span className="text-[#22C55E]">int</span>*)malloc(<span className="text-[#22C55E]">sizeof</span>(<span className="text-[#22C55E]">int</span>) * 2);
//                       {"\n    "}*returnSize = 2;
//                       {"\n\n    "}
//                       <span className="text-[#22C55E]">for</span> (<span className="text-[#22C55E]">int</span> i = 0; i {"<"} numsSize; i++) {"{"}
//                       {"\n        "}
//                       <span className="text-[#22C55E]">for</span> (<span className="text-[#22C55E]">int</span> j = i + 1; j {"<"} numsSize; j++) {"{"}
//                       {"\n            "}
//                       <span className="text-[#22C55E]">if</span> (nums[i] + nums[j] == target) {"{"}
//                       {"\n                "}result[0] = i;
//                       {"\n                "}result[1] = j;
//                       {"\n                "}<span className="text-[#22C55E]">return</span> result;
//                       {"\n            "}{"}"}
//                       {"\n        "}{"}"}
//                       {"\n    "}{"}"}
//                       {"\n    "}<span className="text-[#22C55E]">return</span> result;
//                       {"\n"}{"}"}
//                     </pre>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Terminal Output */}
//           <div className="h-[200px] border-t border-[#27272A] bg-[#18181B] overflow-y-auto">
//             <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A]">
//               <div className="flex items-center gap-2">
//                 <span className={cn(
//                   "h-2 w-2 rounded-full",
//                   testsPassed ? "bg-[#22C55E]" : "bg-[#A1A1AA]"
//                 )}></span>
//                 <span className="text-xs font-medium text-[#A1A1AA]">Console</span>
//               </div>
//             </div>
//             <div className="p-4 space-y-2 font-mono text-sm">
//               {isRunning ? (
//                 <div className="text-[#A1A1AA]">
//                   <span className="text-[#22C55E]">$</span> Running test cases...
//                 </div>
//               ) : testsPassed ? (
//                 <>
//                   <div className="text-[#A1A1AA]">
//                     <span className="text-[#22C55E]">$</span> Compiling solution...
//                   </div>
//                   <div className="text-[#A1A1AA]">
//                     <span className="text-[#22C55E]">$</span> Running test cases...
//                   </div>
//                   <div className="text-[#22C55E]">
//                     ✓ All test cases passed
//                   </div>
//                 </>
//               ) : null}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Bar */}
//       <div className="h-12 border-t border-[#27272A] bg-[#18181B] px-4 flex justify-between items-center">
//         <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
//           <div className="flex items-center gap-1.5">
//             <kbd className="px-1.5 py-0.5 rounded bg-[#27272A] text-[#E4E4E7]">⌘</kbd>
//             <span>+</span>
//             <kbd className="px-1.5 py-0.5 rounded bg-[#27272A] text-[#E4E4E7]">Enter</kbd>
//             <span className="ml-1.5">Run Code</span>
//           </div>
//           <div className="h-3 w-px bg-[#27272A]"></div>
//           <div className="flex items-center gap-1.5">
//             <kbd className="px-1.5 py-0.5 rounded bg-[#27272A] text-[#E4E4E7]">Tab</kbd>
//             <span>Autocomplete</span>
//           </div>
//         </div>
//         <Button
//           onClick={handleFinish}
//           size="sm"
//           className={cn(
//             "h-8 min-w-[140px] bg-[#27272A] hover:bg-[#3F3F46] text-sm",
//             !isPracticeComplete && "opacity-50",
//             isPracticeComplete && "bg-[#22C55E] hover:bg-[#16A34A] text-white"
//           )}
//           disabled={!isPracticeComplete}
//         >
//           {isPracticeComplete ? "Continue" : "Next"}
//         </Button>
//       </div>
//     </div>

// );
// };

// export default DSAPlayground; 



import DsaQuestion from "../DsaLab/DsaQuestion";
import CodeExecutionPanel from "../DsaLab/CodeExecutionPanel";

function DSAPlayground() {
  const expectedOutput = "5";
  return (
    <div className="bg-[#18181b]">
      <div className="grid md:grid-cols-2 grid-cols-1 h-[100vh] gap-4 p-2">
        <div>
          <h2 className="px-4 pt-2 text-[#3165ed] font-bold text-2xl"> EduDiagno DSA Lab</h2>
          <div className="mt-2">
            <DsaQuestion
              title="EduDiagno - Question 1"
              successRate="Success rate: 2.56%"
              questionNumber="1."
              questionTitle="Two Sum"
              difficulty="Easy"
              description={
                <>
                  Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                </>
              }
              constraints="You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order."
              testCases={[
                { input: "nums = [2,7,11,15], target = 9", expectedOutput: "5" },
              ]}
            />
          </div>
        </div>
        <div>
          <CodeExecutionPanel expectedOutput={expectedOutput} />
        </div>
      </div>
    </div>
  );
}

export default DSAPlayground;