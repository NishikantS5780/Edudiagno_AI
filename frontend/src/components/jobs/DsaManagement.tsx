import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface TestCase {
  id: number
  input: string
  expected_output: string
  dsa_question_id: number
}

interface DSAQuestion {
  id: number
  title: string
  description: string
  difficulty: string
  job_id: number
  test_cases: TestCase[]
}

interface DsaManagementProps {
  jobId: number
}

const DsaManagement = ({ jobId }: DsaManagementProps) => {
  const [questions, setQuestions] = useState<DSAQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddTestCaseModalOpen, setIsAddTestCaseModalOpen] = useState(false)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  const [newTestCase, setNewTestCase] = useState({ input: "", expected_output: "" })
  const [editedQuestions, setEditedQuestions] = useState<{ [key: number]: Partial<DSAQuestion> }>({})
  const [editedTestCases, setEditedTestCases] = useState<{ [key: number]: Partial<TestCase> }>({})
  const [newQuestions, setNewQuestions] = useState<DSAQuestion[]>([])
  const [isEditMode, setIsEditMode] = useState(false)

  // Fetch questions and their test cases
  const fetchQuestions = async () => {
    try {
      const response = await api.get("/dsa-question", {
        params: { job_id: jobId }
      })
      const questionsWithTestCases = await Promise.all(
        response.data.map(async (question: DSAQuestion) => {
          const testCasesResponse = await api.get("/dsa-test-case", {
            params: { question_id: question.id }
          })
          return {
            ...question,
            test_cases: testCasesResponse.data
          }
        })
      )
      setQuestions(questionsWithTestCases)
    } catch (error) {
      toast.error("Failed to fetch questions")
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [jobId])

  // Create new question locally
  const handleCreateQuestion = () => {
    const newQuestion: DSAQuestion = {
      id: -Date.now(), // Temporary negative ID
      title: "",
      description: "",
      difficulty: "Easy",
      job_id: jobId,
      test_cases: []
    }
    setNewQuestions(prev => [...prev, newQuestion])
  }

  // Save new question to backend
  const handleSaveNewQuestion = async (question: DSAQuestion) => {
    try {
      setLoading(true)
      // Create question
      const response = await api.post("/dsa-question", {
        job_id: jobId,
        title: question.title,
        description: question.description,
        difficulty: question.difficulty
      })

      // Create test cases if any
      if (question.test_cases.length > 0) {
        await Promise.all(
          question.test_cases.map(testCase =>
            api.post("/dsa-test-case", {
              input: testCase.input,
              expected_output: testCase.expected_output,
              dsa_question_id: response.data.id
            })
          )
        )
      }

      toast.success("Question created successfully")
      fetchQuestions()
      // Remove from new questions
      setNewQuestions(prev => prev.filter(q => q.id !== question.id))
    } catch (error) {
      toast.error("Failed to create question")
    } finally {
      setLoading(false)
    }
  }

  // Handle new question field change
  const handleNewQuestionChange = (questionId: number, field: keyof DSAQuestion, value: string) => {
    setNewQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, [field]: value }
          : q
      )
    )
  }

  // Handle new test case field change
  const handleNewTestCaseChange = (questionId: number, testCaseIndex: number, field: keyof TestCase, value: string) => {
    setNewQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const updatedTestCases = [...q.test_cases]
          updatedTestCases[testCaseIndex] = {
            ...updatedTestCases[testCaseIndex],
            [field]: value
          }
          return { ...q, test_cases: updatedTestCases }
        }
        return q
      })
    )
  }

  // Add new test case to new question
  const handleAddNewTestCase = (questionId: number) => {
    setNewQuestions(prev =>
      prev.map(q => 
        q.id === questionId
          ? { 
              ...q, 
              test_cases: [...q.test_cases, { 
                id: -Date.now(), // Temporary negative ID
                input: "", 
                expected_output: "", 
                dsa_question_id: questionId 
              }] 
            }
          : q
      )
    )
  }

  // Delete new test case
  const handleDeleteNewTestCase = (questionId: number, testCaseIndex: number) => {
    setNewQuestions(prev =>
      prev.map(q => 
        q.id === questionId
          ? { ...q, test_cases: q.test_cases.filter((_, index) => index !== testCaseIndex) }
          : q
      )
    )
  }

  // Delete new question
  const handleDeleteNewQuestion = (questionId: number) => {
    setNewQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  // Handle question field change
  const handleQuestionChange = (questionId: number, field: keyof DSAQuestion, value: string) => {
    setEditedQuestions(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }))
  }

  // Update question and its test cases
  const handleSaveChanges = async (questionId: number) => {
    try {
      setLoading(true)
      
      // Find the current question
      const currentQuestion = questions.find(q => q.id === questionId)
      if (!currentQuestion) return

      // Update question if there are changes
      const editedQuestion = editedQuestions[questionId]
      if (editedQuestion) {
        const updatedQuestion = {
          id: questionId,
          title: editedQuestion.title ?? currentQuestion.title,
          description: editedQuestion.description ?? currentQuestion.description,
          difficulty: editedQuestion.difficulty ?? currentQuestion.difficulty
        }
        await api.put("/dsa-question", updatedQuestion)
      }

      // Update test cases if there are changes
      const editedTestCasesForQuestion = currentQuestion.test_cases
        .filter(tc => editedTestCases[tc.id])
        .map(tc => ({
          id: tc.id,
          ...editedTestCases[tc.id]
        }))

      if (editedTestCasesForQuestion.length > 0) {
        await Promise.all(
          editedTestCasesForQuestion.map(testCase =>
            api.put("/dsa-test-case", testCase)
          )
        )
      }

      toast.success("Changes saved successfully")
      fetchQuestions()
      
      // Clear edited states
      setEditedQuestions(prev => {
        const newState = { ...prev }
        delete newState[questionId]
        return newState
      })
      setEditedTestCases(prev => {
        const newState = { ...prev }
        currentQuestion.test_cases.forEach(tc => {
          delete newState[tc.id]
        })
        return newState
      })
    } catch (error) {
      toast.error("Failed to save changes")
    } finally {
      setLoading(false)
    }
  }

  // Delete question
  const handleDeleteQuestion = async (questionId: number) => {
    try {
      setLoading(true)
      await api.delete(`/dsa-question?id=${questionId}`)
      toast.success("Question deleted successfully")
      fetchQuestions()
    } catch (error) {
      toast.error("Failed to delete question")
    } finally {
      setLoading(false)
    }
  }

  // Open add test case modal
  const handleOpenAddTestCaseModal = (questionId: number) => {
    setSelectedQuestionId(questionId)
    setNewTestCase({ input: "", expected_output: "" })
    setIsAddTestCaseModalOpen(true)
  }

  // Add test case
  const handleAddTestCase = async () => {
    if (!selectedQuestionId) return

    try {
      setLoading(true)
      await api.post("/dsa-test-case", {
        input: newTestCase.input,
        expected_output: newTestCase.expected_output,
        dsa_question_id: selectedQuestionId
      })
      toast.success("Test case added successfully")
      fetchQuestions()
      setIsAddTestCaseModalOpen(false)
    } catch (error) {
      toast.error("Failed to add test case")
    } finally {
      setLoading(false)
    }
  }

  // Handle test case field change
  const handleTestCaseChange = (testCaseId: number, field: keyof TestCase, value: string) => {
    setEditedTestCases(prev => {
      const currentTestCase = questions
        .flatMap(q => q.test_cases)
        .find(tc => tc.id === testCaseId);
      
      if (!currentTestCase) return prev;

      return {
        ...prev,
        [testCaseId]: {
          ...currentTestCase,
          ...prev[testCaseId],
          [field]: value
        }
      };
    });
  }

  // Delete test case
  const handleDeleteTestCase = async (testCaseId: number) => {
    try {
      setLoading(true)
      await api.delete("/dsa-test-case", {
        params: { id: testCaseId }
      })
      toast.success("Test case deleted successfully")
      fetchQuestions()
    } catch (error) {
      toast.error("Failed to delete test case")
    } finally {
      setLoading(false)
    }
  }

  // Handle edit mode toggle
  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode)
    if (!isEditMode) {
      setEditedQuestions({})
      setEditedTestCases({})
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">DSA Questions</h2>
        <Button
          variant={isEditMode ? "default" : "outline"}
          onClick={handleEditModeToggle}
        >
          {isEditMode ? "View Mode" : "Edit Mode"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* New Questions */}
        {isEditMode && newQuestions.map((question) => (
          <Card key={question.id} className="bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    value={question.title}
                    onChange={(e) => handleNewQuestionChange(question.id, "title", e.target.value)}
                    placeholder="Question Title"
                    className="text-lg font-medium border-0 bg-muted/50 focus-visible:ring-1"
                  />
                  <Select
                    value={question.difficulty}
                    onValueChange={(value) => handleNewQuestionChange(question.id, "difficulty", value)}
                  >
                    <SelectTrigger className="w-[120px] bg-muted/50 border-0">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  value={question.description}
                  onChange={(e) => handleNewQuestionChange(question.id, "description", e.target.value)}
                  placeholder="Question Description"
                  className="min-h-[100px] bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Test Cases</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddNewTestCase(question.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>

                <div className="grid gap-4">
                  {question.test_cases.map((testCase, index) => (
                    <Card key={index} className="bg-muted/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Input</p>
                            <Input
                              value={testCase.input}
                              onChange={(e) => handleNewTestCaseChange(question.id, index, "input", e.target.value)}
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Expected Output</p>
                            <Input
                              value={testCase.expected_output}
                              onChange={(e) => handleNewTestCaseChange(question.id, index, "expected_output", e.target.value)}
                              className="bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNewTestCase(question.id, index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteNewQuestion(question.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Existing Questions */}
        {questions.map((question) => (
          <Card key={question.id} className="bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {isEditMode ? (
                    <Input
                      value={editedQuestions[question.id]?.title ?? question.title}
                      onChange={(e) => handleQuestionChange(question.id, "title", e.target.value)}
                      placeholder="Question Title"
                      className="text-lg font-medium border-0 bg-muted/50 focus-visible:ring-1"
                    />
                  ) : (
                    <h3 className="text-lg font-medium">{question.title}</h3>
                  )}
                  {isEditMode ? (
                    <Select
                      value={editedQuestions[question.id]?.difficulty ?? question.difficulty}
                      onValueChange={(value) => handleQuestionChange(question.id, "difficulty", value)}
                    >
                      <SelectTrigger className="w-[120px] bg-muted/50 border-0">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{question.difficulty}</Badge>
                  )}
                </div>

                {isEditMode ? (
                  <Textarea
                    value={editedQuestions[question.id]?.description ?? question.description}
                    onChange={(e) => handleQuestionChange(question.id, "description", e.target.value)}
                    placeholder="Question Description"
                    className="min-h-[100px] bg-muted/50 border-0 focus-visible:ring-1"
                  />
                ) : (
                  <p className="text-muted-foreground">{question.description}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Test Cases</h3>
                  {isEditMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddTestCaseModal(question.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Test Case
                    </Button>
                  )}
                </div>

                <div className="grid gap-4">
                  {question.test_cases.map((testCase) => (
                    <Card key={testCase.id} className="bg-muted/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Input</p>
                            {isEditMode ? (
                              <Input
                                value={editedTestCases[testCase.id]?.input ?? testCase.input}
                                onChange={(e) => handleTestCaseChange(testCase.id, "input", e.target.value)}
                                className="bg-background"
                              />
                            ) : (
                              <p className="text-sm">{testCase.input}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Expected Output</p>
                            {isEditMode ? (
                              <Input
                                value={editedTestCases[testCase.id]?.expected_output ?? testCase.expected_output}
                                onChange={(e) => handleTestCaseChange(testCase.id, "expected_output", e.target.value)}
                                className="bg-background"
                              />
                            ) : (
                              <p className="text-sm">{testCase.expected_output}</p>
                            )}
                          </div>
                        </div>
                        {isEditMode && (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTestCase(testCase.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {isEditMode && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Action Buttons */}
      {isEditMode && (
        <div className="fixed bottom-4 right-4 flex gap-4">
          <Button
            onClick={handleCreateQuestion}
            disabled={loading}
            className="shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
          <Button
            onClick={async () => {
              // Save new questions first
              for (const question of newQuestions) {
                await handleSaveNewQuestion(question)
              }
              // Then save changes to existing questions
              for (const question of questions) {
                if (editedQuestions[question.id] || question.test_cases.some(tc => editedTestCases[tc.id])) {
                  await handleSaveChanges(question.id)
                }
              }
            }}
            disabled={loading || (newQuestions.length === 0 && !Object.keys(editedQuestions).length && !Object.keys(editedTestCases).length)}
            className="shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      )}

      {/* Add Test Case Modal */}
      <Dialog open={isAddTestCaseModalOpen} onOpenChange={setIsAddTestCaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Test Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Input</p>
              <Input
                value={newTestCase.input}
                onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                placeholder="Enter test case input"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Expected Output</p>
              <Input
                value={newTestCase.expected_output}
                onChange={(e) => setNewTestCase({ ...newTestCase, expected_output: e.target.value })}
                placeholder="Enter expected output"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTestCaseModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTestCase} disabled={loading}>
              Add Test Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DsaManagement 