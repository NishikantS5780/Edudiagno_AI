import React from 'react';

interface QuestionAreaProps {
  title: string; // e.g., "EduDiagno - Question 1"
  successRate: string; // e.g., "Success rate: 2.56%"
  questionNumber: string; // e.g., "1."
  questionTitle: string; // e.g., "Two Sum"
  difficulty: string; // e.g., "Easy"
  topics?: string[]; // Optional array, e.g., ["Array", "Hash Table"]
  companies?: string[]; // Optional array, e.g., ["Google", "Amazon"]
  hint?: string; // Optional hint text
  description: React.ReactNode; // Allows text or JSX (e.g., with <code>)
  testCases: { input: string; expectedOutput: string }[]; // Array of test cases
  constraints?: string; // Optional constraints text
}

function DsaQuestion({
  title,
  successRate,
  questionNumber,
  questionTitle,
  difficulty,
  topics = [],
  companies = [],
  hint,
  description,
  testCases,
  constraints,
}: QuestionAreaProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="bg-[#27272a] rounded-xl text-white p-6 h-[86vh]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-gray-400">
          <span className="mr-1">||</span> {successRate}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold border-b border-gray-600 pb-2">
          {questionNumber} {questionTitle}
        </h2>
        <p className={`text-md font-medium ${getDifficultyColor(difficulty)} mt-2`}>
          {difficulty}
        </p>
        {topics.length > 0 && (
          <div className="mt-2">
            <span className="font-medium">Topics: </span>
            {topics.join(', ')}
          </div>
        )}
        {companies.length > 0 && (
          <div className="mt-2">
            <span className="font-medium">Companies: </span>
            {companies.join(', ')}
          </div>
        )}
        {hint && (
          <div className="mt-2">
            <span className="font-medium">Hint: </span>
            {hint}
          </div>
        )}
      </div>

      <div className="mb-4">
        {description}
        {constraints && (
          <p className="mt-2">{constraints}</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Sample Test Cases</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-600 p-2">Input</th>
              <th className="border border-gray-600 p-2">Expected Output</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((testCase, index) => (
              <tr key={index}>
                <td className="border border-gray-600 p-2">
                  <code>{testCase.input}</code>
                </td>
                <td className="border border-gray-600 p-2">
                  <code>{testCase.expectedOutput}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DsaQuestion;