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
import { Save, Trash2, Plus, ArrowRight } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import AIGeneratePopup from "@/components/jobs/AIGeneratePopup";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import QuestionEditor from "@/pages/DsaLab/QuestionEditor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { jobAPI } from "@/services/jobApi";
import {
  DSAQuestion,
  InterviewQuestion,
  JobData,
  MCQuestion,
  TestCase,
} from "@/types/job";
import { autoCompletionApi } from "@/services/autoCompletionApi";
import { dsaAPI } from "@/services/dsaApi";
import { quizAPI } from "@/services/quizApi";

const NewJob = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobData, setJobData] = useState<JobData>({
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
    mcq_timing_mode: "whole_test",
  });
  const [newDSAQuestion, setNewDSAQuestion] = useState<DSAQuestion>();
  const [newTestCase, setNewTestCase] = useState<TestCase>();
  const [newQuizQuestion, setNewQuizQuestion] = useState<MCQuestion>({
    time_seconds: 60,
    type: "single",
  });
  const [quizImageFile, setQuizImageFile] = useState<File>();
  const [newQuizOptions, setNewQuizOptions] = useState<
    {
      label?: string;
      correct?: boolean;
    }[]
  >([]);
  const [newCustomInterviewQuestion, setNewCustomInterviewQuestion] =
    useState<DSAQuestion>();

  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [cityPopupOpen, setCityPopupOpen] = useState(false);
  const [currencySearchTerm, setCurrencySearchTerm] = useState("");
  const [currencyPopupOpen, setCurrencyPopupOpen] = useState(false);

  const jobFormSchema = z.object({
    title: z
      .string()
      .min(3, { message: "Job title must be at least 3 characters" })
      .nonempty({ message: "Job title is required" }),
    department: z.string().nonempty({ message: "Please select a department" }),
    city: z.string().nonempty({ message: "Please select a city" }),
    location: z.string().nonempty({ message: "Please select a location type" }),
    type: z.string().nonempty({ message: "Please select a job type" }),
    min_experience: z
      .number()
      .min(0, { message: "Minimum experience must be 0 or greater" })
      .int({ message: "Experience must be a whole number" }),
    max_experience: z
      .number()
      .min(0, { message: "Maximum experience must be 0 or greater" })
      .int({ message: "Experience must be a whole number" }),
    duration_months: z
      .number()
      .min(1, { message: "Duration must be at least 1 month" })
      .int({ message: "Duration must be a whole number" })
      .optional(),
    key_qualification: z
      .string()
      .nonempty({ message: "Please select a key qualification" }),
    salary_min: z
      .number()
      .min(0, { message: "Minimum salary must be 0 or greater" })
      .int({ message: "Salary must be a whole number" })
      .nullable()
      .optional(),
    salary_max: z
      .number()
      .min(0, { message: "Maximum salary must be 0 or greater" })
      .int({ message: "Salary must be a whole number" })
      .nullable()
      .optional(),
    show_salary: z.boolean().default(false),
    currency: z.string().nullable().optional(),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters" })
      .nonempty({ message: "Job description is required" }),
    requirements: z
      .string()
      .min(10, { message: "Requirements must be at least 10 characters" })
      .nonempty({ message: "Job requirements are required" }),
    benefits: z.string().optional(),
    status: z.string().default("active"),
  });

  const customInterviewQuestionFormSchema = z.object({
    question: z.string().nonempty({ message: "Question is required" }),
    question_type: z.enum([
      "technical",
      "behavioral",
      "problem_solving",
      "custom",
    ]),
    order_number: z.number(),
  });

  const dsaQuestionFormSchema = z.object({
    title: z.string().nonempty({ message: "DSA question title is required" }),
    description: z
      .string()
      .nonempty({ message: "DSA question description is required" }),
    difficulty: z
      .string()
      .nonempty({ message: "Please select difficulty level" }),
    time_minutes: z
      .number()
      .min(1, { message: "Time limit must be at least 1 minute" })
      .max(180, { message: "Time limit cannot exceed 3 hours" }),
    test_cases: z
      .array(
        z.object({
          input: z
            .string()
            .nonempty({ message: "Test case input is required" }),
          expected_output: z.string().nonempty({
            message: "Test case expected output is required",
          }),
        })
      )
      .min(1, { message: "At least one test case is required" }),
  });

  const mcqQuestionFormSchema = z.object({
    title: z.string().optional(),
    type: z.enum(["single", "multiple", "true_false"]).optional(),
    category: z.enum(["technical", "aptitude"]).optional(),
    time_seconds: z.number().min(30).max(180).optional(),
    options: z
      .array(z.object({ label: z.string(), correct: z.boolean() }))
      .optional(),
  });

  const saveMcqQuestions = async (
    jobId: number,
    questions: any[],
    jobData: JobData
  ) => {
    try {
      // First update the job with timing information
      // const jobUpdateData: Partial<JobData> = {
      //   ...jobData,
      //   mcq_timing_mode: jobData.mcq_timing_mode || "per_question",
      //   // Only include quiz_time_minutes if in whole_test mode
      //   quiz_time_minutes:
      //     jobData.mcq_timing_mode === "whole_test"
      //       ? jobData.quiz_time_minutes
      //       : null,
      // };

      // Remove fields that should not be sent in the update
      // const { status, mcq_timing_mode, quiz_time_minutes, ...updateData } =
      //   jobUpdateData;

      // await jobAPI.updateJob(jobId.toString(), updateData);

      for (const question of questions) {
        // Create form data for the request
        const formData = new FormData();
        formData.append("description", question.title);
        formData.append("job_id", jobId.toString());
        formData.append("type", question.type);
        formData.append("category", question.category);

        // Handle time_seconds based on timing mode
        // if (jobData.mcq_timing_mode === "whole_test") {
        //   // For whole test mode, don't send time_seconds as it's not used
        //   formData.append("time_seconds", "0");
        // } else {
        //   // For per_question mode, use the question's time_seconds or default to 60
        //   formData.append(
        //     "time_seconds",
        //     (question.time_seconds || 60).toString()
        //   );
        // }

        // Only append image if the question has an image
        if (question.hasImage && question.image) {
          formData.append("image", question.image);
        }

        // Create the quiz question
        // const questionResponse = await api.post("/quiz-question", formData, {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`,
        //     "Content-Type": "multipart/form-data",
        //   },
        // });

        // const questionId = questionResponse.data.id;

        // Handle options based on question type
        if (question.type === "true_false") {
          // For true/false questions, create only two options
          // await api.post(
          //   "/quiz-option",
          //   {
          //     label: "True",
          //     correct: question.correct_options[0] === 0,
          //     question_id: questionId,
          //   },
          //   {
          //     headers: {
          //       Authorization: `Bearer ${localStorage.getItem("token")}`,
          //     },
          //   }
          // );
          //   await api.post(
          //     "/quiz-option",
          //     {
          //       label: "False",
          //       correct: question.correct_options[0] === 1,
          //       question_id: questionId,
          //     },
          //     {
          //       headers: {
          //         Authorization: `Bearer ${localStorage.getItem("token")}`,
          //       },
          //     }
          //   );
          // } else {
          //   // For single and multiple choice questions, create all options
          //   for (let i = 0; i < question.options.length; i++) {
          //     const option = question.options[i];
          //     let isCorrect = false;
          //     if (question.type === "single") {
          //       isCorrect = question.correct_options[0] === i;
          //     } else if (question.type === "multiple") {
          //       isCorrect = question.correct_options.includes(i);
          //     }
          //     await api.post(
          //       "/quiz-option",
          //       {
          //         label: option,
          //         correct: isCorrect,
          //         question_id: questionId,
          //       },
          //       {
          //         headers: {
          //           Authorization: `Bearer ${localStorage.getItem("token")}`,
          //         },
          //       }
          //     );
          //   }
        }
      }
    } catch (error: any) {
      console.error("Error saving MCQ questions:", error);
      if (error.response?.data?.detail) {
        throw new Error(
          Array.isArray(error.response.data.detail)
            ? error.response.data.detail.map((err: any) => err.msg).join(", ")
            : error.response.data.detail
        );
      }
      throw error;
    }
  };

  useEffect(() => {
    if (citySearchTerm) {
      autoCompletionApi
        .fetchCities(citySearchTerm)
        .then((data) => setCities(data))
        .catch((_) => toast.error("Error while fetching cities"));
    }
  }, [citySearchTerm]);

  // Add effect to handle timing mode changes
  // useEffect(() => {
  //   if (
  //     jobData.mcq_timing_mode === "whole_test" &&
  //     !jobData.quiz_time_minutes
  //   ) {
  //     setJobData((prev) => ({
  //       ...prev,
  //       quiz_time_minutes: 30, // Default to 30 minutes when switching to whole_test mode
  //     }));
  //   } else if (jobData.mcq_timing_mode === "per_question") {
  //     setJobData((prev) => ({
  //       ...prev,
  //       quiz_time_minutes: null, // Clear quiz_time_minutes when switching to per_question mode
  //     }));
  //   }
  // }, [jobData.mcq_timing_mode]);

  const validateField = (field: keyof JobData, value: any) => {
    try {
      const validationSchema = z.object({
        [field]: z.any(),
      });
      validationSchema.parse({ [field]: value });
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }));
    }
  };

  const handleChange = (field: keyof JobData, value: any) => {
    setJobData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      const validationResult = jobFormSchema.safeParse(jobData);
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === "string") {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
        return;
      }

      // Prepare job data without MCQ questions
      // const { mcq_questions, ...jobDataWithoutMcq } = jobData;
      // const jobDataToSubmit = {
      //   ...jobDataWithoutMcq,
      //   status: "active",
      //   mcq_timing_mode: jobData.mcq_timing_mode || "per_question",
      //   // Only include quiz_time_minutes if in whole_test mode
      //   quiz_time_minutes:
      //     jobData.mcq_timing_mode === "whole_test"
      //       ? jobData.quiz_time_minutes
      //       : null,
      // };

      // Always update the existing draft job
      if (!jobData.id) {
        throw new Error("Please save job details first");
      }
      // const response = await jobAPI.updateJob(
      //   jobData.id.toString(),
      //   jobDataToSubmit
      // );

      // If there are MCQ questions, save them separately
      // if (jobData.mcq_questions && jobData.mcq_questions.length > 0) {
      //   await saveMcqQuestions(jobData.id, jobData.mcq_questions, jobData);
      // }

      toast.success("Job saved successfully!");
      navigate("/dashboard/jobs");
    } catch (error: any) {
      console.error("Error saving job:", error);
      if (error.response?.data?.detail) {
        toast.error(
          Array.isArray(error.response.data.detail)
            ? error.response.data.detail.map((err: any) => err.msg).join(", ")
            : error.response.data.detail
        );
      } else {
        toast.error(error.message || "Failed to save job");
      }
    } finally {
      // setIsSubmitting(false);
    }
  };

  // const handleGeneratedContent = (
  //   field: keyof JobFormValues,
  //   content: string
  // ) => {
  //   setJobData({ ...jobData, [field]: content });
  // };

  const handleCreateDSAQuestion = () => {
    if (!jobData.id || !newDSAQuestion) {
      return;
    }
    let validationResult = dsaQuestionFormSchema.safeParse(newDSAQuestion);
    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        const path = error.path[0];
        if (typeof path === "string") {
          newErrors[path] = error.message;
        }
      });
      setErrors(newErrors);

      toast.error("Invalid data");
      setIsSaving(false);
      return;
    }

    dsaAPI
      .createDSAQuestion(jobData.id.toString(), newDSAQuestion)
      .then((res) => {
        let dsaQuestions: DSAQuestion[] = [];
        if (jobData.dsa_questions) {
          dsaQuestions = [...jobData.dsa_questions];
        }
        dsaQuestions.push(res.data);
        setJobData({ ...jobData, dsa_questions: dsaQuestions });
        setNewDSAQuestion({
          ...newDSAQuestion,
          description: "",
          test_cases: [],
          title: "",
        });
      })
      .catch((_) => {
        toast.error("Error while adding dsa question");
      });
  };
  useEffect(() => {
    console.log(newDSAQuestion);
  }, [newDSAQuestion]);

  const handleNewDsaQuestionChange = (field: string, value: any) => {
    setNewDSAQuestion({ ...newDSAQuestion, [field]: value });
  };

  const handleNewTestCaseChange = (field: keyof TestCase, value: string) => {
    setNewTestCase({
      ...newTestCase,
      [field]: value,
    });
  };

  const handleTestCaseAdd = () => {
    if (!newTestCase) {
      return;
    }
    let test_cases: TestCase[] = [];
    if (newDSAQuestion?.test_cases) {
      test_cases = [...newDSAQuestion.test_cases];
    }
    test_cases.push(newTestCase);
    setNewDSAQuestion({ ...newDSAQuestion, test_cases });
    setNewTestCase({ input: "", expected_output: "" });
  };

  const handleTestCaseDelete = (testCaseIndex: number) => {
    if (!newDSAQuestion || !newDSAQuestion.test_cases) {
      return;
    }
    let test_cases = [...newDSAQuestion.test_cases].filter(
      (_, index) => index !== testCaseIndex
    );
    setNewDSAQuestion({ ...newDSAQuestion, test_cases });
  };

  const handleSaveMcqTimingMode = () => {
    setIsSaving(true);
    if (jobData.mcq_timing_mode == "per_question") {
      setIsSaving(false);
      setShowQuizForm(true);
      return;
    }

    if (!jobData || !jobData.id) {
      return;
    }
    jobAPI
      .updateJob(jobData.id.toString(), {
        quiz_time_minutes: jobData.quiz_time_minutes,
      })
      .then((res) => {
        setJobData({ ...jobData, ...res.data });
      })
      .catch((_) => {
        toast.error("Could not save MCQ timing mode");
      })
      .finally(() => {
        setIsSaving(false);
        setShowQuizForm(true);
      });
  };

  const handleMcqQuestionAdd = () => {
    //   const newQuestion: MCQQuestion = {
    //     title: "",
    //     type: "single",
    //     category: "technical",
    //     time_seconds: jobData.mcq_timing_mode === "per_question" ? 60 : undefined,
    //     options: ["", "", "", ""],
    //     correct_options: [0],
    //     hasImage: false,
    //     image: null,
    //     imageUrl: undefined,
    //   };
    //   setJobData((prev) => ({
    //     ...prev,
    //     mcq_questions: prev.mcq_questions
    //       ? [...prev.mcq_questions, newQuestion]
    //       : [newQuestion],
    //   }));
  };

  const handleMcqQuestionChange = (field: keyof MCQuestion, value: any) => {
    if (!newQuizQuestion) {
      return;
    }
    setNewQuizQuestion({ ...newQuizQuestion, [field]: value });
  };

  const renderCustomQuestion = (question: InterviewQuestion, index: number) => {
    return (
      <Card key={index} className="mb-4">
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`question-${index}`}>Question</Label>
              <Textarea
                id={`question-${index}`}
                value={question.question}
                // onChange={(e) =>
                //   handleCustomQuestionUpdate(index, "question", e.target.value)
                // }
                placeholder="Enter your interview question"
              />
            </div>
            <div className="grid gap-2">
              <Label>Question Type</Label>
              <Select
                value={question.question_type}
                // onValueChange={(value) =>
                //   handleCustomQuestionUpdate(index, "question_type", value)
                // }
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
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                // onClick={() => handleCustomQuestionDelete(index)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleSaveJobDetails = async () => {
    setIsSaving(true);
    try {
      const validationResult = jobFormSchema.safeParse(jobData);
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === "string") {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);

        toast.error("Invalid data");
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setIsSaving(false);
        return;
      }

      let response;
      response = await jobAPI.createJob({
        ...jobData,
      });

      if ((response.status = 200)) {
        toast.success(
          jobData.id
            ? "Job details updated successfully"
            : "Job details saved successfully"
        );
        setJobData((prev) => ({
          ...prev,
          id: response.data.id,
        }));
        setActiveTab("dsa");
      } else {
        throw new Error("Failed to save job details");
      }
    } catch (error: any) {
      let errorMessage = "Failed to save job details";

      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg)
            .join(", ");
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExcelImport = (importedQuestions: any[]) => {
    // Prevent form submission
    event?.preventDefault();
    event?.stopPropagation();

    // setJobData((prev) => ({
    //   ...prev,
    //   mcq_questions: [
    //     ...(prev.mcq_questions || []),
    //     ...importedQuestions.map((q) => ({
    //       title: q.title,
    //       type: q.type,
    //       category: q.category,
    //       time_seconds: q.time_seconds,
    //       options: q.options,
    //       correct_options: q.correct_options,
    //     })),
    //   ],
    // }));
  };

  // Add these interfaces at the top with other interfaces
  interface Currency {
    value: string;
    label: string;
    symbol: string;
    name: string;
  }

  interface LocationCurrency {
    currency: string;
    symbol: string;
    name: string;
  }

  // Update the currency symbols mapping to be more comprehensive
  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
    CNY: "¥",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    SGD: "S$",
    CHF: "Fr",
    AED: "د.إ",
    SAR: "﷼",
    BRL: "R$",
    RUB: "₽",
    ZAR: "R",
    MXN: "$",
    KRW: "₩",
    TRY: "₺",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    PLN: "zł",
    ILS: "₪",
    HKD: "HK$",
    TWD: "NT$",
    THB: "฿",
    MYR: "RM",
    PHP: "₱",
    IDR: "Rp",
    VND: "₫",
  };

  // Add state for available currencies
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([
    { value: "USD", label: "$ USD", symbol: "$", name: "US Dollar" },
    { value: "INR", label: "₹ INR", symbol: "₹", name: "Indian Rupee" },
  ]);

  // Add this function to get currency info for a location
  const getLocationCurrency = async (
    city: string,
    country: string
  ): Promise<LocationCurrency | null> => {
    try {
      // First try to get currency from city
      // const cityResponse = await api.get(
      //   `/city?keyword=${encodeURIComponent(city)}`
      // );
      // const cityData = cityResponse.data;
      // const cityMatch = cityData.find(
      //   (c: any) => c.name.toLowerCase() === city.toLowerCase()
      // );

      // if (cityMatch?.currency) {
      //   return {
      //     currency: cityMatch.currency,
      //     symbol: CURRENCY_SYMBOLS[cityMatch.currency] || cityMatch.currency,
      //     name: cityMatch.currency_name || cityMatch.currency,
      //   };
      // }

      // If no city currency, try country
      // const countryResponse = await api.get(
      //   `/country?keyword=${encodeURIComponent(country)}`
      // );
      // const countryData = countryResponse.data;
      // const countryMatch = countryData.find(
      //   (c: any) => c.name.toLowerCase() === country.toLowerCase()
      // );

      // if (countryMatch?.currency) {
      //   return {
      //     currency: countryMatch.currency,
      //     symbol:
      //       CURRENCY_SYMBOLS[countryMatch.currency] || countryMatch.currency,
      //     name: countryMatch.currency_name || countryMatch.currency,
      //   };
      // }

      return null;
    } catch (error) {
      console.error("Error fetching location currency:", error);
      return null;
    }
  };

  // Update the getAvailableCurrencies function
  const getAvailableCurrencies = async (): Promise<Currency[]> => {
    const currencies: Currency[] = [
      { value: "USD", label: "$ USD", symbol: "$", name: "US Dollar" },
      { value: "INR", label: "₹ INR", symbol: "₹", name: "Indian Rupee" },
    ];

    try {
      // Fetch all countries to get their currencies
      // const response = await api.get("/country");
      // const countries = response.data || [];

      // Create a Set to track unique currencies
      const uniqueCurrencies = new Set<string>();

      // Add location-based currency first if available
      // if (jobData.city && recruiter?.country) {
      //   const locationCurrency = await getLocationCurrency(
      //     jobData.city,
      //     recruiter.country
      //   );
      //   if (locationCurrency) {
      //     uniqueCurrencies.add(locationCurrency.currency);
      //     currencies.push({
      //       value: locationCurrency.currency,
      //       label: `${locationCurrency.symbol} ${locationCurrency.currency}`,
      //       symbol: locationCurrency.symbol,
      //       name: locationCurrency.name,
      //     });
      //   }
      // }

      // Add currencies from all countries
      // for (const country of countries) {
      //   if (country.currency && !uniqueCurrencies.has(country.currency)) {
      //     uniqueCurrencies.add(country.currency);
      //     const symbol = CURRENCY_SYMBOLS[country.currency] || country.currency;
      //     currencies.push({
      //       value: country.currency,
      //       label: `${symbol} ${country.currency}`,
      //       symbol: symbol,
      //       name: country.currency_name || country.currency,
      //     });
      //   }
      // }

      // Sort currencies alphabetically by code
      // currencies.sort((a, b) => a.value.localeCompare(b.value));
    } catch (error) {
      console.error("Error fetching available currencies:", error);
    }

    return currencies;
  };

  // Add effect to update currency when city changes
  // useEffect(() => {
  //   const updateCurrencyForLocation = async () => {
  //     if (jobData.city && recruiter?.country) {
  //       const locationCurrency = await getLocationCurrency(
  //         jobData.city,
  //         recruiter.country
  //       );
  //       if (locationCurrency) {
  //         // Update available currencies
  //         const currencies = await getAvailableCurrencies();
  //         setAvailableCurrencies(currencies);

  //         // Set the currency if it's not already set
  //         if (!jobData.currency) {
  //           handleChange("currency", locationCurrency.currency);
  //         }
  //       }
  //     }
  //   };

  //   updateCurrencyForLocation();
  // }, [jobData.city, recruiter?.country]);

  // Add logger for currency selection
  // const handleCurrencyChange = (value: string) => {
  //   handleChange("currency", value);
  // };

  // Update the timing mode change handler
  const handleTimingModeChange = (value: "per_question" | "whole_test") => {
    setJobData((prev) => ({
      ...prev,
      mcq_timing_mode: value,
      quiz_time_minutes: value === "whole_test" ? 60 : null,
      mcq_questions: prev.mcq_questions?.map((q) => ({
        ...q,
        time_seconds:
          value === "per_question" ? q.time_seconds || 60 : undefined,
      })),
    }));
  };

  const handleQuizTimeChange = (value: string) => {
    const minutes = parseInt(value);
    setJobData((prev) => ({
      ...prev,
      quiz_time_minutes: minutes,
    }));
  };

  const handleSaveMcqQuestions = async () => {
    try {
      setIsSavingMcq(true);
      if (!jobData.id) {
        return;
      }
      newQuizQuestion.options = newQuizOptions;
      const validationResult = mcqQuestionFormSchema.safeParse(newQuizQuestion);
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === "string") {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
        throw new Error("Please fill in all required fields for MCQ questions");
      }

      const response = await quizAPI.createQuizQuestions(
        newQuizQuestion,
        jobData.id,
        quizImageFile
      );
      if (!response) {
        throw new Error("Failed to save MCQ questions");
      }
      setNewQuizQuestion(response.data);
      const options = [];
      for (const option of newQuizQuestion.options) {
        const res = await quizAPI.createQuizOption(option, newQuizQuestion.id);
        if (!res) {
          throw new Error("Failed to save MCQ option");
        }
        options.push(res.data);
      }
      newQuizQuestion.options = options;
      setJobData({
        ...jobData,
        mcq_questions: [...(jobData.mcq_questions || []), newQuizQuestion],
      });
      setNewQuizQuestion({ time_seconds: 60, type: "single" });
      setNewQuizOptions([{}, {}, {}, {}]);

      toast.success("MCQ questions saved successfully");
    } catch (error: any) {
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

  const handleSaveCustomQuestions = async () => {
    if (!jobData.id) {
      toast.error("Please save job details first");
      return;
    }

    setIsSavingCustom(true);
    try {
      // if (
      //   !jobData.custom_interview_questions ||
      //   jobData.custom_interview_questions.length === 0
      // ) {
      //   toast.error("Please add at least one custom question");
      //   setIsSavingCustom(false);
      //   return;
      // }

      // Validate custom questions
      const customQuestionSchema = z.object({
        question: z.string().nonempty({ message: "Question is required" }),
        question_type: z.enum([
          "technical",
          "behavioral",
          "problem_solving",
          "custom",
        ]),
        order_number: z.number(),
      });

      const validationSchema = z.object({
        custom_interview_questions: z.array(customQuestionSchema),
      });

      // const validationResult = validationSchema.safeParse({
      //   custom_interview_questions: jobData.custom_interview_questions,
      // });
      // if (!validationResult.success) {
      //   const newErrors: Record<string, string> = {};
      //   validationResult.error.errors.forEach((error) => {
      //     const path = error.path[0];
      //     if (typeof path === "string") {
      //       newErrors[path] = error.message;
      //     }
      //   });
      //   setErrors(newErrors);
      //   toast.error("Please fill in all required fields for custom questions");
      //   setIsSavingCustom(false);
      //   return;
      // }

      // Save each custom question
      // for (const question of jobData.custom_interview_questions) {
      //   await api.post(
      //     "/recruiter/interview-question",
      //     {
      //       question: question.question,
      //       question_type: question.question_type,
      //       order_number: question.order_number,
      //       job_id: jobData.id,
      //     },
      //     {
      //       headers: {
      //         Authorization: `Bearer ${localStorage.getItem("token")}`,
      //       },
      //     }
      //   );
      // }

      toast.success("Custom questions saved successfully");
    } catch (error: any) {
      console.error("Error saving custom questions:", error);
      let errorMessage = "Failed to save custom questions";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSavingCustom(false);
    }
  };

  // Add state for custom questions saving
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [isSavingMcq, setIsSavingMcq] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Create New Job"
          description="Add a new job posting to find the perfect candidate"
        ></PageHeader>

        <div className="space-y-8">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="dsa">DSA Questions</TabsTrigger>
              <TabsTrigger value="mcq">MCQ Questions</TabsTrigger>
              <TabsTrigger value="custom">Custom Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
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
                        <SelectItem value="customer_support">
                          Customer Support
                        </SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="text-sm text-destructive">
                        {errors.department}
                      </p>
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
                      <p className="text-sm text-destructive">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Popover
                      open={cityPopupOpen}
                      onOpenChange={setCityPopupOpen}
                    >
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
                                      jobData.city === city.name
                                        ? "opacity-100"
                                        : "opacity-0"
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

              <Card>
                <CardHeader>
                  <CardTitle>Experience & Salary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>
                      Minimum Experience (Years){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        handleChange("min_experience", Number(val))
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
                    {errors.min_experience && (
                      <p className="text-sm text-destructive">
                        {errors.min_experience}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Maximum Experience (Years){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        handleChange("max_experience", Number(val))
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
                    {errors.max_experience && (
                      <p className="text-sm text-destructive">
                        {errors.max_experience}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Required Qualification{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={jobData.key_qualification}
                      onValueChange={(value) =>
                        handleChange("key_qualification", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelors">
                          Bachelor's Degree
                        </SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.key_qualification && (
                      <p className="text-sm text-destructive">
                        {errors.key_qualification}
                      </p>
                    )}
                  </div>

                  {(jobData.type === "internship" ||
                    jobData.type === "contract" ||
                    jobData.type === "temporary") && (
                    <div className="space-y-2">
                      <Label>
                        Job Duration (Months){" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="duration_months"
                        type="number"
                        min="1"
                        value={jobData.duration_months}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d+$/.test(value)) {
                            handleChange(
                              "duration_months",
                              value === "" ? 0 : parseInt(value)
                            );
                          }
                        }}
                      />
                      {errors.duration_months && (
                        <p className="text-sm text-destructive">
                          {errors.duration_months}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Salary Range</Label>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-normal">
                          Show salary in posting
                        </Label>
                        <Switch
                          checked={jobData.show_salary}
                          onCheckedChange={(checked) => {
                            handleChange("show_salary", checked);
                          }}
                        />
                      </div>
                    </div>

                    {
                      <>
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Popover
                            open={currencyPopupOpen}
                            onOpenChange={setCurrencyPopupOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !jobData.currency && "text-muted-foreground"
                                )}
                              >
                                {jobData.currency
                                  ? availableCurrencies.find(
                                      (c) => c.value === jobData.currency
                                    )?.label
                                  : "Select currency"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Search currency..."
                                  value={currencySearchTerm}
                                  onValueChange={setCurrencySearchTerm}
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    No currency found.
                                  </CommandEmpty>
                                  <CommandGroup className="max-h-[300px] overflow-auto">
                                    {availableCurrencies
                                      .filter(
                                        (currency) =>
                                          currency.value
                                            .toLowerCase()
                                            .includes(
                                              currencySearchTerm.toLowerCase()
                                            ) ||
                                          currency.name
                                            .toLowerCase()
                                            .includes(
                                              currencySearchTerm.toLowerCase()
                                            )
                                      )
                                      .map((currency) => (
                                        <CommandItem
                                          key={currency.value}
                                          value={currency.value}
                                          onSelect={() => {
                                            handleChange(
                                              "currency",
                                              currency.value
                                            );
                                            setCurrencyPopupOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              jobData.currency ===
                                                currency.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {currency.label}
                                          <span className="ml-2 text-muted-foreground">
                                            {currency.name}
                                          </span>
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {jobData.currency && (
                            <p className="text-sm text-muted-foreground">
                              {
                                availableCurrencies.find(
                                  (c) => c.value === jobData.currency
                                )?.name
                              }
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="salary_min">Minimum Salary</Label>
                            <Input
                              id="salary_min"
                              type="number"
                              min="0"
                              placeholder="e.g. 60000"
                              value={jobData.salary_min || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d+$/.test(value)) {
                                  handleChange(
                                    "salary_min",
                                    value === "" ? null : Number(value)
                                  );
                                }
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="salary_max">Maximum Salary</Label>
                            <Input
                              id="salary_max"
                              type="number"
                              min="0"
                              placeholder="e.g. 80000"
                              value={jobData.salary_max || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d+$/.test(value)) {
                                  handleChange(
                                    "salary_max",
                                    value === "" ? null : Number(value)
                                  );
                                }
                              }}
                            />
                          </div>
                        </div>
                      </>
                    }
                    {(errors.salary_min ||
                      errors.salary_max ||
                      errors.currency ||
                      errors.show_salary) && (
                      <p className="text-sm text-destructive">
                        {errors.salary_min ||
                          errors.salary_max ||
                          errors.currency ||
                          errors.show_salary}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>
                        Job Description{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <AIGeneratePopup
                        title="Generate Description"
                        fieldLabel="Description"
                        jobTitle={jobData.title || ""}
                        department={jobData.department || ""}
                        location={jobData.location || ""}
                        jobType={jobData.type || ""}
                        keyQualification={jobData.key_qualification || ""}
                        minExperience={jobData.min_experience?.toString() || ""}
                        maxExperience={jobData.max_experience?.toString() || ""}
                        onGenerated={(content) =>
                          handleChange("description", content)
                        }
                      />
                    </div>
                    <Textarea
                      id="description"
                      className="min-h-[200px]"
                      placeholder="Describe the role, responsibilities, and expectations..."
                      value={jobData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description}
                      </p>
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
                        jobTitle={jobData.title || ""}
                        department={jobData.department || ""}
                        location={jobData.location || ""}
                        jobType={jobData.type || ""}
                        keyQualification={jobData.key_qualification || ""}
                        minExperience={jobData.min_experience?.toString() || ""}
                        maxExperience={jobData.max_experience?.toString() || ""}
                        onGenerated={(content) =>
                          handleChange("requirements", content)
                        }
                      />
                    </div>
                    <Textarea
                      id="requirements"
                      className="min-h-[200px]"
                      placeholder="List the required skills, qualifications, and experience..."
                      value={jobData.requirements}
                      onChange={(e) =>
                        handleChange("requirements", e.target.value)
                      }
                    />
                    {errors.requirements && (
                      <p className="text-sm text-destructive">
                        {errors.requirements}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Benefits (Optional)</Label>
                    <Textarea
                      id="benefits"
                      className="min-h-[150px]"
                      placeholder="List the benefits and perks offered (optional)..."
                      value={jobData.benefits}
                      onChange={(e) => handleChange("benefits", e.target.value)}
                    />
                    {errors.benefits && (
                      <p className="text-sm text-destructive">
                        {errors.benefits}
                      </p>
                    )}
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
                          Save Job Details and Next
                          <ArrowRight />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dsa">
              <Card>
                <CardHeader>
                  <CardTitle>DSA Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {jobData.dsa_questions?.map(
                    (question: DSAQuestion, questionIndex: number) => (
                      <Card key={questionIndex} className="p-4">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>Question Title</Label>
                              <Input
                                value={question.title}
                                disabled
                                placeholder="e.g. Two Sum"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Difficulty</Label>
                              <Select value={question.difficulty} disabled>
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
                                value={
                                  question.time_minutes?.toString() || "15"
                                }
                                disabled
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
                                  <SelectItem value="120">
                                    120 minutes
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Question Description</Label>
                            <div>
                              questionDescription={question.description || ""}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Label>Test Cases</Label>
                            </div>

                            {question.test_cases?.map(
                              (testCase: TestCase, testCaseIndex: number) => (
                                <div
                                  key={testCaseIndex}
                                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                  <div className="space-y-2">
                                    <Label>Input</Label>
                                    <Textarea
                                      value={testCase.input}
                                      disabled
                                      placeholder="Input"
                                      className="min-h-[100px] font-mono whitespace-pre-wrap"
                                      rows={4}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Expected Output</Label>
                                    <Textarea
                                      value={testCase.expected_output}
                                      disabled
                                      placeholder="Expected Output"
                                      className="min-h-[100px] font-mono whitespace-pre-wrap"
                                      rows={4}
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>

                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {}} // IMPORTANT: TO BE HANDLED
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Question
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  )}

                  <Card className="p-4">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Question Title</Label>
                          <Input
                            value={newDSAQuestion?.title}
                            onChange={(e) => {
                              handleNewDsaQuestionChange(
                                "title",
                                e.target.value
                              );
                            }}
                            placeholder="e.g. Two Sum"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <Select
                            value={newDSAQuestion?.difficulty}
                            onValueChange={(value) => {
                              handleNewDsaQuestionChange("difficulty", value);
                            }}
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
                            value={
                              newDSAQuestion?.time_minutes?.toString() || "15"
                            }
                            onValueChange={(value) => {
                              handleNewDsaQuestionChange("time_minutes", value);
                            }}
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
                          questionDescription={
                            newDSAQuestion?.description || ""
                          }
                          setQuestionDescription={(value) => {
                            handleNewDsaQuestionChange("description", value);
                          }}
                        />
                      </div>

                      <div className="space-y-4">
                        {newDSAQuestion?.test_cases?.map(
                          (testCase: TestCase, testCaseIndex: number) => (
                            <div
                              key={testCaseIndex}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <div className="space-y-2">
                                <Label>Input</Label>
                                <Textarea
                                  value={testCase.input}
                                  disabled
                                  placeholder="Input"
                                  className="min-h-[100px] font-mono whitespace-pre-wrap"
                                  rows={4}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Expected Output</Label>
                                <Textarea
                                  value={testCase.expected_output}
                                  disabled
                                  placeholder="Expected Output"
                                  className="min-h-[100px] font-mono whitespace-pre-wrap"
                                  rows={4}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleTestCaseDelete(testCaseIndex);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Input</Label>
                            <Textarea
                              value={newTestCase?.input || ""}
                              onChange={(e) => {
                                handleNewTestCaseChange(
                                  "input",
                                  e.target.value
                                );
                              }}
                              placeholder="Input"
                              className="min-h-[100px] font-mono whitespace-pre-wrap"
                              rows={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Expected Output</Label>
                            <Textarea
                              value={newTestCase?.expected_output || ""}
                              onChange={(e) => {
                                handleNewTestCaseChange(
                                  "expected_output",
                                  e.target.value
                                );
                              }}
                              placeholder="Expected Output"
                              className="min-h-[100px] font-mono whitespace-pre-wrap"
                              rows={4}
                            />
                          </div>
                        </div>
                        <div className="flex w-full justify-end items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTestCaseAdd}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Test Case
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {}} // IMPORTANT: TO BE HANDLED
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Question
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <div className="flex justify-end mt-6">
                    <Button type="button" onClick={handleCreateDSAQuestion}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add DSA Question
                    </Button>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setActiveTab("mcq");
                      }}
                      disabled={isSaving}
                      variant="outline"
                    >
                      Save And Next
                      <ArrowRight />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mcq">
              <Card>
                <CardHeader>
                  <CardTitle>MCQ Questions</CardTitle>
                  <CardDescription>
                    Add multiple-choice questions for the assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Timing Mode</Label>
                      <Select
                        value={jobData.mcq_timing_mode}
                        onValueChange={handleTimingModeChange}
                        disabled={showQuizForm}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timing mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per_question">
                            Per Question Timing
                          </SelectItem>
                          <SelectItem value="whole_test">
                            Whole Test Timing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {jobData.mcq_timing_mode === "whole_test" && (
                      <div className="space-y-2">
                        <Label>Total Test Time (minutes)</Label>
                        <Select
                          value={jobData.quiz_time_minutes?.toString() || "60"}
                          onValueChange={handleQuizTimeChange}
                          disabled={showQuizForm}
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
                  {!showQuizForm && (
                    <div>
                      <Button type="button" onClick={handleSaveMcqTimingMode}>
                        Save
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">MCQ Questions</h3>
                        <p className="text-sm text-muted-foreground">
                          Total Questions: {jobData.mcq_questions?.length || 0}
                        </p>
                      </div>
                    </div>
                    {jobData.mcq_questions?.map((question, index) => (
                      <Card key={index} className="mb-4">
                        <CardContent className="pt-6">
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor={`question-${index}`}>
                                Question
                              </Label>
                              <Textarea
                                id={`question-${index}`}
                                value={question.title}
                                disabled
                                placeholder="Enter your question"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="mt-2">
                                <img
                                  src={question.imageUrl}
                                  alt="Question preview"
                                  className="max-w-xs max-h-48 object-contain rounded-md border border-gray-200"
                                />
                              </div>
                            </div>

                            <div className="grid gap-2">
                              <Label>Question Type</Label>
                              <Select value={question.type} disabled>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single">
                                    Single Choice
                                  </SelectItem>
                                  <SelectItem value="multiple">
                                    Multiple Choice
                                  </SelectItem>
                                  <SelectItem value="true_false">
                                    True/False
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid gap-2">
                              <Label>Category</Label>
                              <Select value={question.category} disabled>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="technical">
                                    Technical
                                  </SelectItem>
                                  <SelectItem value="aptitude">
                                    Aptitude
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {jobData.mcq_timing_mode === "per_question" && (
                              <div className="grid gap-2">
                                <Label>Time Limit (seconds)</Label>
                                <Input
                                  type="number"
                                  min="30"
                                  max="180"
                                  value={question.time_seconds?.toString()}
                                  disabled
                                />
                              </div>
                            )}

                            <div className="grid gap-2">
                              <Label>Options</Label>
                              {question.options?.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center space-x-2"
                                >
                                  <div
                                    className={
                                      option.correct
                                        ? "outline-1 outline-green-400"
                                        : ""
                                    }
                                  >
                                    {option.label}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                // onClick={() =>
                                //   handleMcqQuestionDelete(index)
                                // }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Question
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {showQuizForm && (
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Question</Label>
                            <Textarea
                              value={newQuizQuestion?.title}
                              onChange={(e) =>
                                handleMcqQuestionChange("title", e.target.value)
                              }
                              placeholder="Enter your question"
                            />
                          </div>

                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setQuizImageFile(file);
                                }
                              }}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label>Question Type</Label>
                            <Select
                              value={newQuizQuestion?.type}
                              onValueChange={(value) => {
                                handleMcqQuestionChange("type", value);
                                if (value == "single") {
                                  setNewQuizOptions([{}, {}, {}, {}]);
                                } else if (value == "multiple") {
                                  setNewQuizOptions([{}, {}, {}, {}]);
                                } else if (value == "true_false") {
                                  setNewQuizOptions([
                                    { label: "True" },
                                    { label: "False" },
                                  ]);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">
                                  Single Choice
                                </SelectItem>
                                <SelectItem value="multiple">
                                  Multiple Choice
                                </SelectItem>
                                <SelectItem value="true_false">
                                  True/False
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select
                              value={newQuizQuestion?.category}
                              onValueChange={(value) =>
                                handleMcqQuestionChange("category", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technical">
                                  Technical
                                </SelectItem>
                                <SelectItem value="aptitude">
                                  Aptitude
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {jobData.mcq_timing_mode === "per_question" && (
                            <div className="grid gap-2">
                              <Label>Time Limit (seconds)</Label>
                              <Input
                                type="number"
                                min="30"
                                max="180"
                                value={newQuizQuestion?.time_seconds?.toString()}
                                onChange={(e) =>
                                  handleMcqQuestionChange(
                                    "time_seconds",
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                            </div>
                          )}

                          <div className="grid gap-2">
                            <Label>Options</Label>
                            {newQuizQuestion?.type === "true_false" && (
                              <div className="space-y-2">
                                <RadioGroup
                                  value={
                                    newQuizOptions.filter(
                                      (option) => option.correct == true
                                    )[0].label
                                  }
                                  onValueChange={(value) => {
                                    setNewQuizOptions([
                                      {
                                        label: "True",
                                        correct: value == "True",
                                      },
                                      {
                                        label: "False",
                                        correct: value == "False",
                                      },
                                    ]);
                                  }}
                                >
                                  <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="True" />
                                      <Label>True</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="False" />
                                      <Label>False</Label>
                                    </div>
                                  </div>
                                </RadioGroup>
                              </div>
                            )}
                            {newQuizQuestion.type === "single" && (
                              <RadioGroup
                                value={
                                  newQuizOptions.filter(
                                    (option) => option.correct == true
                                  )?.[0].label
                                }
                                onValueChange={(value) => {
                                  let options = newQuizOptions;
                                  setNewQuizOptions([
                                    ...options.map((option) => {
                                      if (option.label == value) {
                                        return {
                                          label: option.label,
                                          correct: true,
                                        };
                                      } else {
                                        return {
                                          label: option.label,
                                          correct: false,
                                        };
                                      }
                                    }),
                                  ]);
                                }}
                              >
                                <div>
                                  <RadioGroupItem
                                    value={newQuizOptions[0].label || ""}
                                  />
                                  <Input
                                    value={newQuizOptions[0].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[0].correct,
                                        },
                                        newQuizOptions[1],
                                        newQuizOptions[2],
                                        newQuizOptions[3],
                                      ]);
                                    }}
                                    placeholder={`Option 1`}
                                  />
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value={newQuizOptions[1].label || ""}
                                  />
                                  <Input
                                    value={newQuizOptions[1].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        newQuizOptions[0],
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[1].correct,
                                        },
                                        newQuizOptions[2],
                                        newQuizOptions[3],
                                      ]);
                                    }}
                                    placeholder={`Option 2`}
                                  />
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value={newQuizOptions[2].label || ""}
                                  />
                                  <Input
                                    value={newQuizOptions[2].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        newQuizOptions[0],
                                        newQuizOptions[1],
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[2].correct,
                                        },
                                        newQuizOptions[3],
                                      ]);
                                    }}
                                    placeholder={`Option 2`}
                                  />
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value={newQuizOptions[3].label || ""}
                                  />
                                  <Input
                                    value={newQuizOptions[3].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        newQuizOptions[0],
                                        newQuizOptions[1],
                                        newQuizOptions[2],
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[3].correct,
                                        },
                                      ]);
                                    }}
                                    placeholder={`Option 3`}
                                  />
                                </div>
                              </RadioGroup>
                            )}
                            {newQuizQuestion.type === "multiple" && (
                              <div>
                                <Checkbox
                                  checked={newQuizOptions[0].correct}
                                  onCheckedChange={(checked) => {
                                    let options = newQuizOptions;
                                    if (checked) {
                                      options[0].correct = true;
                                    } else {
                                      options[0].correct = false;
                                    }
                                    setNewQuizOptions([...options]);
                                  }}
                                />
                                <Checkbox
                                  checked={
                                    newQuizQuestion?.options?.[1].correct
                                  }
                                  onCheckedChange={(checked) => {
                                    let options = newQuizOptions;
                                    if (checked) {
                                      options[1].correct = true;
                                    } else {
                                      options[1].correct = false;
                                    }
                                    setNewQuizOptions([...options]);
                                  }}
                                />
                                <Checkbox
                                  checked={
                                    newQuizQuestion?.options?.[2].correct
                                  }
                                  onCheckedChange={(checked) => {
                                    let options = newQuizOptions;
                                    if (checked) {
                                      options[2].correct = true;
                                    } else {
                                      options[2].correct = false;
                                    }
                                    setNewQuizOptions([...options]);
                                  }}
                                />
                                <Checkbox
                                  checked={
                                    newQuizQuestion?.options?.[3].correct
                                  }
                                  onCheckedChange={(checked) => {
                                    let options = newQuizOptions;
                                    if (checked) {
                                      options[3].correct = true;
                                    } else {
                                      options[3].correct = false;
                                    }
                                    setNewQuizOptions([...options]);
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end mt-4">
                            <Button
                              type="button"
                              onClick={handleSaveMcqQuestions}
                              disabled={isSaving}
                              variant="outline"
                            >
                              {isSaving ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-2" />
                                  Saving MCQ Question...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save MCQ Question
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      onClick={handleSaveMcqQuestions}
                      disabled={isSaving}
                      variant="outline"
                    >
                      Save and Next
                      <ArrowRight />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Interview Questions</CardTitle>
                  <CardDescription>
                    Add custom questions that will be asked during the interview
                    process. These questions will be presented to candidates in
                    the order specified.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <div className="space-y-4">
                    {jobData.custom_interview_questions?.map(
                      (question, index) => renderCustomQuestion(question, index)
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      // onClick={handleCustomQuestionAdd}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Question
                    </Button>
                    <div className="flex justify-end mt-4">
                      <Button
                        type="button"
                        onClick={handleSaveCustomQuestions}
                        disabled={isSavingCustom}
                      >
                        {isSavingCustom ? (
                          <>
                            <LoadingSpinner className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Questions
                          </>
                        )}
                      </Button>
                    </div>
                  </div> */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewJob;
