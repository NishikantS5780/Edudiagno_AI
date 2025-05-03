import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { interviewAPI, jobAPI } from "@/lib/api";
import { InterviewData } from "@/types/interview";
import { toast } from "sonner";
import { format } from "date-fns";

const Dashboard = () => {
  const { recruiter } = useUser();
  const [dateRange, setDateRange] = useState("30days");
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch interviews
        const interviewsRes = await interviewAPI.getInterviews();
        setInterviews(interviewsRes.data.map((interview: any) => ({
          id: interview.id,
          status: interview.status,
          firstName: interview.first_name,
          lastName: interview.last_name,
          email: interview.email,
          phone: interview.phone,
          workExperience: interview.work_experience,
          education: interview.education,
          skills: interview.skills,
          location: interview.location,
          linkedinUrl: interview.linkedin_url,
          portfolioUrl: interview.portfolio_url,
          resumeUrl: interview.resume_url,
          resumeMatchScore: interview.resume_match_score,
          resumeMatchFeedback: interview.resume_match_feedback,
          overallScore: interview.overall_score,
          feedback: interview.feedback,
          createdAt: interview.created_at,
          jobId: interview.job_id,
        })));

        // Fetch jobs
        const jobsRes = await jobAPI.recruiterGetAllJobs();
        setJobs(jobsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process real data for charts
  const activityData = interviews.reduce((acc, interview) => {
    const date = new Date(interview.createdAt || '');
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const existingDay = acc.find(item => item.name === day);
    
    if (existingDay) {
      existingDay.interviews++;
    } else {
      acc.push({ name: day, interviews: 1, screenings: 0 });
    }
    return acc;
  }, [] as { name: string; interviews: number; screenings: number }[]);

  const pipelineData = [
    { name: "Applied", value: interviews.length || 0 },
    { name: "Screened", value: interviews.filter(i => i.resumeMatchScore !== null).length || 0 },
    { name: "Interviewed", value: interviews.filter(i => i.status === 'completed').length || 0 },
    { name: "Shortlisted", value: interviews.filter(i => i.overallScore && i.overallScore >= 80).length || 0 },
    { name: "Hired", value: interviews.filter(i => i.status === 'hired').length || 0 },
  ];

  // Ensure minimum value for each segment to maintain visibility
  const minValue = 0.1; // Small non-zero value to maintain segment visibility
  const processedPipelineData = pipelineData.map(item => ({
    ...item,
    value: Math.max(item.value, minValue)
  }));

  const interviewData = interviews.reduce((acc, interview) => {
    if (!interview.createdAt) return acc;
    const month = new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short' });
    const existingMonth = acc.find(item => item.date === month);
    
    if (existingMonth) {
      if (interview.status === 'completed') {
        existingMonth.completed++;
      } else {
        existingMonth.started++;
      }
    } else {
      acc.push({ 
        date: month, 
        completed: interview.status === 'completed' ? 1 : 0,
        started: interview.status !== 'completed' ? 1 : 0
      });
    }
    return acc;
  }, [] as { date: string; completed: number; started: number }[]);

  const candidateSourceData = [
    { name: "Job Boards", value: 45 },
    { name: "Referrals", value: 20 },
    { name: "Company Website", value: 25 },
    { name: "Social Media", value: 10 },
  ];

  const timeToHireData = [
    { date: "Jan", days: 35 },
    { date: "Feb", days: 32 },
    { date: "Mar", days: 28 },
    { date: "Apr", days: 25 },
    { date: "May", days: 22 },
    { date: "Jun", days: 20 },
  ];

  const skillsGapData = [
    { name: "React", demand: 85, supply: 65 },
    { name: "Node.js", demand: 75, supply: 60 },
    { name: "Python", demand: 90, supply: 70 },
    { name: "AWS", demand: 80, supply: 55 },
    { name: "Docker", demand: 70, supply: 45 },
  ];

  const diversityData = {
    gender: [
      { name: "Male", value: 60 },
      { name: "Female", value: 35 },
      { name: "Other", value: 5 },
    ],
    ethnicity: [
      { name: "Asian", value: 30 },
      { name: "White", value: 40 },
      { name: "Black", value: 15 },
      { name: "Hispanic", value: 10 },
      { name: "Other", value: 5 },
    ],
  };

  const jobPerformanceData = [
    { name: "Senior Frontend Dev", interviews: 45, hires: 8, conversionRate: "18%", avgScore: 85 },
    { name: "Backend Engineer", interviews: 38, hires: 6, conversionRate: "16%", avgScore: 82 },
    { name: "Product Manager", interviews: 30, hires: 5, conversionRate: "17%", avgScore: 78 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f43f5e"];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const exportReport = () => {
    try {
      // Prepare the data for export
      const reportData = {
        jobs: {
          total: jobs.length,
          active: jobs.filter(job => job.status === 'active').length,
          draft: jobs.filter(job => job.status === 'draft').length,
          closed: jobs.filter(job => job.status === 'closed').length,
          last30Days: jobs.filter(job => new Date(job.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length
        },
        interviews: {
          total: interviews.length,
          completed: interviews.filter(i => i.status === 'completed').length,
          hired: interviews.filter(i => i.status === 'hired').length,
          last30Days: interviews.filter(i => new Date(i.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length
        },
        pipeline: {
          applied: interviews.length,
          screened: interviews.filter(i => i.resumeMatchScore !== null).length,
          interviewed: interviews.filter(i => i.status === 'completed').length,
          shortlisted: interviews.filter(i => i.overallScore && i.overallScore >= 80).length,
          hired: interviews.filter(i => i.status === 'hired').length
        }
      };

      // Create CSV content
      const csvContent = [
        ['Dashboard Report', format(new Date(), 'MMM dd, yyyy')],
        [''],
        ['Jobs Overview'],
        ['Total Jobs', reportData.jobs.total],
        ['Active Jobs', reportData.jobs.active],
        ['Draft Jobs', reportData.jobs.draft],
        ['Closed Jobs', reportData.jobs.closed],
        ['Jobs Created Last 30 Days', reportData.jobs.last30Days],
        [''],
        ['Interviews Overview'],
        ['Total Interviews', reportData.interviews.total],
        ['Completed Interviews', reportData.interviews.completed],
        ['Hired Candidates', reportData.interviews.hired],
        ['Interviews Last 30 Days', reportData.interviews.last30Days],
        [''],
        ['Hiring Pipeline'],
        ['Applied', reportData.pipeline.applied],
        ['Screened', reportData.pipeline.screened],
        ['Interviewed', reportData.pipeline.interviewed],
        ['Shortlisted', reportData.pipeline.shortlisted],
        ['Hired', reportData.pipeline.hired]
      ].map(row => row.join(',')).join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${recruiter && recruiter.name}`}
        description="Here's what's happening with your hiring activities"
      >
        <div className="flex space-x-2">
          <Link to="/dashboard/jobs/new">
            <Button size="sm" className="h-9">
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </Link>
          <Button size="sm" className="h-9" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Jobs
                </p>
                <h3 className="text-3xl font-bold">{jobs.length}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Briefcase className="h-5 w-5 text-brand" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success font-medium">
                {jobs.filter(job => new Date(job.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
              </span>
              <span className="text-muted-foreground ml-1">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Candidates
                </p>
                <h3 className="text-3xl font-bold">{interviews.length}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Users className="h-5 w-5 text-brand" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success font-medium">
                {interviews.filter(i => new Date(i.createdAt || '').getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
              </span>
              <span className="text-muted-foreground ml-1">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Interviews Conducted
                </p>
                <h3 className="text-3xl font-bold">
                  {interviews.filter(i => i.status === 'completed').length}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Calendar className="h-5 w-5 text-brand" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success font-medium">
                {interviews.filter(i => i.status === 'completed' && new Date(i.createdAt || '').getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
              </span>
              <span className="text-muted-foreground ml-1">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Offer Acceptance Rate
                </p>
                <h3 className="text-3xl font-bold">
                  {interviews.filter(i => i.status === 'completed').length > 0
                    ? `${Math.round((interviews.filter(i => i.status === 'hired').length / interviews.filter(i => i.status === 'completed').length) * 100)}%`
                    : '0%'}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <CheckCircle className="h-5 w-5 text-brand" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success font-medium">
                {interviews.filter(i => i.status === 'hired' && new Date(i.createdAt || '').getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
              </span>
              <span className="text-muted-foreground ml-1">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="diversity">Diversity</TabsTrigger>
          <TabsTrigger value="skills">Skills Gap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>
              Interviews and screenings conducted this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={300}
                  data={activityData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar
                    dataKey="screenings"
                    fill="#8884d8"
                    name="Resume Screenings"
                  />
                  <Bar dataKey="interviews" fill="#82ca9d" name="Interviews" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

            <Card>
          <CardHeader>
            <CardTitle>Hiring Pipeline</CardTitle>
            <CardDescription>
              Current state of candidates in your pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                        data={processedPipelineData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                        label={({ name, value }) => {
                          // Only show percentage for non-zero values
                          const total = pipelineData.reduce((sum, item) => sum + item.value, 0);
                          const percentage = total > 0 ? (value / total) * 100 : 0;
                          return value > minValue ? `${name}: ${Math.round(percentage)}%` : name;
                        }}
                  >
                        {processedPipelineData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                            strokeWidth={entry.value === minValue ? 0 : 1}
                            opacity={entry.value === minValue ? 0.2 : 1}
                      />
                    ))}
                  </Pie>
                      <RechartsTooltip 
                        formatter={(value: number, name: string) => {
                          const total = pipelineData.reduce((sum, item) => sum + item.value, 0);
                          const percentage = total > 0 ? (value / total) * 100 : 0;
                          return value > minValue ? [`${Math.round(percentage)}%`, name] : ['0%', name];
                        }}
                      />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Performance</CardTitle>
                <CardDescription>Performance metrics by job position</CardDescription>
          </CardHeader>
          <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 bg-muted p-4 text-sm font-medium">
                    <div className="col-span-3">Position</div>
                    <div className="col-span-2 text-center">Interviews</div>
                    <div className="col-span-2 text-center">Hires</div>
                    <div className="col-span-2 text-center">Conversion</div>
                    <div className="col-span-3 text-center">Avg. AI Score</div>
                  </div>
                  <div className="divide-y">
                    {jobPerformanceData.map((job, index) => (
                      <div key={index} className="grid grid-cols-12 p-4 text-sm items-center">
                        <div className="col-span-3 font-medium">{job.name}</div>
                        <div className="col-span-2 text-center">{job.interviews}</div>
                        <div className="col-span-2 text-center">{job.hires}</div>
                        <div className="col-span-2 text-center">{job.conversionRate}</div>
                        <div className="col-span-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {job.avgScore}
                            <Badge variant={job.avgScore >= 80 ? "success" : "warning"}>
                              {job.avgScore >= 80 ? "Good" : "Average"}
                            </Badge>
                    </div>
                  </div>
                </div>
              ))}
                  </div>
            </div>
          </CardContent>
        </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time to Hire Trend</CardTitle>
                <CardDescription>Average days to hire by month</CardDescription>
          </CardHeader>
          <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeToHireData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="days" name="Days" stroke="#3b82f6" />
                    </LineChart>
                  </ResponsiveContainer>
                    </div>
              </CardContent>
            </Card>
                  </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Activity</CardTitle>
                <CardDescription>Number of interviews started vs completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interviewData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="started" name="Started" fill="#3b82f6" />
                      <Bar dataKey="completed" name="Completed" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                    </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Candidate Sources</CardTitle>
                <CardDescription>Distribution of candidate applications by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={candidateSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {candidateSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                    </div>
              </CardContent>
            </Card>
                  </div>
        </TabsContent>

        <TabsContent value="diversity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Gender diversity of candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diversityData.gender}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {diversityData.gender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ethnic Distribution</CardTitle>
                <CardDescription>Ethnic diversity of candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diversityData.ethnicity}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {diversityData.ethnicity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Gap Analysis</CardTitle>
              <CardDescription>Current demand vs. available talent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsGapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="demand" name="Skill Demand" fill="#3b82f6" />
                    <Bar dataKey="supply" name="Available Talent" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
