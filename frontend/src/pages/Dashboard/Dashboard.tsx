import { useContext } from "react";
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
} from "lucide-react";
import { UserContext } from "@/context/UserContext";

const Dashboard = () => {
  const { recruiter } = useContext(UserContext);
  const activityData = [
    { name: "Mon", interviews: 5, screenings: 12 },
    { name: "Tue", interviews: 8, screenings: 18 },
    { name: "Wed", interviews: 12, screenings: 14 },
    { name: "Thu", interviews: 7, screenings: 10 },
    { name: "Fri", interviews: 10, screenings: 20 },
    { name: "Sat", interviews: 3, screenings: 5 },
    { name: "Sun", interviews: 2, screenings: 3 },
  ];

  const pipelineData = [
    { name: "Applied", value: 120 },
    { name: "Screened", value: 78 },
    { name: "Interviewed", value: 42 },
    { name: "Shortlisted", value: 15 },
    { name: "Hired", value: 8 },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  const recentJobs = [
    {
      id: "job-1",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      applicants: 48,
      status: "active",
      posted: "2 days ago",
    },
    {
      id: "job-2",
      title: "Product Marketing Manager",
      department: "Marketing",
      location: "New York, NY",
      applicants: 32,
      status: "active",
      posted: "5 days ago",
    },
    {
      id: "job-3",
      title: "UX Designer",
      department: "Design",
      location: "San Francisco, CA",
      applicants: 19,
      status: "active",
      posted: "1 week ago",
    },
  ];

  const upcomingInterviews = [
    {
      id: "int-1",
      candidate: "Jane Smith",
      position: "Senior Frontend Developer",
      time: "Today, 2:30 PM",
      status: "scheduled",
    },
    {
      id: "int-2",
      candidate: "Michael Johnson",
      position: "Product Marketing Manager",
      time: "Tomorrow, 10:00 AM",
      status: "scheduled",
    },
    {
      id: "int-3",
      candidate: "David Lee",
      position: "UX Designer",
      time: "Apr 10, 1:00 PM",
      status: "scheduled",
    },
  ];

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
                <h3 className="text-3xl font-bold">12</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Briefcase className="h-5 w-5 text-brand" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success font-medium">3</span>
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
                <h3 className="text-3xl font-bold">145</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Users className="h-5 w-5 text-brand" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success font-medium">28</span>
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
                <h3 className="text-3xl font-bold">87</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Calendar className="h-5 w-5 text-brand" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowDown className="h-4 w-4 text-destructive mr-1" />
              <span className="text-destructive font-medium">5</span>
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
                  Time Saved
                </p>
                <h3 className="text-3xl font-bold">42h</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Clock className="h-5 w-5 text-brand" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success font-medium">8h</span>
              <span className="text-muted-foreground ml-1">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-border/50">
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

        <Card className="border-border/50">
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
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Your most recent job postings</CardDescription>
            </div>
            <Link to="/dashboard/jobs">
              <Button variant="ghost" className="h-8 text-sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      to={`/dashboard/jobs/${job.id}`}
                      className="font-medium hover:underline"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{job.department}</span>
                      <span className="mx-2">•</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm font-medium">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      {job.applicants} applicants
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Posted {job.posted}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Scheduled AI interviews</CardDescription>
            </div>
            <Link to="/dashboard/interviews">
              <Button variant="ghost" className="h-8 text-sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      to={`/dashboard/interviews/${interview.id}`}
                      className="font-medium hover:underline"
                    >
                      {interview.candidate}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">
                      {interview.position}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm font-medium">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {interview.time}
                    </div>
                    <div className="flex items-center text-xs mt-1 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {interview.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
