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
import { Save, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { jobAPI } from "@/lib/api";
import { JobData } from "@/types/job";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import AIGeneratePopup from "@/components/jobs/AIGeneratePopup";
import { useNotifications } from "@/context/NotificationContext";

const jobFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Job title must be at least 3 characters" }),
  department: z.string().min(1, { message: "Please select a department" }),
  location: z.string().min(1, { message: "Please select a location" }),
  type: z.string().min(1, { message: "Please select a job type" }),
  experience: z
    .string()
    .min(1, { message: "Please select a experience level" }),
  salary: z.object({
    min: z.string(),
    max: z.string(),
    showSalary: z.boolean().default(false),
  }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  requirements: z
    .string()
    .min(10, { message: "Requirements must be at least 10 characters" }),
  benefits: z.string(),
  published: z.boolean().default(true),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const NewJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<JobData>({
    title: "",
    status: "active",
  });
  const { addNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await jobAPI.createJob(jobData);
      if (response.status === 201) {
        addNotification({
          type: 'job',
          title: 'New Job Created',
          message: `Your job posting "${jobData.title}" is now live.`
        });
        toast.success("Job created successfully");
        navigate("/dashboard/jobs");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    }
  };

  const handleGeneratedContent = (
    field: keyof JobFormValues,
    content: string
  ) => {
    // form.setValue(field, content, { shouldValidate: true });
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 border rounded-lg">
            <div className="col-span-1 lg:col-span-2">
              <Label htmlFor="job-title">Job Title</Label>
              The title of the position you're hiring for{" "}
              <span className="text-red-500">*</span>
              <Input
                id="job-title"
                placeholder="e.g. Senior Software Engineer"
                value={jobData.title}
                onChange={(e) =>
                  setJobData({ ...jobData, title: e.target.value })
                }
              />
            </div>

            <div className="col-span-1 lg:col-span-1">
              <Label>
                Department
                <span className="text-red-500">*</span>
              </Label>
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
            </div>

            <div>
              <Label>
                Location
                <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(val: string) =>
                  setJobData({ ...jobData, location: val })
                }
                defaultValue={jobData.location}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="">
              <Label>
                Min Experience
                <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(val: string) =>
                  setJobData({ ...jobData, minExperience: Number(val) })
                }
                defaultValue={jobData.minExperience?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select min experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Fresher</SelectItem>{" "}
                  <SelectItem value="1">1 year</SelectItem>
                  <SelectItem value="2">2 years</SelectItem>
                  <SelectItem value="3">3 years</SelectItem>
                  <SelectItem value="4">4 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="">
              <Label>
                Max Experience
                <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(val: string) =>
                  setJobData({ ...jobData, maxExperience: Number(val) })
                }
                defaultValue={jobData.maxExperience?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Fresher</SelectItem>
                  <SelectItem value="1">1 year</SelectItem>
                  <SelectItem value="2">2 years</SelectItem>
                  <SelectItem value="3">3 years</SelectItem>
                  <SelectItem value="4">4 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="">
              <Label>
                Min Salary
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Min salary"
                type="number"
                value={jobData.minSalary}
                onChange={(e) =>
                  setJobData({ ...jobData, minSalary: Number(e.target.value) })
                }
              />
            </div>

            <div className="">
              <Label>
                Max Salary
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Min salary"
                type="number"
                value={jobData.maxSalary}
                onChange={(e) =>
                  setJobData({ ...jobData, maxSalary: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center gap-4">
              <Switch
                checked={jobData.showSalary}
                onCheckedChange={(checked) =>
                  setJobData({ ...jobData, showSalary: checked })
                }
              />
              <Label>Show Salary</Label>
            </div>

            <div className="">
              <Label>
                Job Type
                <span className="text-red-500">*</span>
              </Label>
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
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 lg:col-span-3">
              <div className="flex justify-between items-center">
                <Label>
                  Description
                  <span className="text-red-500">*</span>
                </Label>
                <AIGeneratePopup
                  title={"Generate Description for Job"}
                  fieldLabel={"Description"}
                  jobTitle={jobData.title}
                  department={jobData.department}
                  location={jobData.location}
                  jobType={jobData.type}
                  onGenerated={function (content: string): void {
                    setJobData({ ...jobData, description: content });
                  }}
                />
              </div>
              <Textarea
                className="min-h-52"
                onChange={(e) =>
                  setJobData({ ...jobData, description: e.target.value })
                }
                defaultValue={jobData.description}
              ></Textarea>
            </div>

            <div className="col-span-1 lg:col-span-3">
              <div className="flex justify-between items-center">
                <Label>
                  Requirements
                  <span className="text-red-500">*</span>
                </Label>
                <AIGeneratePopup
                  title={"Generate Description for Job"}
                  fieldLabel={"Requirements"}
                  jobTitle={jobData.title}
                  department={jobData.department}
                  location={jobData.location}
                  jobType={jobData.type}
                  onGenerated={function (content: string): void {
                    setJobData({ ...jobData, requirements: content });
                  }}
                />
              </div>
              <Textarea
                className="min-h-52"
                onChange={(e) =>
                  setJobData({ ...jobData, requirements: e.target.value })
                }
                defaultValue={jobData.requirements}
              ></Textarea>
            </div>

            <div className="col-span-1 lg:col-span-3">
              <Label>
                Benefits
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                className="min-h-52"
                onChange={(e) =>
                  setJobData({ ...jobData, benefits: e.target.value })
                }
                defaultValue={jobData.benefits}
              ></Textarea>
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
      </div>
    </DashboardLayout>
  );
};

export default NewJob;
