import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import * as z from "zod";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { jobAPI } from "@/lib/api";
import { api } from "@/lib/api";
import { JobData } from "@/types/job";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import AIGeneratePopup from "@/components/jobs/AIGeneratePopup";
import { useNotifications } from "@/context/NotificationContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import QuestionEditor from "@/pages/DsaLab/QuestionEditor";

const jobFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Job title must be at least 3 characters" }),
  department: z.string().min(1, { message: "Please select a department" }),
  city: z.string().min(1, { message: "Please enter a city" }),
  location: z.string().min(1, { message: "Please select a location" }),
  type: z.string().min(1, { message: "Please select a job type" }),
  min_experience: z.number().min(0, { message: "Minimum experience must be 0 or greater" }),
  max_experience: z.number().min(0, { message: "Maximum experience must be 0 or greater" }),
  salary_min: z.number().min(0, { message: "Minimum salary must be 0 or greater" }),
  salary_max: z.number().min(0, { message: "Maximum salary must be 0 or greater" }),
  show_salary: z.boolean().default(true),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  requirements: z
    .string()
    .min(10, { message: "Requirements must be at least 10 characters" }),
  benefits: z.string(),
  status: z.string().default("active"),
  currency: z.string().optional(),
  requires_dsa: z.boolean().default(false),
  requires_mcq: z.boolean().default(false),
  dsa_questions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.string(),
    test_cases: z.array(z.object({
      input: z.string(),
      expected_output: z.string()
    }))
  })).optional(),
  mcq_questions: z.array(z.object({
    title: z.string(),
    type: z.enum(["single", "multiple", "true_false"]),
    question_type: z.enum(["technical", "aptitude"]),
    options: z.array(z.string()),
    correct_options: z.array(z.number())
  })).optional()
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const saveMcqQuestions = async (jobId: number, questions: any[]) => {
  try {
    for (const question of questions) {
      // Create the quiz question
      const questionResponse = await api.post('/quiz-question', {
        description: question.title,
        job_id: jobId,
        type: question.question_type // Only send the question type (technical/aptitude)
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const questionId = questionResponse.data.id;

      if (question.type === 'true_false') {
        // For true/false questions, create only two options: True and False
        await api.post('/quiz-option', {
          label: 'True',
          correct: question.correct_options[0] === 0,
          question_id: questionId
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        await api.post('/quiz-option', {
          label: 'False',
          correct: question.correct_options[0] === 1,
          question_id: questionId
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        // For single and multiple choice questions, create all options
        for (let i = 0; i < question.options.length; i++) {
          const option = question.options[i];
          let isCorrect = false;

          if (question.type === 'single') {
            // For single choice, only one option is correct
            isCorrect = question.correct_options[0] === i;
          } else if (question.type === 'multiple') {
            // For multiple choice, check if this option is in correct_options array
            isCorrect = question.correct_options.includes(i);
          }

          await api.post('/quiz-option', {
            label: option,
            correct: isCorrect,
            question_id: questionId
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error saving MCQ questions:', error);
    throw error;
  }
};

const NewJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("job-details");
  const [jobData, setJobData] = useState<JobData>({
    id: 0,
    title: "",
    description: "",
    department: "",
    city: "",
    location: "",
    type: "",
    min_experience: 0,
    max_experience: 0,
    salary_min: null,
    salary_max: null,
    currency: "INR",
    show_salary: true,
    requirements: "",
    benefits: "",
    status: "active",
    createdAt: new Date().toISOString(),
    requires_dsa: false,
    requires_mcq: false,
    dsa_questions: [],
    mcq_questions: []
  });
  const { addNotification } = useNotifications();

  interface MCQQuestion {
    title: string;
    type: "single" | "multiple" | "true_false";
    question_type: "technical" | "aptitude";
    options: string[];
    correct_options: number[];
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create job with all data
      const response = await jobAPI.createJob(jobData);

      if (response.status >= 200 && response.status < 300) {
        // If MCQ questions are enabled, save them
        if (jobData.requires_mcq && jobData.mcq_questions && jobData.mcq_questions.length > 0) {
          await saveMcqQuestions(response.data.id, jobData.mcq_questions);
        }

        addNotification({
          type: 'job',
          title: 'New Job Created',
          message: `Your job posting "${jobData.title}" is now live.${jobData.requires_dsa ? ' DSA questions have been added.' : ''
            }${jobData.requires_mcq ? ' MCQ questions have been added.' : ''}`
        });
        toast.success("Job created successfully");
        navigate("/dashboard/jobs");
      } else {
        throw new Error("Failed to create job");
      }
    } catch (error: any) {
      console.error("Error creating job:", error);
      let errorMessage = "Failed to create job";

      // Handle specific error messages
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratedContent = (
    field: keyof JobFormValues,
    content: string
  ) => {
    setJobData({ ...jobData, [field]: content });
  };

  const handleDsaQuestionAdd = () => {
    setJobData({
      ...jobData,
      dsa_questions: [
        ...(jobData.dsa_questions || []),
        {
          title: "",
          description: "",
          difficulty: "Easy",
          test_cases: [
            { input: "", expected_output: "" }
          ]
        }
      ]
    });
  };

  const handleDsaQuestionUpdate = (index: number, field: string, value: any) => {
    const updatedQuestions = [...(jobData.dsa_questions || [])];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setJobData({
      ...jobData,
      dsa_questions: updatedQuestions
    });
  };

  const handleTestCaseUpdate = (questionIndex: number, testCaseIndex: number, field: string, value: string) => {
    const updatedQuestions = [...(jobData.dsa_questions || [])];
    updatedQuestions[questionIndex].test_cases[testCaseIndex] = {
      ...updatedQuestions[questionIndex].test_cases[testCaseIndex],
      [field]: value
    };
    setJobData({
      ...jobData,
      dsa_questions: updatedQuestions
    });
  };

  const handleTestCaseAdd = (questionIndex: number) => {
    const updatedQuestions = [...(jobData.dsa_questions || [])];
    updatedQuestions[questionIndex].test_cases.push({
      input: "",
      expected_output: ""
    });
    setJobData({
      ...jobData,
      dsa_questions: updatedQuestions
    });
  };

  const handleTestCaseDelete = (questionIndex: number, testCaseIndex: number) => {
    const updatedQuestions = [...(jobData.dsa_questions || [])];
    updatedQuestions[questionIndex].test_cases = updatedQuestions[questionIndex].test_cases.filter((_, index) => index !== testCaseIndex);
    setJobData({
      ...jobData,
      dsa_questions: updatedQuestions
    });
  };

  const handleMcqQuestionAdd = () => {
    const newQuestion: MCQQuestion = {
      title: "",
      type: "single",
      question_type: "technical",
      options: ["", "", "", ""],
      correct_options: [0]
    };
    setJobData({
      ...jobData,
      mcq_questions: [...(jobData.mcq_questions || []), newQuestion]
    });
  };

  const handleMcqQuestionUpdate = (index: number, field: string, value: any) => {
    const updatedQuestions = [...(jobData.mcq_questions || [])];
    if (field === "options") {
      const optionIndex = parseInt(value.optionIndex);
      const optionValue = value.value;
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        options: updatedQuestions[index].options.map((opt, idx) =>
          idx === optionIndex ? optionValue : opt
        )
      };
    } else if (field === "type") {
      // Reset correct options when type changes
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        type: value,
        correct_options: [0], // Default to first option being correct
        // For true/false questions, automatically set up True and False options
        options: value === "true_false" ? ["True", "False"] : ["", "", "", ""]
      };
    } else if (field === "correct_options") {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        correct_options: value
      };
    } else if (field === "question_type") {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        question_type: value
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
    }
    setJobData({
      ...jobData,
      mcq_questions: updatedQuestions
    });
  };

  const renderMcqQuestion = (question: any, index: number) => {
    return (
      <div key={index} className="space-y-4 p-4 border rounded-lg">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Label>Question {index + 1}</Label>
            <Textarea
              value={question.title}
              onChange={(e) => handleMcqQuestionUpdate(index, "title", e.target.value)}
              placeholder="Enter your question"
            />
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={question.question_type}
                  onValueChange={(value) => handleMcqQuestionUpdate(index, "question_type", value)}
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
                  onValueChange={(value) => handleMcqQuestionUpdate(index, "type", value)}
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
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const updatedQuestions = [...(jobData.mcq_questions || [])];
              updatedQuestions.splice(index, 1);
              setJobData({ ...jobData, mcq_questions: updatedQuestions });
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Options</Label>
          {question.type === "true_false" ? (
            <div className="space-y-2">
              <RadioGroup
                value={question.correct_options[0]?.toString()}
                onValueChange={(value) => handleMcqQuestionUpdate(index, "correct_options", [parseInt(value)])}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id={`true-${index}`} />
                    <Label htmlFor={`true-${index}`}>True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id={`false-${index}`} />
                    <Label htmlFor={`false-${index}`}>False</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          ) : (
            question.options.map((option: string, optionIndex: number) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => handleMcqQuestionUpdate(index, "options", {
                    optionIndex,
                    value: e.target.value
                  })}
                  placeholder={`Option ${optionIndex + 1}`}
                />
                {question.type === "single" ? (
                  <RadioGroup
                    value={question.correct_options[0]?.toString()}
                    onValueChange={(value) => handleMcqQuestionUpdate(index, "correct_options", [parseInt(value)])}
                  >
                    <RadioGroupItem value={optionIndex.toString()} />
                  </RadioGroup>
                ) : (
                  <Checkbox
                    checked={question.correct_options.includes(optionIndex)}
                    onCheckedChange={(checked) => {
                      const currentCorrect = [...question.correct_options];
                      if (checked) {
                        currentCorrect.push(optionIndex);
                      } else {
                        const index = currentCorrect.indexOf(optionIndex);
                        if (index > -1) {
                          currentCorrect.splice(index, 1);
                        }
                      }
                      handleMcqQuestionUpdate(index, "correct_options", currentCorrect);
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
        {question.type === "single" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const updatedQuestions = [...(jobData.mcq_questions || [])];
              updatedQuestions[index].options.push("");
              setJobData({ ...jobData, mcq_questions: updatedQuestions });
            }}
          >
            Add Option
          </Button>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Create New Job"
          description="Add a new job posting to find the perfect candidate"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/jobs")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </PageHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="job-details">Job Details</TabsTrigger>
              <TabsTrigger value="dsa-questions">DSA Questions</TabsTrigger>
              <TabsTrigger value="mcq-questions">MCQ Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="job-details">
              {/* Basic Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title *</Label>
                    <Input
                      id="job-title"
                      placeholder="e.g. Senior Software Engineer"
                      value={jobData.title}
                      onChange={(e) =>
                        setJobData({ ...jobData, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select
                      onValueChange={(val: string) =>
                        setJobData({ ...jobData, department: val })
                      }
                      defaultValue={jobData.department}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="customer_support">Customer Support</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Type *</Label>
                    <Select
                      onValueChange={(val: string) =>
                        setJobData({ ...jobData, type: val })
                      }
                      defaultValue={jobData.type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location Type *</Label>
                    <Select
                      onValueChange={(val: string) =>
                        setJobData({ ...jobData, location: val })
                      }
                      defaultValue={jobData.location}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Select
                      onValueChange={(val: string) =>
                        setJobData({ ...jobData, city: val })
                      }
                      defaultValue={jobData.city}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bengaluru">Bengaluru</SelectItem>
                        <SelectItem value="hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                        <SelectItem value="kolkata">Kolkata</SelectItem>
                        <SelectItem value="pune">Pune</SelectItem>
                        <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                        <SelectItem value="jaipur">Jaipur</SelectItem>
                        <SelectItem value="lucknow">Lucknow</SelectItem>
                        <SelectItem value="kochi">Kochi</SelectItem>
                        <SelectItem value="indore">Indore</SelectItem>
                        <SelectItem value="bhopal">Bhopal</SelectItem>
                        <SelectItem value="chandigarh">Chandigarh</SelectItem>
                        <SelectItem value="nagpur">Nagpur</SelectItem>
                        <SelectItem value="visakhapatnam">Visakhapatnam</SelectItem>
                        <SelectItem value="patna">Patna</SelectItem>
                        <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                        <SelectItem value="coimbatore">Coimbatore</SelectItem>
                        <SelectItem value="guwahati">Guwahati</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Experience & Salary Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Experience & Salary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Minimum Experience (Years) *</Label>
                    <Select
                      onValueChange={(val: string) =>
                        setJobData({ ...jobData, min_experience: Number(val) })
                      }
                      defaultValue={jobData.min_experience?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select min experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Fresher</SelectItem>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="2">2 years</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="4">4 years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Experience (Years) *</Label>
                    <Select
                      onValueChange={(val: string) =>
                        setJobData({ ...jobData, max_experience: Number(val) })
                      }
                      defaultValue={jobData.max_experience?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select max experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="2">2 years</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="4">4 years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Salary Range *</Label>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(val: string) =>
                          setJobData({ ...jobData, currency: val })
                        }
                        defaultValue={jobData.currency || "INR"}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">₹ INR</SelectItem>
                          <SelectItem value="USD">$ USD</SelectItem>
                          <SelectItem value="EUR">€ EUR</SelectItem>
                          <SelectItem value="GBP">£ GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min salary"
                          value={jobData.salary_min || ""}
                          onChange={(e) =>
                            setJobData({
                              ...jobData,
                              salary_min: e.target.value ? Number(e.target.value) : null
                            })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max salary"
                          value={jobData.salary_max || ""}
                          onChange={(e) =>
                            setJobData({
                              ...jobData,
                              salary_max: e.target.value ? Number(e.target.value) : null
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={jobData.show_salary}
                      onCheckedChange={(checked) =>
                        setJobData({ ...jobData, show_salary: checked })
                      }
                    />
                    <Label>Show Salary in Job Posting</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Job Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Job Description *</Label>
                      <AIGeneratePopup
                        title="Generate Description"
                        fieldLabel="Description"
                        jobTitle={jobData.title}
                        department={jobData.department}
                        location={jobData.location}
                        jobType={jobData.type}
                        onGenerated={(content) =>
                          setJobData({ ...jobData, description: content })
                        }
                      />
                    </div>
                    <Textarea
                      className="min-h-[200px]"
                      placeholder="Describe the role, responsibilities, and expectations..."
                      value={jobData.description}
                      onChange={(e) =>
                        setJobData({ ...jobData, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Requirements *</Label>
                      <AIGeneratePopup
                        title="Generate Requirements"
                        fieldLabel="Requirements"
                        jobTitle={jobData.title}
                        department={jobData.department}
                        location={jobData.location}
                        jobType={jobData.type}
                        onGenerated={(content) =>
                          setJobData({ ...jobData, requirements: content })
                        }
                      />
                    </div>
                    <Textarea
                      className="min-h-[200px]"
                      placeholder="List the required skills, qualifications, and experience..."
                      value={jobData.requirements}
                      onChange={(e) =>
                        setJobData({ ...jobData, requirements: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Benefits</Label>
                    <Textarea
                      className="min-h-[150px]"
                      placeholder="List the benefits and perks offered..."
                      value={jobData.benefits}
                      onChange={(e) =>
                        setJobData({ ...jobData, benefits: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={jobData.requires_dsa}
                      onCheckedChange={(checked) =>
                        setJobData({ ...jobData, requires_dsa: checked })
                      }
                    />
                    <Label>Requires DSA Assessment</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires_mcq"
                      checked={jobData.requires_mcq}
                      onCheckedChange={(checked) =>
                        setJobData({ ...jobData, requires_mcq: checked })
                      }
                    />
                    <Label>Requires MCQ Assessment</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dsa-questions">
              <Card>
                <CardHeader>
                  <CardTitle>DSA Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!jobData.requires_dsa ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Enable DSA assessment in the Job Details tab to add questions
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={handleDsaQuestionAdd}
                        >
                          Add Question
                        </Button>
                      </div>

                      {jobData.dsa_questions?.map((question, questionIndex) => (
                        <Card key={questionIndex} className="p-4">
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label>Question Title</Label>
                                <Input
                                  value={question.title}
                                  onChange={(e) =>
                                    handleDsaQuestionUpdate(questionIndex, "title", e.target.value)
                                  }
                                  placeholder="e.g. Two Sum"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select
                                  value={question.difficulty}
                                  onValueChange={(value) =>
                                    handleDsaQuestionUpdate(questionIndex, "difficulty", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Question Description</Label>
                              {/* <Textarea
                                value={question.description}
                                onChange={(e) =>
                                  handleDsaQuestionUpdate(questionIndex, "description", e.target.value)
                                }
                                placeholder="Describe the problem and constraints..."
                                className="min-h-[150px]"
                              /> */}
                              <QuestionEditor
                                questionDescription={question.description}
                                setQuestionDescription={(value: string) =>
                                  handleDsaQuestionUpdate(questionIndex, "description", value)
                                }
                              />
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <Label>Test Cases</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestCaseAdd(questionIndex)}
                                >
                                  Add Test Case
                                </Button>
                              </div>

                              <div className="space-y-4">
                                {question.test_cases.map((testCase, testCaseIndex) => (
                                  <div key={testCaseIndex} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <Label>Input</Label>
                                      <Input
                                        value={testCase.input}
                                        onChange={(e) =>
                                          handleTestCaseUpdate(questionIndex, testCaseIndex, "input", e.target.value)
                                        }
                                        placeholder="e.g. nums = [2,7,11,15], target = 9"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center mb-2">
                                        <Label>Expected Output</Label>
                                        {question.test_cases.length > 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleTestCaseDelete(questionIndex, testCaseIndex)}
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                      <Input
                                        value={testCase.expected_output}
                                        onChange={(e) =>
                                          handleTestCaseUpdate(questionIndex, testCaseIndex, "expected_output", e.target.value)
                                        }
                                        placeholder="e.g. [0,1]"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mcq-questions">
              <Card>
                <CardHeader>
                  <CardTitle>Multiple Choice Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!jobData.requires_mcq ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Enable MCQ assessment in the Job Details tab to add questions
                      </p>
                    </div>
                  ) : (
                    <>
                      {jobData.mcq_questions?.map((question, index) => renderMcqQuestion(question, index))}
                      
                      <div className="flex justify-end mt-6">
                        <Button
                          type="button"
                          onClick={handleMcqQuestionAdd}
                        >
                          Add MCQ Question
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Job...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Job
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewJob;
