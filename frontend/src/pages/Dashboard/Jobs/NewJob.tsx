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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const NewJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<JobData>({
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
    status: "active"
  });
  const { addNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await jobAPI.createJob(jobData);
      if (response.status >= 200 && response.status < 300) {
        addNotification({
          type: 'job',
          title: 'New Job Created',
          message: `Your job posting "${jobData.title}" is now live.`
        });
        toast.success("Job created successfully");
        navigate("/dashboard/jobs");
      } else {
        throw new Error("Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    } finally {
      setIsSubmitting(false);
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
            </CardContent>
          </Card>

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
