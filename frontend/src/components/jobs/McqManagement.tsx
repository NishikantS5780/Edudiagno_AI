import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { jobAPI } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface QuizOption {
  id: number;
  label: string;
  correct: boolean;
}

interface McqQuestion {
  id: number;
  description: string;
  type: 'single' | 'multiple' | 'true_false';
  category: 'technical' | 'aptitude';
  time_seconds: number;
  options: QuizOption[];
}

interface McqManagementProps {
  jobId: number;
}

const McqManagement = ({ jobId }: McqManagementProps) => {
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchMcqQuestions();
  }, [jobId]);

  const fetchMcqQuestions = async () => {
    try {
      const response = await jobAPI.getMcqQuestions(jobId.toString());
      setQuestions(response.data || []);
    } catch (error) {
      console.error("Error fetching MCQ questions:", error);
      toast.error("Failed to load MCQ questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: -Date.now(), // Use negative ID for new questions
        description: "",
        type: "single",
        category: "technical",
        time_seconds: 60,
        options: [
          { id: -1, label: "", correct: false },
          { id: -2, label: "", correct: false },
          { id: -3, label: "", correct: false },
          { id: -4, label: "", correct: false }
        ]
      },
    ]);
  };

  const handleUpdateQuestion = (index: number, field: keyof McqQuestion, value: any) => {
    const updatedQuestions = [...questions];
    if (field === "options") {
      updatedQuestions[index].options = value;
    } else {
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    }
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = async (index: number) => {
    try {
      const questionToDelete = questions[index];
      await api.delete(`/quiz-question?question_id=${questionToDelete.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuestions(questions.filter((_, i) => i !== index));
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleDeleteOption = async (questionIndex: number, optionIndex: number) => {
    try {
      const question = questions[questionIndex];
      const optionToDelete = question.options[optionIndex];
      
      // Only delete from backend if the option has an ID (not a new option)
      if (optionToDelete.id) {
        await api.delete(`/quiz-option?option_id=${optionToDelete.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      // Update the question's options in the UI
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].options = question.options.filter((_, i) => i !== optionIndex);
      setQuestions(updatedQuestions);

      toast.success("Option deleted successfully");
    } catch (error) {
      console.error("Error deleting option:", error);
      toast.error("Failed to delete option");
    }
  };

  const handleAddOption = async (questionIndex: number) => {
    try {
      const question = questions[questionIndex];
      
      // Create the new option in the backend
      const response = await api.post('/quiz-option', {
        label: "",
        correct: false,
        question_id: question.id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Update the UI with the new option
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].options.push({
        id: response.data.id,
        label: "",
        correct: false
      });
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error("Error adding option:", error);
      toast.error("Failed to add option");
    }
  };

  const handleSaveQuestions = async () => {
    try {
      console.log('Starting to save questions:', questions);
      
      for (const question of questions) {
        let questionId = question.id;
        console.log('Processing question:', {
          id: questionId,
          description: question.description,
          type: question.type,
          category: question.category,
          time_seconds: question.time_seconds,
          options: question.options
        });
        
        // If the question has a negative ID, it's a new question
        if (questionId < 0) {
          console.log('Creating new question with data:', {
            description: question.description,
            type: question.type,
            category: question.category,
            time_seconds: question.time_seconds,
            job_id: jobId
          });
          
          const createResponse = await api.post(
            `/quiz-question`,
            {
              description: question.description,
              type: question.type,
              category: question.category,
              time_seconds: question.time_seconds,
              job_id: jobId
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
          questionId = createResponse.data.id;
          console.log('Created new question with ID:', questionId);

          // Create all options for the new question
          for (const option of question.options) {
            console.log('Creating new option for new question');
            const optionResponse = await api.post(
              `/quiz-option`,
              {
                label: option.label,
                correct: option.correct,
                question_id: questionId
              },
              {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              }
            );
            console.log('Created new option:', optionResponse.data);
          }
        } else {
          console.log('Updating existing question:', {
            id: questionId,
            description: question.description,
            type: question.type,
            category: question.category,
            time_seconds: question.time_seconds
          });
          
          await api.put(
            `/quiz-question`,
            {
              id: questionId,
              description: question.description,
              type: question.type,
              category: question.category,
              time_seconds: question.time_seconds
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );

          // Update existing options
          for (const option of question.options) {
            if (option.id < 0) {
              // Create new option for existing question
              console.log('Creating new option for existing question');
              const optionResponse = await api.post(
                `/quiz-option`,
                {
                  label: option.label,
                  correct: option.correct,
                  question_id: questionId
                },
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
              );
              console.log('Created new option:', optionResponse.data);
            } else {
              // Update existing option
              console.log('Updating existing option');
              const optionResponse = await api.put(
                `/quiz-option`,
                {
                  id: option.id,
                  label: option.label,
                  correct: option.correct,
                },
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
              );
              console.log('Updated option:', optionResponse.data);
            }
          }
        }
      }
      toast.success("MCQ questions saved successfully");
      // Refresh the questions after saving
      await fetchMcqQuestions();
    } catch (error: any) {
      console.error("Error saving MCQ questions:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      toast.error("Failed to save MCQ questions");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">MCQ Questions</h3>
          <p className="text-sm text-muted-foreground">
            Total Questions: {questions.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Mode
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4 pb-24">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 flex-1">
                    {isEditMode ? (
                      <Textarea
                        placeholder="Enter your question"
                        value={question.description}
                        onChange={(e) =>
                          handleUpdateQuestion(index, "description", e.target.value)
                        }
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-lg">{question.description}</p>
                    )}
                    <div className="flex gap-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.category}
                          onValueChange={(value) => handleUpdateQuestion(index, "category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="aptitude">Aptitude</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Answer Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) => {
                            handleUpdateQuestion(index, "type", value);
                            // Only reset options for true/false type
                            if (value === "true_false") {
                              handleUpdateQuestion(index, "options", [
                                { id: 1, label: "True", correct: false },
                                { id: 2, label: "False", correct: false }
                              ]);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select answer type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Choice</SelectItem>
                            <SelectItem value="multiple">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Time Limit (seconds)</Label>
                        <Select
                          value={question.time_seconds?.toString() || "60"}
                          onValueChange={(value) => handleUpdateQuestion(index, "time_seconds", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="45">45 seconds</SelectItem>
                            <SelectItem value="60">60 seconds</SelectItem>
                            <SelectItem value="90">90 seconds</SelectItem>
                            <SelectItem value="120">120 seconds</SelectItem>
                            <SelectItem value="180">180 seconds</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={option.id} 
                          className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                            option.correct 
                              ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                              : "hover:bg-accent/50"
                          }`}
                        >
                          {isEditMode ? (
                            <>
                              {question.type === "multiple" ? (
                                <input
                                  type="checkbox"
                                  checked={option.correct}
                                  onChange={() => {
                                    const newOptions = question.options.map((opt, idx) => ({
                                      ...opt,
                                      correct: idx === optionIndex ? !opt.correct : opt.correct
                                    }));
                                    handleUpdateQuestion(index, "options", newOptions);
                                  }}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                              ) : (
                                <input
                                  type="radio"
                                  name={`correct-${index}`}
                                  checked={option.correct}
                                  onChange={() => {
                                    const newOptions = question.options.map((opt, idx) => ({
                                      ...opt,
                                      correct: idx === optionIndex
                                    }));
                                    handleUpdateQuestion(index, "options", newOptions);
                                  }}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                              )}
                              <Input
                                placeholder={`Option ${optionIndex + 1}`}
                                value={option.label}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = {
                                    ...newOptions[optionIndex],
                                    label: e.target.value
                                  };
                                  handleUpdateQuestion(index, "options", newOptions);
                                }}
                                className={`flex-1 ${
                                  option.correct ? "font-medium" : ""
                                }`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteOption(index, optionIndex)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <div className={`h-4 w-4 rounded-full border-2 ${
                                option.correct 
                                  ? "border-green-500 bg-green-500" 
                                  : "border-gray-300"
                              }`} />
                              <span className={option.correct ? "font-medium" : ""}>
                                {option.label}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                      {isEditMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(index)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Badge variant={question.category === "technical" ? "default" : "secondary"}>
                        {question.category}
                      </Badge>
                      <Badge variant="outline">
                        {question.type === "single" ? "Single Choice" : 
                         question.type === "multiple" ? "Multiple Choice" : 
                         "True/False"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isEditMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-end gap-2 shadow-lg">
          <Button onClick={handleAddQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
          <Button onClick={handleSaveQuestions}>
            <Save className="h-4 w-4 mr-2" />
            Save Questions
          </Button>
        </div>
      )}
    </div>
  );
};

export default McqManagement; 