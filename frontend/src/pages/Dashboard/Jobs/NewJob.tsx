import React, { useState, useEffect } from "react";
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
import { Save, ArrowLeft, Trash2, Plus } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { jobAPI } from "@/lib/api";
import { api } from "@/lib/api";
import { JobData } from "@/types/job";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import AIGeneratePopup from "@/components/jobs/AIGeneratePopup";
import { useNotifications } from "@/context/NotificationContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import QuestionEditor from "@/pages/DsaLab/QuestionEditor";
import ExcelImport from '@/components/jobs/ExcelImport';
import { useUser } from "@/context/UserContext";
import { RecruiterData } from "@/types/recruiter";
import { recruiterAPI } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const jobFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Job title must be at least 3 characters" })
    .nonempty({ message: "Job title is required" }),
  department: z.string().nonempty({ message: "Please select a department" }),
  city: z.string().nonempty({ message: "Please select a city" }),
  location: z.string().nonempty({ message: "Please select a location type" }),
  type: z.string().nonempty({ message: "Please select a job type" }),
  min_experience: z.number().min(0, { message: "Minimum experience must be 0 or greater" }).int({ message: "Experience must be a whole number" }),
  max_experience: z.number().min(0, { message: "Maximum experience must be 0 or greater" }).int({ message: "Experience must be a whole number" }),
  duration_months: z.number().min(1, { message: "Duration must be at least 1 month" }).int({ message: "Duration must be a whole number" }),
  key_qualification: z.string().nonempty({ message: "Please select a key qualification" }),
  salary_min: z.number().min(0, { message: "Minimum salary must be 0 or greater" }).int({ message: "Salary must be a whole number" }).nullable(),
  salary_max: z.number().min(0, { message: "Maximum salary must be 0 or greater" }).int({ message: "Salary must be a whole number" }).nullable(),
  show_salary: z.boolean().default(true),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .nonempty({ message: "Job description is required" }),
  requirements: z
    .string()
    .min(10, { message: "Requirements must be at least 10 characters" })
    .nonempty({ message: "Job requirements are required" }),
  benefits: z.string().nonempty({ message: "Benefits are required" }),
  status: z.string().default("active"),
  currency: z.string().nonempty({ message: "Please select a currency" }),
  requires_dsa: z.boolean().default(false),
  requires_mcq: z.boolean().default(false),
  dsa_questions: z.array(z.object({
    title: z.string().nonempty({ message: "DSA question title is required" }),
    description: z.string().nonempty({ message: "DSA question description is required" }),
    difficulty: z.string().nonempty({ message: "Please select difficulty level" }),
    time_minutes: z.number().min(1, { message: "Time limit must be at least 1 minute" }).max(180, { message: "Time limit cannot exceed 3 hours" }),
    test_cases: z.array(z.object({
      input: z.string().nonempty({ message: "Test case input is required" }),
      expected_output: z.string().nonempty({ message: "Test case expected output is required" })
    })).min(1, { message: "At least one test case is required" })
  })).optional(),
  mcq_questions: z.array(z.object({
    title: z.string().optional(),
    type: z.enum(["single", "multiple", "true_false"]).optional(),
    category: z.enum(["technical", "aptitude"]).optional(),
    time_seconds: z.number().min(30).max(180).optional(),
    options: z.array(z.string()).optional(),
    correct_options: z.array(z.number()).optional()
  })).optional(),
  mcq_timing_mode: z.enum(['per_question', 'whole_test']).default('per_question'),
  quiz_time_minutes: z.number().min(15, { message: "Quiz time must be at least 15 minutes" }).max(120, { message: "Quiz time cannot exceed 2 hours" }).nullable()
}).refine((data) => {
  // If MCQ is required and timing mode is whole_test, quiz_time_minutes is required
  if (data.requires_mcq && data.mcq_timing_mode === 'whole_test') {
    return data.quiz_time_minutes !== null;
  }
  return true;
}, {
  message: "Please set the total quiz time when using whole test timing mode",
  path: ["quiz_time_minutes"]
}).refine((data) => {
  // If MCQ is required and timing mode is per_question, each question must have time_seconds
  if (data.requires_mcq && data.mcq_timing_mode === 'per_question' && data.mcq_questions) {
    return data.mcq_questions.every(q => q.time_seconds !== undefined && q.time_seconds !== null);
  }
  return true;
}, {
  message: "Each question must have a time limit when using per question timing mode",
  path: ["mcq_questions"]
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const saveMcqQuestions = async (jobId: number, questions: any[], jobData: JobData) => {
  try {
    // First update the job with timing information
    await jobAPI.updateJob(jobId.toString(), {
      ...jobData,
      mcq_timing_mode: jobData.mcq_timing_mode,
      quiz_time_minutes: jobData.mcq_timing_mode === 'whole_test' ? jobData.quiz_time_minutes : null
    });

    for (const question of questions) {
      // Create a default empty image file
      const emptyImage = new File([], 'empty.png', { type: 'image/png' });

      // Create form data for the request
      const formData = new FormData();
      formData.append('description', question.title);
      formData.append('job_id', jobId.toString());
      formData.append('type', question.type);
      formData.append('category', question.category);
      
      // Always send time_seconds, but set it based on timing mode
      if (jobData.mcq_timing_mode === 'whole_test') {
        // For whole test mode, set a default value that won't be used
        formData.append('time_seconds', '60');
      } else {
        // For per_question mode, use the question's time_seconds
        formData.append('time_seconds', (question.time_seconds || 60).toString());
      }
      
      formData.append('image', emptyImage);

      // Create the quiz question
      const questionResponse = await api.post('/quiz-question', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
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
  } catch (error: any) {
    console.error('Error saving MCQ questions:', error);
    if (error.response?.data?.detail) {
      throw new Error(Array.isArray(error.response.data.detail) 
        ? error.response.data.detail.map((err: any) => err.msg).join(', ')
        : error.response.data.detail);
    }
    throw error;
  }
};

const NewJob = () => {
  const navigate = useNavigate();
  const { recruiter, setRecruiter } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDsa, setIsSavingDsa] = useState(false);
  const [activeTab, setActiveTab] = useState("job-details");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobData, setJobData] = useState<JobData>(() => {
    // Try to load saved job data from localStorage
    const savedJobData = localStorage.getItem('draftJobData');
    if (savedJobData) {
      try {
        const parsed = JSON.parse(savedJobData);
        return {
          ...parsed,
          createdAt: parsed.createdAt || new Date().toISOString(),
          mcq_timing_mode: parsed.mcq_timing_mode || 'per_question',
          quiz_time_minutes: parsed.mcq_timing_mode === 'whole_test' ? (parsed.quiz_time_minutes || 30) : null,
          company_id: parsed.company_id || 0,
          updated_at: parsed.updated_at || new Date().toISOString()
        };
      } catch (e) {
        console.error('Error parsing saved job data:', e);
      }
    }
    // Return default state if no saved data
    return {
      id: 0,
      title: "",
      description: "",
      department: "",
      city: "",
      location: "",
      type: "full-time",
      min_experience: 0,
      max_experience: 0,
      duration_months: 12,
      key_qualification: "bachelors",
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
      mcq_questions: [],
      mcq_timing_mode: 'per_question',
      quiz_time_minutes: null,
      company_id: 0,
      updated_at: new Date().toISOString()
    };
  });
  const { addNotification } = useNotifications();
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [cityPopupOpen, setCityPopupOpen] = useState(false);

  // Fetch recruiter data when component mounts
  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const recruiterData = await recruiterAPI.verifyLogin();
        if (setRecruiter && recruiter) {
          setRecruiter({
            ...recruiter,
            ...recruiterData.data
          });
        }
      } catch (error) {
        console.error("Failed to fetch recruiter details:", error);
      }
    };

    fetchRecruiterData();
  }, []);

  // Save job data to localStorage whenever it changes
  useEffect(() => {
    if (jobData.id) { // Only save if we have a job ID (after initial save)
      localStorage.setItem('draftJobData', JSON.stringify(jobData));
    }
  }, [jobData]);

  // Clear saved job data when component unmounts or job is created
  useEffect(() => {
    return () => {
      localStorage.removeItem('draftJobData');
    };
  }, []);

  // Fetch cities when search term changes
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get(`/city?keyword=${encodeURIComponent(citySearchTerm)}`);
        setCities(response.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error('Failed to fetch cities');
        setCities([]);
      }
    };

    if (citySearchTerm) {
      fetchCities();
    }
  }, [citySearchTerm]);

  // Add effect to handle timing mode changes
  useEffect(() => {
    if (jobData.mcq_timing_mode === 'whole_test' && !jobData.quiz_time_minutes) {
      setJobData(prev => ({
        ...prev,
        quiz_time_minutes: 30 // Default to 30 minutes when switching to whole_test mode
      }));
    } else if (jobData.mcq_timing_mode === 'per_question') {
      setJobData(prev => ({
        ...prev,
        quiz_time_minutes: null // Clear quiz_time_minutes when switching to per_question mode
      }));
    }
  }, [jobData.mcq_timing_mode]);

  interface MCQQuestion {
    title: string;
    type: "single" | "multiple" | "true_false";
    category: "technical" | "aptitude";
    time_seconds?: number;
    options: string[];
    correct_options: number[];
  }

  interface TestCase {
    input: string;
    expected_output: string;
  }

  interface DSAQuestion {
    title: string;
    description: string;
    difficulty: string;
    time_minutes: number;
    test_cases: TestCase[];
  }

  interface JobData {
    id: number;
    title: string;
    description: string;
    department: string;
    city: string;
    location: string;
    type: string;
    min_experience: number;
    max_experience: number;
    duration_months: number;
    key_qualification: string;
    salary_min: number | null;
    salary_max: number | null;
    currency: string;
    show_salary: boolean;
    requirements: string;
    benefits: string;
    status: string;
    createdAt: string;
    requires_dsa: boolean;
    requires_mcq: boolean;
    dsa_questions: DSAQuestion[];
    mcq_questions: MCQQuestion[];
    mcq_timing_mode: 'per_question' | 'whole_test';
    quiz_time_minutes: number | null;
    company_id: number;
    updated_at: string;
  }

  const validateField = (field: keyof JobFormValues, value: any) => {
    try {
      const validationSchema = z.object({
        [field]: z.any()
      });
      validationSchema.parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: '' }));
    } catch (error: any) {
      setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
    }
  };

  const handleChange = (field: keyof JobFormValues, value: any) => {
    setJobData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all required fields
      const validationResult = jobFormSchema.safeParse(jobData);
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        const errorMessages: string[] = [];
        
        validationResult.error.errors.forEach(error => {
          const fieldName = error.path[0];
          newErrors[fieldName] = error.message;
          
          // Create user-friendly field names
          const fieldDisplayNames: Record<string, string> = {
            title: "Job Title",
            department: "Department",
            city: "City",
            location: "Location Type",
            type: "Job Type",
            min_experience: "Minimum Experience",
            max_experience: "Maximum Experience",
            duration_months: "Job Duration",
            key_qualification: "Required Qualification",
            description: "Job Description",
            requirements: "Job Requirements",
            benefits: "Benefits",
            currency: "Currency",
            mcq_timing_mode: "MCQ Timing Mode",
            quiz_time_minutes: "Total Quiz Time",
            dsa_questions: "DSA Questions",
            mcq_questions: "MCQ Questions"
          };

          const displayName = fieldDisplayNames[fieldName] || fieldName;
          errorMessages.push(`${displayName}: ${error.message}`);
        });

        setErrors(newErrors);
        
        // Show all validation errors in a toast
        toast.error(
          <div className="space-y-2">
            <p className="font-semibold">Please fix the following fields:</p>
            <ul className="list-disc pl-4">
              {errorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        );

        // Scroll to the first error field
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        setIsSubmitting(false);
        return;
      }

      // Prepare job data based on timing mode
      const jobDataToSubmit = {
        ...jobData,
        status: "active",
        mcq_timing_mode: jobData.mcq_timing_mode || 'per_question',
        // Only include quiz_time_minutes if in whole_test mode
        quiz_time_minutes: jobData.mcq_timing_mode === 'whole_test' ? jobData.quiz_time_minutes : null,
        // Update MCQ questions based on timing mode
        mcq_questions: jobData.mcq_questions?.map(q => ({
          ...q,
          time_seconds: jobData.mcq_timing_mode === 'per_question' ? q.time_seconds : undefined
        }))
      };

      // Always update the existing draft job
      if (!jobData.id) {
        throw new Error("Please save job details first");
      }
      const response = await jobAPI.updateJob(jobData.id.toString(), jobDataToSubmit);

      if (response.status >= 200 && response.status < 300) {
        // If MCQ questions are enabled, save them
        if (jobData.requires_mcq && jobData.mcq_questions && jobData.mcq_questions.length > 0) {
          // Update the job with MCQ questions and timing information
          const updatedJobData = {
            ...jobDataToSubmit,
            id: response.data.id,
            mcq_timing_mode: jobData.mcq_timing_mode,
            quiz_time_minutes: jobData.mcq_timing_mode === 'whole_test' ? jobData.quiz_time_minutes : null
          };
          
          // First update the job with timing information
          await jobAPI.updateJob(response.data.id.toString(), updatedJobData);
          
          // Then save the MCQ questions
          await saveMcqQuestions(response.data.id, jobData.mcq_questions, updatedJobData);
        }

        addNotification({
          type: 'job',
          title: 'New Job Created',
          message: `Your job posting "${jobData.title}" is now live.${jobData.requires_dsa ? ' DSA questions have been added.' : ''
            }${jobData.requires_mcq ? ' MCQ questions have been added.' : ''}`
        });
        toast.success("Job created successfully");
        // Clear saved job data after successful creation
        localStorage.removeItem('draftJobData');
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
          time_minutes: 30, // Default to 30 minutes
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

  const handleTestCaseUpdate = (questionIndex: number, testCaseIndex: number, field: keyof TestCase, value: string) => {
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
      category: "technical",
      time_seconds: jobData.mcq_timing_mode === 'per_question' ? 60 : undefined,
      options: ["", "", "", ""],
      correct_options: [0]
    };

    setJobData(prev => ({
      ...prev,
      mcq_questions: prev.mcq_questions ? [...prev.mcq_questions, newQuestion] : [newQuestion]
    }));
  };

  const handleMcqQuestionUpdate = (index: number, field: string, value: any) => {
    setJobData(prev => {
      const updatedQuestions = [...(prev.mcq_questions || [])];
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
      } else if (field === "category") {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          category: value
        };
      } else if (field === "time_seconds" && prev.mcq_timing_mode === 'per_question') {
        // Only update time_seconds if in per_question mode
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          time_seconds: value
        };
      } else {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: value
        };
      }
      return {
        ...prev,
        mcq_questions: updatedQuestions
      };
    });
  };

  const handleSaveMcqQuestions = async () => {
    if (!jobData.id) {
      toast.error("Please save job details first");
      return;
    }

    setIsSavingMcq(true);
    try {
      if (!jobData.mcq_questions || jobData.mcq_questions.length === 0) {
        toast.error("Please add at least one MCQ question");
        setIsSavingMcq(false);
        return;
      }

      // Validate MCQ questions
      const mcqQuestionSchema = z.object({
        title: z.string().nonempty({ message: "Question title is required" }),
        type: z.enum(["single", "multiple", "true_false"]),
        category: z.enum(["technical", "aptitude"]),
        time_seconds: z.number().min(30).max(180).optional(),
        options: z.array(z.string().nonempty({ message: "Option text is required" })),
        correct_options: z.array(z.number())
      });

      const validationSchema = z.object({
        mcq_questions: z.array(mcqQuestionSchema)
      });

      const validationResult = validationSchema.safeParse({ mcq_questions: jobData.mcq_questions });
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === 'string') {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
        toast.error("Please fill in all required fields for MCQ questions");
        setIsSavingMcq(false);
        return;
      }

      // Update job with MCQ questions
      const response = await jobAPI.updateJob(jobData.id.toString(), {
        ...jobData,
        mcq_questions: jobData.mcq_questions,
        mcq_timing_mode: jobData.mcq_timing_mode,
        quiz_time_minutes: jobData.mcq_timing_mode === 'whole_test' ? jobData.quiz_time_minutes : null
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("MCQ questions saved successfully");
      } else {
        throw new Error("Failed to save MCQ questions");
      }
    } catch (error: any) {
      console.error("Error saving MCQ questions:", error);
      let errorMessage = "Failed to save MCQ questions";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSavingMcq(false);
    }
  };

  // Add state for MCQ saving
  const [isSavingMcq, setIsSavingMcq] = useState(false);

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
                  value={question.category}
                  onValueChange={(value) => handleMcqQuestionUpdate(index, "category", value)}
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
            {jobData.mcq_timing_mode === 'per_question' && (
              <div className="space-y-2">
                <Label>Time Limit (seconds)</Label>
                <Select
                  value={question.time_seconds?.toString() || "30"}
                  onValueChange={(value) =>
                    handleMcqQuestionUpdate(index, "time_seconds", parseInt(value))
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
        {question.type !== "true_false" && question.options.length < 4 && (
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

  const handleSaveJobDetails = async () => {
    setIsSaving(true);
    try {
      const jobDetailsFields = [
        'title', 'department', 'city', 'location', 'type',
        'min_experience', 'max_experience', 'duration_months',
        'key_qualification', 'salary_min', 'salary_max',
        'show_salary', 'description', 'requirements', 'benefits',
        'mcq_timing_mode', 'quiz_time_minutes' // Add timing fields
      ];

      const validationSchema = z.object(
        Object.fromEntries(
          jobDetailsFields.map(field => [field, z.any()])
        )
      );

      const validationResult = validationSchema.safeParse(jobData);

      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === 'string') {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
        
        toast.error("Please fill in all required fields");
        
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        setIsSaving(false);
        return;
      }

      // Create job with job details including timing information
      const response = await jobAPI.createJob({
        ...jobData,
        status: 'draft',
        mcq_timing_mode: jobData.mcq_timing_mode || 'per_question',
        quiz_time_minutes: jobData.mcq_timing_mode === 'whole_test' ? jobData.quiz_time_minutes : null
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("Job details saved successfully");
        // Update the job ID in the state
        setJobData(prev => ({ 
          ...prev, 
          id: response.data.id,
          mcq_timing_mode: prev.mcq_timing_mode || 'per_question',
          quiz_time_minutes: prev.mcq_timing_mode === 'whole_test' ? prev.quiz_time_minutes : null
        }));
      } else {
        throw new Error("Failed to save job details");
      }
    } catch (error: any) {
      console.error("Error saving job details:", error);
      let errorMessage = "Failed to save job details";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDsaQuestions = async () => {
    if (!jobData.id) {
      toast.error("Please save job details first");
      return;
    }

    setIsSavingDsa(true);
    try {
      if (!jobData.dsa_questions || jobData.dsa_questions.length === 0) {
        toast.error("Please add at least one DSA question");
        setIsSavingDsa(false);
        return;
      }

      const dsaQuestionSchema = z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        difficulty: z.string().nonempty(),
        time_minutes: z.number().min(1).max(180),
        test_cases: z.array(z.object({
          input: z.string().nonempty(),
          expected_output: z.string().nonempty()
        })).min(1)
      });

      const validationSchema = z.object({
        dsa_questions: z.array(dsaQuestionSchema)
      });

      const validationResult = validationSchema.safeParse({ dsa_questions: jobData.dsa_questions });
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === 'string') {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
        toast.error("Please fill in all required fields for DSA questions");
        setIsSavingDsa(false);
        return;
      }

      // Update job with DSA questions
      const response = await jobAPI.updateJob(jobData.id.toString(), {
        ...jobData,
        dsa_questions: jobData.dsa_questions
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("DSA questions saved successfully");
      } else {
        throw new Error("Failed to save DSA questions");
      }
    } catch (error: any) {
      console.error("Error saving DSA questions:", error);
      let errorMessage = "Failed to save DSA questions";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSavingDsa(false);
    }
  };

  const handleExcelImport = (importedQuestions: any[]) => {
    // Prevent form submission
    event?.preventDefault();
    event?.stopPropagation();
    
    setJobData(prev => ({
      ...prev,
      mcq_questions: [
        ...(prev.mcq_questions || []),
        ...importedQuestions.map(q => ({
          title: q.title,
          type: q.type,
          category: q.category,
          time_seconds: q.time_seconds,
          options: q.options,
          correct_options: q.correct_options
        }))
      ]
    }));
  };

  interface Currency {
    value: string;
    label: string;
  }

  // State for available currencies
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([
    { value: 'USD', label: '$ USD' },
    { value: 'INR', label: '₹ INR' }
  ]);

  // Get currency based on country
  const getCountryCurrency = async (countryName: string) => {
    try {
      const response = await api.get(`country?keyword=${encodeURIComponent(countryName)}`);
      const data = response.data;
      
      // Find the exact country match
      const country = data.find((c: any) => c.name.toLowerCase() === countryName.toLowerCase());
      
      if (!country) {
        return 'USD';
      }
      
      return country.currency || 'USD';
    } catch (error) {
      return 'USD';
    }
  };

  // Get available currencies
  const getAvailableCurrencies = async (): Promise<Currency[]> => {
    const currencies: Currency[] = [
      { value: 'USD', label: '$ USD' },
      { value: 'INR', label: '₹ INR' }
    ];

    try {
      // Add user's country currency if it's different from USD and INR
      if (recruiter?.country) {
        const userCountryCurrency = await getCountryCurrency(recruiter.country);
        
        if (userCountryCurrency && userCountryCurrency !== 'USD' && userCountryCurrency !== 'INR') {
          const currencySymbols: Record<string, string> = {
            'GBP': '£',
            'EUR': '€',
            'CNY': '¥',
            'JPY': '¥',
            'AUD': 'A$',
            'CAD': 'C$',
            'SGD': 'S$',
            'CHF': 'Fr',
            'AED': 'د.إ',
            'SAR': '﷼'
          };
          const symbol = currencySymbols[userCountryCurrency] || '';
          currencies.push({ value: userCountryCurrency, label: `${symbol} ${userCountryCurrency}` });
        }
      }
    } catch (error) {
      // Handle error silently
    }

    return currencies;
  };

  // Fetch available currencies when component mounts or recruiter data changes
  useEffect(() => {
    const fetchCurrencies = async () => {
      const currencies = await getAvailableCurrencies();
      setAvailableCurrencies(currencies);
    };
    fetchCurrencies();
  }, [recruiter?.country]);

  // Add logger for currency selection
  const handleCurrencyChange = (value: string) => {
    handleChange("currency", value);
  };

  // Update the timing mode change handler
  const handleTimingModeChange = (value: 'per_question' | 'whole_test') => {
    setJobData(prev => ({
      ...prev,
      mcq_timing_mode: value,
      // When switching to whole_test, set default time to 60 minutes (1 hour)
      quiz_time_minutes: value === 'whole_test' ? 60 : null,
      // Clear individual question times when switching to whole_test
      mcq_questions: prev.mcq_questions?.map(q => ({
        ...q,
        time_seconds: value === 'per_question' ? (q.time_seconds || 60) : undefined
      }))
    }));
  };

  // Update the quiz time change handler
  const handleQuizTimeChange = (value: string) => {
    const minutes = parseInt(value);
    setJobData(prev => ({
      ...prev,
      quiz_time_minutes: minutes
    }));
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
                    <Label htmlFor="job-title">
                      Job Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="job-title"
                      placeholder="e.g. Senior Software Engineer"
                      value={jobData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => handleChange("department", val)}
                      defaultValue={jobData.department}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
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
                    {errors.department && (
                      <p className="text-sm text-destructive">{errors.department}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Job Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => handleChange("type", val)}
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
                    {errors.type && (
                      <p className="text-sm text-destructive">{errors.type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Location Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => handleChange("location", val)}
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
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Popover open={cityPopupOpen} onOpenChange={setCityPopupOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !jobData.city && "text-muted-foreground"
                          )}
                        >
                          {jobData.city || "Select a city"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search city..."
                            value={citySearchTerm}
                            onValueChange={setCitySearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-auto">
                              {cities.map((city) => (
                                <CommandItem
                                  key={city.id}
                                  value={city.name}
                                  onSelect={() => {
                                    handleChange("city", city.name);
                                    setCityPopupOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      jobData.city === city.name ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {city.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
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
                    <Label>
                      Minimum Experience (Years) <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => handleChange("min_experience", Number(val))}
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
                    {errors.min_experience && (
                      <p className="text-sm text-destructive">{errors.min_experience}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Maximum Experience (Years) <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => handleChange("max_experience", Number(val))}
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
                    {errors.max_experience && (
                      <p className="text-sm text-destructive">{errors.max_experience}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Required Qualification <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={jobData.key_qualification}
                      onValueChange={(value) => handleChange("key_qualification", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.key_qualification && (
                      <p className="text-sm text-destructive">{errors.key_qualification}</p>
                    )}
                  </div>

                  {(jobData.type === "internship" || jobData.type === "contract" || jobData.type === "temporary") && (
                    <div className="space-y-2">
                      <Label>
                        Job Duration (Months) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="duration_months"
                        type="number"
                        min="1"
                        value={jobData.duration_months}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            handleChange("duration_months", value === '' ? 0 : parseInt(value));
                          }
                        }}
                      />
                      {errors.duration_months && (
                        <p className="text-sm text-destructive">{errors.duration_months}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>
                      Salary Range <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={handleCurrencyChange}
                        value={jobData.currency}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCurrencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder="Min salary"
                          value={jobData.salary_min || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow non-negative integers
                            if (value === '' || /^\d+$/.test(value)) {
                              handleChange("salary_min", value === '' ? null : Number(value));
                            }
                          }}
                        />
                        <Input
                          type="number"
                          min="0"
                          placeholder="Max salary"
                          value={jobData.salary_max || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow non-negative integers
                            if (value === '' || /^\d+$/.test(value)) {
                              handleChange("salary_max", value === '' ? null : Number(value));
                            }
                          }}
                        />
                      </div>
                    </div>
                    {(errors.salary_min || errors.salary_max || errors.currency) && (
                      <p className="text-sm text-destructive">
                        {errors.salary_min || errors.salary_max || errors.currency}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={jobData.show_salary}
                      onCheckedChange={(checked) =>
                        handleChange("show_salary", checked)
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
                      <Label>
                        Job Description <span className="text-destructive">*</span>
                      </Label>
                      <AIGeneratePopup
                        title="Generate Description"
                        fieldLabel="Description"
                        jobTitle={jobData.title}
                        department={jobData.department}
                        location={jobData.location}
                        jobType={jobData.type}
                        keyQualification={jobData.key_qualification}
                        minExperience={jobData.min_experience.toString()}
                        maxExperience={jobData.max_experience.toString()}
                        onGenerated={(content) => handleChange("description", content)}
                      />
                    </div>
                    <Textarea
                      id="description"
                      className="min-h-[200px]"
                      placeholder="Describe the role, responsibilities, and expectations..."
                      value={jobData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>
                        Requirements <span className="text-destructive">*</span>
                      </Label>
                      <AIGeneratePopup
                        title="Generate Requirements"
                        fieldLabel="Requirements"
                        jobTitle={jobData.title}
                        department={jobData.department}
                        location={jobData.location}
                        jobType={jobData.type}
                        keyQualification={jobData.key_qualification}
                        minExperience={jobData.min_experience.toString()}
                        maxExperience={jobData.max_experience.toString()}
                        onGenerated={(content) => handleChange("requirements", content)}
                      />
                    </div>
                    <Textarea
                      id="requirements"
                      className="min-h-[200px]"
                      placeholder="List the required skills, qualifications, and experience..."
                      value={jobData.requirements}
                      onChange={(e) => handleChange("requirements", e.target.value)}
                    />
                    {errors.requirements && (
                      <p className="text-sm text-destructive">{errors.requirements}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Benefits</Label>
                    <Textarea
                      id="benefits"
                      className="min-h-[150px]"
                      placeholder="List the benefits and perks offered..."
                      value={jobData.benefits}
                      onChange={(e) => handleChange("benefits", e.target.value)}
                    />
                    {errors.benefits && (
                      <p className="text-sm text-destructive">{errors.benefits}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={jobData.requires_dsa}
                      onCheckedChange={(checked) =>
                        handleChange("requires_dsa", checked)
                      }
                    />
                    <Label>Requires DSA Assessment</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires_mcq"
                      checked={jobData.requires_mcq}
                      onCheckedChange={(checked) =>
                        handleChange("requires_mcq", checked)
                      }
                    />
                    <Label>Requires MCQ Assessment</Label>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="button"
                      onClick={handleSaveJobDetails}
                      disabled={isSaving}
                      variant="outline"
                    >
                      {isSaving ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Job Details
                        </>
                      )}
                    </Button>
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
                      {jobData.dsa_questions?.map((question: DSAQuestion, questionIndex: number) => (
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

                              <div className="space-y-2">
                                <Label>Time Limit (minutes)</Label>
                                <Select
                                  value={question.time_minutes.toString()}
                                  onValueChange={(value) =>
                                    handleDsaQuestionUpdate(questionIndex, "time_minutes", parseInt(value))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select time limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">60 minutes</SelectItem>
                                    <SelectItem value="90">90 minutes</SelectItem>
                                    <SelectItem value="120">120 minutes</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Question Description</Label>
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
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestCaseAdd(questionIndex)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Test Case
                                </Button>
                              </div>

                              {question.test_cases.map((testCase: TestCase, testCaseIndex: number) => (
                                <div key={testCaseIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Input</Label>
                                    <Textarea
                                      value={testCase.input}
                                      onChange={(e) =>
                                        handleTestCaseUpdate(questionIndex, testCaseIndex, "input", e.target.value)
                                      }
                                      placeholder="Input"
                                      className="min-h-[100px] font-mono whitespace-pre-wrap"
                                      rows={4}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Expected Output</Label>
                                    <Textarea
                                      value={testCase.expected_output}
                                      onChange={(e) =>
                                        handleTestCaseUpdate(questionIndex, testCaseIndex, "expected_output", e.target.value)
                                      }
                                      placeholder="Expected Output"
                                      className="min-h-[100px] font-mono whitespace-pre-wrap"
                                      rows={4}
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleTestCaseDelete(questionIndex, testCaseIndex)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updatedQuestions = [...(jobData.dsa_questions || [])];
                                  updatedQuestions.splice(questionIndex, 1);
                                  setJobData({ ...jobData, dsa_questions: updatedQuestions });
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Question
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      <div className="flex justify-end mt-6">
                        <Button
                          type="button"
                          onClick={handleDsaQuestionAdd}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add DSA Question
                        </Button>
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button
                          type="button"
                          onClick={handleSaveDsaQuestions}
                          disabled={isSavingDsa}
                          variant="outline"
                        >
                          {isSavingDsa ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Saving DSA Questions...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save DSA Questions
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mcq-questions">
              <Card>
                <CardHeader>
                  <CardTitle>MCQ Questions</CardTitle>
                  <CardDescription>
                    Add multiple-choice questions for the assessment
                  </CardDescription>
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
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Timing Mode</Label>
                          <Select
                            value={jobData.mcq_timing_mode || 'per_question'}
                            onValueChange={handleTimingModeChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timing mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="per_question">Per Question Timing</SelectItem>
                              <SelectItem value="whole_test">Whole Test Timing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {jobData.mcq_timing_mode === 'whole_test' && (
                          <div className="space-y-2">
                            <Label>Total Test Time (minutes)</Label>
                            <Select
                              value={jobData.quiz_time_minutes?.toString() || "60"}
                              onValueChange={handleQuizTimeChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select total time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1.5 hours</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <h3 className="text-lg font-medium">MCQ Questions</h3>
                            <p className="text-sm text-muted-foreground">
                              Total Questions: {jobData.mcq_questions?.length || 0}
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <ExcelImport onImport={handleExcelImport} />
                            <Button type="button" onClick={handleMcqQuestionAdd}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Question
                            </Button>
                          </div>
                        </div>
                        {jobData.mcq_questions?.map((question, index) => (
                          renderMcqQuestion(question, index)
                        ))}
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button
                          type="button"
                          onClick={handleSaveMcqQuestions}
                          disabled={isSavingMcq}
                          variant="outline"
                        >
                          {isSavingMcq ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Saving MCQ Questions...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save MCQ Questions
                            </>
                          )}
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

