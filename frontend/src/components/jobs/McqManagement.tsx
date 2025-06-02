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
import { Plus, Trash2, Save, Eye, Pencil } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { quizAPI } from "@/services/quizApi";
import { jobAPI } from "@/services/jobApi";
import { MCQuestion } from "@/types/job";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";

interface McqManagementProps {
  jobId: number;
}

const McqManagement = ({ jobId }: McqManagementProps) => {
  const [questions, setQuestions] = useState<MCQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [timingMode, setTimingMode] = useState<"per_question" | "whole_test">();
  const [wholeTestMinutes, setWholeTestMinutes] = useState<number>();
  const [newQuestion, setNewQuestion] = useState<MCQuestion>({
    description: "",
    category: "technical",
    type: "single",
  });
  const [imageFile, setImageFile] = useState<File | null>();

  useEffect(() => {
    fetchMcqQuestions();
  }, [jobId]);

  const fetchMcqQuestions = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getByJobId(jobId.toString());
      setQuestions(response.data || []);
      const jobResponse = await jobAPI.getCurrentRecruiterJob(jobId.toString());
      if (jobResponse.data.quiz_time_minutes) {
        setTimingMode("whole_test");
        setWholeTestMinutes(jobResponse.data.quiz_time_minutes);
      } else {
        setTimingMode("per_question");
      }
    } catch (error) {
      toast.error("Failed to load MCQ questions");
    } finally {
      setLoading(false);
    }
  };

  // const handleAddQuestion = () => {
  //   setQuestions([
  //     ...questions,
  //     {
  //       id: -Date.now(), // Use negative ID for new questions
  //       description: "",
  //       type: "single",
  //       category: "technical",
  //       time_seconds: 60,
  //       options: [
  //         { id: -1, label: "", correct: false },
  //         { id: -2, label: "", correct: false },
  //         { id: -3, label: "", correct: false },
  //         { id: -4, label: "", correct: false },
  //       ],
  //     },
  //   ]);
  // };

  const handleChange = (field: keyof MCQuestion, value: any) => {
    setNewQuestion((prev) => {
      return { ...prev, [field]: value };
    });
  };

  // const handleDeleteQuestion = async (index: number) => {
  //   try {
  //     const questionToDelete = questions[index];
  //     await api.delete(`/quiz-question?question_id=${questionToDelete.id}`, {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //     });
  //     setQuestions(questions.filter((_, i) => i !== index));
  //     toast.success("Question deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting question:", error);
  //     toast.error("Failed to delete question");
  //   }
  // };

  // const handleDeleteOption = async (
  //   questionIndex: number,
  //   optionIndex: number
  // ) => {
  //   try {
  //     const question = questions[questionIndex];
  //     const optionToDelete = question.options[optionIndex];

  //     // Only delete from backend if the option has an ID (not a new option)
  //     if (optionToDelete.id) {
  //       await api.delete(`/quiz-option?option_id=${optionToDelete.id}`, {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       });
  //     }

  //     // Update the question's options in the UI
  //     const updatedQuestions = [...questions];
  //     updatedQuestions[questionIndex].options = question.options.filter(
  //       (_, i) => i !== optionIndex
  //     );
  //     setQuestions(updatedQuestions);

  //     toast.success("Option deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting option:", error);
  //     toast.error("Failed to delete option");
  //   }
  // };

  // const handleAddOption = async (questionIndex: number) => {
  //   try {
  //     const question = questions[questionIndex];

  //     // Don't allow adding options for true/false questions
  //     if (question.type === "true_false") {
  //       return;
  //     }

  //     // Check if already has 4 options
  //     if (question.options.length >= 4) {
  //       toast.error("Maximum 4 options allowed per question");
  //       return;
  //     }

  //     // Create the new option in the backend
  //     const response = await api.post(
  //       "/quiz-option",
  //       {
  //         label: "",
  //         correct: false,
  //         question_id: question.id,
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }
  //     );

  //     // Update the UI with the new option
  //     const updatedQuestions = [...questions];
  //     updatedQuestions[questionIndex].options.push({
  //       id: response.data.id,
  //       label: "",
  //       correct: false,
  //     });
  //     setQuestions(updatedQuestions);
  //   } catch (error) {
  //     console.error("Error adding option:", error);
  //     toast.error("Failed to add option");
  //   }
  // };

  // const handleSaveQuestions = async () => {
  //   try {
  //     // First update the job's quiz_time_minutes if in whole test mode
  //     if (timingMode === "whole_test") {
  //       await jobAPI.updateJob(jobId.toString(), {
  //         quiz_time_minutes: wholeTestMinutes,
  //       });
  //     }

  //     // Then proceed with saving questions
  //     for (const question of questions) {
  //       if (question.id < 0) {
  //         // New question
  //         const formData = new FormData();
  //         formData.append("description", question.description);
  //         formData.append("type", question.type);
  //         formData.append("category", question.category);
  //         formData.append("job_id", jobId.toString());
  //         formData.append(
  //           "time_seconds",
  //           timingMode === "per_question"
  //             ? question.time_seconds?.toString() || "60"
  //             : "0"
  //         );

  //         const questionResponse = await api.post("/quiz-question", formData, {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //             "Content-Type": "multipart/form-data",
  //           },
  //         });

  //         // Create options for new question
  //         for (const option of question.options) {
  //           await api.post(
  //             "/quiz-option",
  //             {
  //               label: option.label,
  //               correct: option.correct,
  //               question_id: questionResponse.data.id,
  //             },
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${localStorage.getItem("token")}`,
  //               },
  //             }
  //           );
  //         }
  //       } else {
  //         // Existing question
  //         const formData = new FormData();
  //         formData.append("description", question.description);
  //         formData.append("type", question.type);
  //         formData.append("category", question.category);
  //         formData.append(
  //           "time_seconds",
  //           timingMode === "per_question"
  //             ? question.time_seconds?.toString() || "60"
  //             : "0"
  //         );
  //         formData.append("id", question.id.toString());

  //         await api.put("/quiz-question", formData, {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //             "Content-Type": "multipart/form-data",
  //           },
  //         });

  //         // Update existing options
  //         for (const option of question.options) {
  //           if (option.id < 0) {
  //             // Create new option for existing question
  //             await api.post(
  //               "/quiz-option",
  //               {
  //                 label: option.label,
  //                 correct: option.correct,
  //                 question_id: question.id,
  //               },
  //               {
  //                 headers: {
  //                   Authorization: `Bearer ${localStorage.getItem("token")}`,
  //                 },
  //               }
  //             );
  //           } else {
  //             // Update existing option
  //             await api.put(
  //               "/quiz-option",
  //               {
  //                 id: option.id,
  //                 label: option.label,
  //                 correct: option.correct,
  //               },
  //               {
  //                 headers: {
  //                   Authorization: `Bearer ${localStorage.getItem("token")}`,
  //                 },
  //               }
  //             );
  //           }
  //         }
  //       }
  //     }
  //     toast.success("MCQ questions saved successfully");
  //     await fetchMcqQuestions();
  //   } catch (error: any) {
  //     console.error("Error saving MCQ questions:", error);
  //     toast.error("Failed to save MCQ questions");
  //   }
  // };

  // const handleExcelImport = (importedQuestions: any[]) => {
  //   setQuestions([
  //     ...questions,
  //     ...importedQuestions.map((q) => ({
  //       id: -Date.now() - Math.random(), // Generate unique negative IDs
  //       description: q.title,
  //       type: q.type,
  //       category: q.category,
  //       time_seconds: q.time_seconds,
  //       options: q.options.map((opt: string, idx: number) => ({
  //         id: -idx - 1,
  //         label: opt,
  //         correct: q.correct_options.includes(idx),
  //       })),
  //     })),
  //   ]);
  // };

  // const handleImageUpload = async (index: number, file: File) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("image", file);
  //     formData.append("description", questions[index].description);
  //     formData.append("type", questions[index].type);
  //     formData.append("category", questions[index].category);
  //     formData.append("job_id", jobId.toString());
  //     formData.append("time_seconds", questions[index].time_seconds.toString());

  //     const response = await api.post("/quiz-question", formData, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     const updatedQuestions = [...questions];
  //     updatedQuestions[index] = {
  //       ...updatedQuestions[index],
  //       image_url: response.data.image_url,
  //     };
  //     setQuestions(updatedQuestions);
  //     toast.success("Image uploaded successfully");
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     toast.error("Failed to upload image");
  //   }
  // };

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
          <div className="space-y-4 flex gap-8">
            <div className="space-y-2">
              <div>Timing Mode</div>
              <div>
                {timingMode == "per_question" ? "Per Question" : "Whole Quiz"}
              </div>
            </div>

            {timingMode === "whole_test" && (
              <div className="space-y-2">
                <div>Total Test Time (minutes)</div>
                <div>{wholeTestMinutes}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={newQuestion.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter your question"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div className="space-y-4 flex-1">
                <div className="flex gap-4">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={newQuestion.category}
                      onValueChange={(value) => handleChange("category", value)}
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
                      value={newQuestion.type}
                      onValueChange={(value) => {
                        handleChange("type", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select answer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Choice</SelectItem>
                        <SelectItem value="multiple">
                          Multiple Choice
                        </SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {timingMode === "per_question" && (
                    <div className="space-y-2">
                      <Label>Time Limit (seconds)</Label>
                      <Select
                        value={newQuestion.time_seconds?.toString()}
                        onValueChange={(value) =>
                          handleChange("time_seconds", parseInt(value))
                        }
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
                  )}
                </div>
                <div className="space-y-2">
                  <Card>
                    <CardHeader>
                      <CardDescription>Options</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {newQuestion.type == "single" ? (
                        <RadioGroup
                          className="w-full"
                          value={
                            newQuestion.options?.filter(
                              (option) => option.correct == true
                            )[0].label
                          }
                          onValueChange={(value) => {
                            handleChange(
                              "options",
                              newQuestion.options?.map((option) => {
                                if (option.label == value) {
                                  return { label: option.label, correct: true };
                                } else {
                                  return {
                                    label: option.label,
                                    correct: false,
                                  };
                                }
                              })
                            );
                          }}
                        >
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem
                              value={newQuestion.options?.[0].label || ""}
                            ></RadioGroupItem>
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[0].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[0].correct,
                                    },
                                    newQuestion.options?.[1],
                                    newQuestion.options?.[2],
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem
                              value={newQuestion.options?.[0].label || ""}
                            ></RadioGroupItem>
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[1].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[1].correct,
                                    },
                                    newQuestion.options?.[2],
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem
                              value={newQuestion.options?.[0].label || ""}
                            ></RadioGroupItem>
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[2].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    newQuestion.options?.[1],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[2].correct,
                                    },
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem
                              value={newQuestion.options?.[0].label || ""}
                            ></RadioGroupItem>
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[0].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    newQuestion.options?.[1],
                                    newQuestion.options?.[2],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[3].correct,
                                    },
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                        </RadioGroup>
                      ) : newQuestion.type == "multiple" ? (
                        <div>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={newQuestion.options?.[0].correct}
                              onCheckedChange={(checked) => {
                                handleChange("options", [
                                  {
                                    label: newQuestion.options?.[0].label,
                                    correct: checked,
                                  },
                                  newQuestion.options?.[1],
                                  newQuestion.options?.[2],
                                  newQuestion.options?.[3],
                                ]);
                              }}
                            />
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[0].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[0].correct,
                                    },
                                    newQuestion.options?.[1],
                                    newQuestion.options?.[2],
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={newQuestion.options?.[1].correct}
                              onCheckedChange={(checked) => {
                                handleChange("options", [
                                  newQuestion.options?.[0],
                                  {
                                    label: newQuestion.options?.[1].label,
                                    correct: checked,
                                  },
                                  newQuestion.options?.[2],
                                  newQuestion.options?.[3],
                                ]);
                              }}
                            />
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[1].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[1].correct,
                                    },
                                    newQuestion.options?.[2],
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={newQuestion.options?.[2].correct}
                              onCheckedChange={(checked) => {
                                handleChange("options", [
                                  newQuestion.options?.[0],
                                  newQuestion.options?.[1],
                                  {
                                    label: newQuestion.options?.[2].label,
                                    correct: checked,
                                  },
                                  newQuestion.options?.[3],
                                ]);
                              }}
                            />
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[2].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    newQuestion.options?.[1],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[2].correct,
                                    },
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={newQuestion.options?.[3].correct}
                              onCheckedChange={(checked) => {
                                handleChange("options", [
                                  newQuestion.options?.[0],
                                  newQuestion.options?.[1],
                                  newQuestion.options?.[2],
                                  {
                                    label: newQuestion.options?.[3].label,
                                    correct: checked,
                                  },
                                ]);
                              }}
                            />
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[3].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    newQuestion.options?.[1],
                                    newQuestion.options?.[2],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[3].correct,
                                    },
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                        </div>
                      ) : newQuestion.type == "true_false" ? (
                        <RadioGroup
                          className="w-full"
                          value={
                            newQuestion.options?.filter(
                              (option) => option.correct == true
                            )[0].label
                          }
                          onValueChange={(value) => {
                            setNewQuestion((prev) => {
                              return {
                                ...prev,
                                options: [
                                  { label: "True", correct: value == "True" },
                                  { label: "False", correct: value == "False" },
                                ],
                              };
                            });
                          }}
                        >
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem value="True"></RadioGroupItem>
                            <Label className="w-full">True</Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem value="False"></RadioGroupItem>
                            <Label className="w-full">False</Label>
                          </div>
                        </RadioGroup>
                      ) : (
                        <></>
                      )}
                    </CardContent>
                  </Card>
                  <Button
                    size="sm"
                    // onClick={() => handleAddOption(index)}
                    className="w-full"
                  >
                    Save Question
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 pb-24">
        {/* {questions.map((question, index) => ( */}
        {/* <Card key={question.id}> */}
        <CardHeader>
          {/* <CardTitle>Question {index + 1}</CardTitle> */}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                // value={question.description}
                // onChange={(e) =>
                // handleUpdateQuestion(index, "description", e.target.value)
                // }
                placeholder="Enter your question"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Add Image</Label>
                <Switch
                // checked={!!question.image_url}
                // onCheckedChange={(checked) => {
                //   if (!checked) {
                //     handleUpdateQuestion(index, "image_url", undefined);
                //   }
                // }}
                />
              </div>
              {/* {!question.image_url && ( */}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // handleImageUpload(index, file);
                    }
                  }}
                />
              </div>
              {/* )} */}
              {/* {question.image_url && ( */}
              <div className="relative">
                <img
                  // src={question.image_url}
                  alt="Question"
                  className="max-w-full h-auto rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  // onClick={() =>
                  //   handleUpdateQuestion(index, "image_url", undefined)
                  // }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {/* )} */}
            </div>

            <div className="flex justify-between items-start">
              <div className="space-y-4 flex-1">
                <div className="flex gap-4">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                    // value={question.category}
                    // onValueChange={(value) =>
                    //   handleUpdateQuestion(index, "category", value)
                    // }
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
                    // value={question.type}
                    // onValueChange={(value) => {
                    //   handleUpdateQuestion(index, "type", value);
                    // }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select answer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Choice</SelectItem>
                        <SelectItem value="multiple">
                          Multiple Choice
                        </SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* {timingMode === "per_question" && ( */}
                  <div className="space-y-2">
                    <Label>Time Limit (seconds)</Label>
                    <Select
                    // value={question.time_seconds?.toString() || "60"}
                    // onValueChange={(value) =>
                    //   handleUpdateQuestion(
                    //     index,
                    //     "time_seconds",
                    //     parseInt(value)
                    //   )
                    // }
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
                  {/* )} */}
                </div>
                <div className="space-y-2">
                  {/* {question.options.map((option, optionIndex) => ( */}
                  <div
                  // key={option.id}
                  // className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                  // option.correct
                  // ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  // : "hover:bg-accent/50"
                  // }`}
                  >
                    {/* {isEditMode ? ( */}
                    <>
                      {/* {question.type === "multiple" ? ( */}
                      <input
                        type="checkbox"
                        // checked={option.correct}
                        // onChange={() => {
                        // const newOptions = question.options.map(
                        // (opt, idx) => ({
                        // ...opt,
                        // correct:
                        // idx === optionIndex
                        // ? !opt.correct
                        // : opt.correct,
                        // })
                        // );
                        // handleUpdateQuestion(
                        // index,
                        // "options",
                        // newOptions
                        // );
                        // }}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      {/* ) : ( */}
                      <input
                        type="radio"
                        // name={`correct-${index}`}
                        // checked={option.correct}
                        // onChange={() => {
                        //   const newOptions = question.options.map(
                        //     (opt, idx) => ({
                        //       ...opt,
                        //       correct: idx === optionIndex,
                        //     })
                        //   );
                        //   handleUpdateQuestion(
                        //     index,
                        //     "options",
                        //     newOptions
                        //   );
                        // }}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      {/* )} */}
                      <Input
                      // placeholder={`Option ${optionIndex + 1}`}
                      // value={option.label}
                      // onChange={(e) => {
                      //   const newOptions = [...question.options];
                      //   newOptions[optionIndex] = {
                      //     ...newOptions[optionIndex],
                      //     label: e.target.value,
                      //   };
                      //   handleUpdateQuestion(
                      //     index,
                      //     "options",
                      //     newOptions
                      //   );
                      // }}
                      // className={`flex-1 ${
                      // option.correct ? "font-medium" : ""
                      // }`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        // onClick={() =>
                        //   handleDeleteOption(index, optionIndex)
                        // }
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                    {/* ) : ( */}
                    <div className="flex items-center gap-2 flex-1">
                      <div
                      // className={`h-4 w-4 rounded-full border-2 ${
                      //   option.correct
                      //     ? "border-green-500 bg-green-500"
                      //     : "border-gray-300"
                      // }`}
                      />
                      <span
                      // className={option.correct ? "font-medium" : ""}
                      >
                        {/* {option.label} */}
                      </span>
                    </div>
                    {/* )} */}
                  </div>
                  {/* ))} */}
                  {/* {isEditMode && */}
                  {/* question.type !== "true_false" && */}
                  {/* question.options.length < 4 && ( */}
                  <Button
                    variant="outline"
                    size="sm"
                    // onClick={() => handleAddOption(index)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                  {/* )} */}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {/* {isEditMode && ( */}
                <Button
                  variant="ghost"
                  size="icon"
                  // onClick={() => handleDeleteQuestion(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {/* )} */}
                <div className="flex gap-2">
                  <Badge
                  // variant={
                  //   question.category === "technical"
                  //     ? "default"
                  //     : "secondary"
                  // }
                  >
                    {/* {question.category} */}
                  </Badge>
                  <Badge variant="outline">
                    {/* {question.type === "single"
                          ? "Single Choice"
                          : question.type === "multiple"
                          ? "Multiple Choice"
                          : "True/False"} */}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        {/* </Card> */}
        {/* ))} */}
      </div>
    </div>
  );
};

export default McqManagement;
