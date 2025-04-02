import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, ArrowLeft, Wand2, HelpCircle, X } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AIJobDescriptionGenerator from "@/components/jobs/AIJobDescriptionGenerator";
import { jobAPI } from "@/lib/api";

const jobFormSchema = z.object({
  title: z.string().min(3, { message: "Job title must be at least 3 characters" }),
  department: z.string().min(1, { message: "Please select a department" }),
  location: z.string().min(1, { message: "Please select a location" }),
  type: z.string().min(1, { message: "Please select a job type" }),
  experience: z.string().min(1, { message: "Please select a experience level" }),
  salary: z.object({
    min: z.string(),
    max: z.string(),
    showSalary: z.boolean().default(false),
  }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  requirements: z.string().min(10, { message: "Requirements must be at least 10 characters" }),
  benefits: z.string(),
  published: z.boolean().default(true),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const NewJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [openAIKey, setOpenAIKey] = useState("");
  const [showAPIKeyInput, setShowAPIKeyInput] = useState(false);

  const defaultValues: JobFormValues = {
    title: "",
    department: "",
    location: "",
    type: "",
    experience: "",
    salary: {
      min: "",
      max: "",
      showSalary: true,
    },
    description: "",
    requirements: "",
    benefits: "",
    published: true,
  };

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
  });

  const generateJobDescription = async () => {
    const jobTitle = form.getValues("title");
    
    if (!jobTitle) {
      toast.error("Please enter a job title first");
      return;
    }
    
    if (!openAIKey) {
      setShowAPIKeyInput(true);
      return;
    }
    
    setShowAIGenerator(true);
  };

  const handleAPIKeySubmit = () => {
    if (!openAIKey.trim()) {
      toast.error("Please enter a valid OpenAI API key");
      return;
    }
    
    setShowAPIKeyInput(false);
    setShowAIGenerator(true);
    toast.success("API key saved for this session");
  };

  const handleAIGeneratedDescription = (description: string) => {
    const descriptionParts = description.split('##');
    
    let mainDescription = '';
    let requirements = '';
    let benefits = '';
    
    if (descriptionParts.length > 0) {
      const titleAndDesc = descriptionParts[0].split('\n').filter(line => line.trim());
      if (titleAndDesc.length > 0 && titleAndDesc[0].startsWith('#')) {
        titleAndDesc.shift();
      }
      mainDescription = titleAndDesc.join('\n').trim();
    }
    
    for (const part of descriptionParts) {
      const trimmedPart = part.trim();
      
      if (
        trimmedPart.toLowerCase().startsWith('requirements') || 
        trimmedPart.toLowerCase().startsWith('qualifications')
      ) {
        requirements = trimmedPart.split('\n').slice(1).join('\n').trim();
      }
      
      else if (
        trimmedPart.toLowerCase().startsWith('about our company') ||
        trimmedPart.toLowerCase().includes('offer') ||
        trimmedPart.toLowerCase().includes('benefits')
      ) {
        benefits = trimmedPart.split('\n').slice(1).join('\n').trim();
      }
    }
    
    form.setValue('description', mainDescription, { shouldValidate: true });
    if (requirements) {
      form.setValue('requirements', requirements, { shouldValidate: true });
    }
    if (benefits) {
      form.setValue('benefits', benefits, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: JobFormValues) => {
    try {
      setIsSubmitting(true);
      
      const jobData = {
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type,
        experience: data.experience,
        salary_min: parseInt(data.salary.min) || null,
        salary_max: parseInt(data.salary.max) || null,
        show_salary: data.salary.showSalary,
        description: data.description,
        requirements: data.requirements,
        benefits: data.benefits,
        published: data.published,
      };

      await jobAPI.create(jobData);
      toast.success("Job created successfully");
      navigate("/dashboard/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Create New Job"
          description="Add a new job posting to find the perfect candidate"
        >
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/jobs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </PageHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-6 p-6 border rounded-lg">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormDescription>
                          The title of the position you're hiring for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="onsite">On-site</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full_time">Full-time</SelectItem>
                              <SelectItem value="part_time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="temporary">Temporary</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="entry">Entry Level</SelectItem>
                              <SelectItem value="mid">Mid Level</SelectItem>
                              <SelectItem value="senior">Senior Level</SelectItem>
                              <SelectItem value="lead">Lead / Manager</SelectItem>
                              <SelectItem value="executive">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Salary Range (Optional)</FormLabel>
                      <FormField
                        control={form.control}
                        name="salary.showSalary"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormLabel className="text-sm font-normal">
                              Show salary in posting
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="salary.min"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Min salary"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="salary.max"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Max salary"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base">Job Description</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateJobDescription}
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the role, responsibilities, and ideal candidate"
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List the skills, qualifications, and experience required"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benefits (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List the benefits, perks, and why candidates should apply"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 border rounded-lg space-y-6">
                  <h3 className="font-medium">Job Settings</h3>

                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Published
                          </FormLabel>
                          <FormDescription>
                            Make this job visible to candidates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-sm">AI Interview Setup</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Configure how the AI will interview candidates for this job
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="technical" />
                        <label
                          htmlFor="technical"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Include technical questions
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="behavioral" defaultChecked />
                        <label
                          htmlFor="behavioral"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Include behavioral questions
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="problem-solving" defaultChecked />
                        <label
                          htmlFor="problem-solving"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Include problem-solving scenarios
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="custom-questions" />
                        <label
                          htmlFor="custom-questions"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Add custom interview questions
                        </label>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        Configure Interview Settings
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-sm">Resume Screening</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="screen-resume" defaultChecked />
                        <label
                          htmlFor="screen-resume"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Enable AI resume screening
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="min-match" defaultChecked />
                        <label
                          htmlFor="min-match"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Require minimum 70% match
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="auto-reject" />
                        <label
                          htmlFor="auto-reject"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Auto-reject non-matching candidates
                        </label>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        Advanced Screening Options
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/jobs")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
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
        </Form>
      </div>
      
      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <AIJobDescriptionGenerator
            onGenerate={handleAIGeneratedDescription}
            onClose={() => setShowAIGenerator(false)}
            jobTitle={form.getValues("title")}
            department={form.getValues("department")}
            location={form.getValues("location")}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAPIKeyInput} onOpenChange={setShowAPIKeyInput}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter OpenAI API Key</DialogTitle>
            <DialogDescription>
              Your API key is required to generate content with AI. It will only be stored for this session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right col-span-1">API Key</FormLabel>
              <div className="col-span-3">
                <Input 
                  id="apiKey" 
                  type="password" 
                  placeholder="sk-..." 
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAPIKeyInput(false)}>
              Cancel
            </Button>
            <Button onClick={handleAPIKeySubmit}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NewJob;
