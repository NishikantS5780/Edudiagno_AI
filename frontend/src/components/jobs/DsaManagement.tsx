import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Code, TestTube } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

interface DSAQuestion {
  id: number
  title: string
  description: string
  difficulty: string
}

interface TestCase {
  id: number
  input: string
  expected_output: string
}

interface DsaManagementProps {
  jobId: number
}

const DsaManagement = ({ jobId }: DsaManagementProps) => {
  const [activeTab, setActiveTab] = useState("questions")
  const [questions, setQuestions] = useState<DSAQuestion[]>([])
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<DSAQuestion | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states for questions
  const [questionTitle, setQuestionTitle] = useState("")
  const [questionDescription, setQuestionDescription] = useState("")
  const [questionDifficulty, setQuestionDifficulty] = useState("")

  // Form states for test cases
  const [testCaseInput, setTestCaseInput] = useState("")
  const [testCaseOutput, setTestCaseOutput] = useState("")

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      const response = await api.get("/dsa-question", {
        params: { job_id: jobId }
      })
      setQuestions(response.data)
    } catch (error) {
      toast.error("Failed to fetch questions")
    }
  }

  // Fetch test cases
  const fetchTestCases = async (questionId: number) => {
    try {
      const response = await api.get("/dsa-test-case", {
        params: { question_id: questionId }
      })
      setTestCases(response.data)
    } catch (error) {
      toast.error("Failed to fetch test cases")
    }
  }

  // Create question
  const handleCreateQuestion = async () => {
    try {
      setLoading(true)
      await api.post("/dsa-question", {
        job_id: jobId,
        title: questionTitle,
        description: questionDescription,
        difficulty: questionDifficulty
      })
      toast.success("Question created successfully")
      fetchQuestions()
      // Reset form
      setQuestionTitle("")
      setQuestionDescription("")
      setQuestionDifficulty("")
    } catch (error) {
      toast.error("Failed to create question")
    } finally {
      setLoading(false)
    }
  }

  // Update question
  const handleUpdateQuestion = async () => {
    if (!selectedQuestion) return
    try {
      setLoading(true)
      await api.put(`/dsa-question/${selectedQuestion.id}`, {
        title: questionTitle,
        description: questionDescription,
        difficulty: questionDifficulty
      })
      toast.success("Question updated successfully")
      fetchQuestions()
      setSelectedQuestion(null)
      // Reset form
      setQuestionTitle("")
      setQuestionDescription("")
      setQuestionDifficulty("")
    } catch (error) {
      toast.error("Failed to update question")
    } finally {
      setLoading(false)
    }
  }

  // Delete question
  const handleDeleteQuestion = async (questionId: number) => {
    try {
      setLoading(true)
      await api.delete(`/dsa-question/${questionId}`)
      toast.success("Question deleted successfully")
      fetchQuestions()
    } catch (error) {
      toast.error("Failed to delete question")
    } finally {
      setLoading(false)
    }
  }

  // Create test case
  const handleCreateTestCase = async () => {
    if (!selectedQuestion) return
    try {
      setLoading(true)
      await api.post("/dsa-test-case", {
        dsa_question_id: selectedQuestion.id,
        input: testCaseInput,
        expected_output: testCaseOutput
      })
      toast.success("Test case created successfully")
      fetchTestCases(selectedQuestion.id)
      // Reset form
      setTestCaseInput("")
      setTestCaseOutput("")
    } catch (error) {
      toast.error("Failed to create test case")
    } finally {
      setLoading(false)
    }
  }

  // Delete test case
  const handleDeleteTestCase = async (testCaseId: number) => {
    try {
      setLoading(true)
      await api.delete("/dsa-test-case", {
        params: { id: testCaseId }
      })
      toast.success("Test case deleted successfully")
      if (selectedQuestion) {
        fetchTestCases(selectedQuestion.id)
      }
    } catch (error) {
      toast.error("Failed to delete test case")
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount
  React.useEffect(() => {
    fetchQuestions()
  }, [jobId])

  // Load test cases when question is selected
  React.useEffect(() => {
    if (selectedQuestion) {
      fetchTestCases(selectedQuestion.id)
    }
  }, [selectedQuestion])

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="test-cases" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test Cases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          {/* Question Form */}
          <div className="bg-muted/50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedQuestion ? "Update Question" : "Create New Question"}
            </h3>
            <div className="grid gap-4">
              <Input
                placeholder="Question Title"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                className="bg-background"
              />
              <Textarea
                placeholder="Question Description"
                value={questionDescription}
                onChange={(e) => setQuestionDescription(e.target.value)}
                className="bg-background min-h-[100px]"
              />
              <Select
                value={questionDifficulty}
                onValueChange={setQuestionDifficulty}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <Button
                  onClick={selectedQuestion ? handleUpdateQuestion : handleCreateQuestion}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {selectedQuestion ? "Update Question" : "Create Question"}
                </Button>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="group relative bg-muted/50 p-6 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{question.title}</h3>
                      <p className="text-muted-foreground mt-1">
                        {question.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {question.difficulty}
                    </Badge>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestion(question)
                        setQuestionTitle(question.title)
                        setQuestionDescription(question.description)
                        setQuestionDifficulty(question.difficulty)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="test-cases" className="space-y-6">
          {selectedQuestion && (
            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold">Create New Test Case</h3>
              <div className="grid gap-4">
                <Textarea
                  placeholder="Input"
                  value={testCaseInput}
                  onChange={(e) => setTestCaseInput(e.target.value)}
                  className="bg-background min-h-[100px] font-mono"
                />
                <Textarea
                  placeholder="Expected Output"
                  value={testCaseOutput}
                  onChange={(e) => setTestCaseOutput(e.target.value)}
                  className="bg-background min-h-[100px] font-mono"
                />
                <div className="flex justify-end">
                  <Button onClick={handleCreateTestCase} disabled={loading} className="w-full sm:w-auto">
                    Create Test Case
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Test Cases List */}
          <div className="space-y-4">
            {testCases.map((testCase) => (
              <div
                key={testCase.id}
                className="group relative bg-muted/50 p-6 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Input</h4>
                      <p className="font-mono text-sm bg-background/50 p-2 rounded">
                        {testCase.input}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Expected Output</h4>
                      <p className="font-mono text-sm bg-background/50 p-2 rounded">
                        {testCase.expected_output}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTestCase(testCase.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DsaManagement 