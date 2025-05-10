import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import { Switch } from "@/components/ui/switch";
import { jobAPI } from "@/lib/api";

interface FormData {
  title: string;
  description: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
  jobType: string;
  department: string;
  requirements: string;
  benefits: string;
}

const JobEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    location: "",
    salary_min: null,
    salary_max: null,
    show_salary: false,
    jobType: "full-time",
    department: "",
    requirements: "",
    benefits: ""
  });

  // Fetch job data
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await jobAPI.recruiterGetJob(id as string);
      return response.data;
    }
  });

  // Set form data when job data is loaded
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        salary_min: job.salary_min || null,
        salary_max: job.salary_max || null,
        show_salary: job.show_salary || false,
        jobType: job.type || "full-time",
        department: job.department || "",
        requirements: job.requirements || "",
        benefits: job.benefits || ""
      });
    }
  }, [job]);

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await jobAPI.updateJob(id as string, {
        title: data.title,
        description: data.description,
        location: data.location,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        show_salary: data.show_salary,
        type: data.jobType,
        department: data.department,
        requirements: data.requirements,
        benefits: data.benefits
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Job updated successfully');
      navigate('/dashboard/jobs');
    },
    onError: (error) => {
      toast.error('Failed to update job');
      console.error('Job update error:', error);
    }
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async () => {
      const response = await jobAPI.deleteJob(id as string);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Job deleted successfully');
      navigate('/dashboard/jobs');
    },
    onError: (error) => {
      toast.error('Failed to delete job');
      console.error('Job deletion error:', error);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : Number(value)) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateJobMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteJobMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">Failed to load job details. Please try again.</div>
        <Button variant="outline" onClick={() => navigate('/dashboard/jobs')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader 
        title="Edit Job Posting"
        description="Update job details or delete job posting"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/dashboard/jobs')}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Job
            </Button>
          </div>
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Salary Range (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-normal">
                      Show salary in posting
                    </Label>
                    <Switch
                      checked={formData.show_salary}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_salary: checked }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary_min">Minimum Salary</Label>
                    <Input
                      id="salary_min"
                      name="salary_min"
                      type="number"
                      value={formData.salary_min === null ? '' : formData.salary_min}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow non-negative integers
                        if (value === '' || /^\d+$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      placeholder="e.g. 60000"
                      disabled={!formData.show_salary}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_max">Maximum Salary</Label>
                    <Input
                      id="salary_max"
                      name="salary_max"
                      type="number"
                      value={formData.salary_max === null ? '' : formData.salary_max}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow non-negative integers
                        if (value === '' || /^\d+$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      placeholder="e.g. 80000"
                      disabled={!formData.show_salary}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select 
                  value={formData.jobType} 
                  onValueChange={(value) => handleSelectChange('jobType', value)}
                >
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending ? <LoadingSpinner size="sm" /> : "Update Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobEdit;
