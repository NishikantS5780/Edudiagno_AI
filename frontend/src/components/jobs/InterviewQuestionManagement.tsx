import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { InterviewQuestion, MCQuestion } from "@/types/job";
import { interviewQuestionAPI } from "@/services/interviewQuestionApi";

const InterviewQuestionManagement = ({ jobId }: { jobId: number }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState<InterviewQuestion>({
    order_number: 0,
    question: "",
    question_type: "problem_solving",
  });

  useEffect(() => {
    fetchInterviewQuestions();
  }, [jobId]);

  const fetchInterviewQuestions = async () => {
    try {
      setLoading(true);
      const response = await interviewQuestionAPI.getByJob(jobId);
      setQuestions(response.data || []);
    } catch (error) {
      toast.error("Failed to load Interview questions");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof InterviewQuestion, value: any) => {
    setNewQuestion((prev) => {
      return { ...prev, [field]: value };
    });
  };

  const handleSaveQuestion = async () => {
    try {
      setLoading(true);
      const response = await interviewQuestionAPI.create(newQuestion, jobId);
      if (!response) {
        throw new Error("Failed to save Interview question");
      }

      setNewQuestion({
        order_number: 0,
        question: "",
        question_type: newQuestion.question_type,
      });

      toast.success("MCQ question saved successfully");
      await fetchInterviewQuestions();
    } catch (error: any) {
      let msg = error.message || "Failed to save MCQ questions";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Total Questions: {questions.length}
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Order No.</Label>
              <Input
                type="number"
                value={newQuestion.order_number}
                onChange={(e) =>
                  handleChange("order_number", parseInt(e.target.value))
                }
                placeholder="Order Priority"
              />
            </div>
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={newQuestion.question}
                onChange={(e) => handleChange("question", e.target.value)}
                placeholder="Enter your question"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Question Type</Label>
              <Select
                value={newQuestion.question_type}
                onValueChange={(value) => handleChange("question_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="problem_solving">
                    Problem Solving
                  </SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSaveQuestion} className="w-full">
              Save Question
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 pb-24">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="w-full flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive ml-auto"
                  // onClick={() => handleDeleteQuestion(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                [{question.order_number}] {question.question}
              </CardDescription>
              <div className="space-y-4">
                {question.question_type == "behavioral" ? (
                  <Badge>Behavioral</Badge>
                ) : question.question_type == "custom" ? (
                  <Badge>Custom</Badge>
                ) : question.question_type == "problem_solving" ? (
                  <Badge>Problem Solving</Badge>
                ) : question.question_type == "technical" ? (
                  <Badge>Technical</Badge>
                ) : (
                  ""
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InterviewQuestionManagement;
