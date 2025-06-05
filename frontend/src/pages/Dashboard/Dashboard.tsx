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
  ArrowUp,
  Plus,
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterviewData } from "@/types/interview";
import { toast } from "sonner";
import { format } from "date-fns";
import { AuthContext } from "@/context/AuthContext";
import { recruiterAPI } from "@/services/recruiterApi";

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const [dateRange, setDateRange] = useState("30days");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
    total_jobs?: number;
    total_open_jobs?: number;
    total_closed_jobs?: number;
    total_interviews_conducted?: number;
    total_interviews_conducted_this_month?: number;
    total_interviews_conducted_previous_month?: number;
    total_interviews_completed?: number;
    interview_completed_this_month?: number;
    interview_completed_previous_month?: number;
    total_candidates?: number;
    average_candidate_score?: number;
    active_jobs_this_month?: number;
    active_jobs_previous_month?: number;
    candidates_this_month?: number;
    candidates_previous_month?: number;
    daily_interviews_this_week?: { date: string; count: number }[];
  }>({});

  const fetchData = async () => {
    try {
      if (!authContext || !authContext.recruiter || !authContext.recruiter.id) {
        throw new Error("Recruiter data not available");
      }

      setLoading(true);
      const res = await recruiterAPI.getAnaltyics(authContext.recruiter.id);
      setAnalyticsData(res.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  if (!authContext || !authContext.recruiter) {
    return toast.error("Something went wrong");
  }

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
        title={`Welcome back, ${
          authContext.recruiter && authContext.recruiter.name
        }`}
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
                <h3 className="text-3xl font-bold">
                  {analyticsData.active_jobs_this_month || 0}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Briefcase className="h-5 w-5 text-brand" />
              </div>
            </div>
            {!!analyticsData.active_jobs_this_month &&
              !!analyticsData.active_jobs_previous_month && (
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUp className="h-4 w-4 text-success mr-1" />
                  <span className="text-success font-medium">
                    {(analyticsData.active_jobs_this_month -
                      analyticsData.active_jobs_previous_month) /
                      100}
                    %{" "}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Candidates
                </p>
                <h3 className="text-3xl font-bold">
                  {analyticsData.total_candidates}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Users className="h-5 w-5 text-brand" />
              </div>
            </div>
            {!!analyticsData.candidates_this_month &&
              !!analyticsData.candidates_previous_month && (
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUp className="h-4 w-4 text-success mr-1" />
                  <span className="text-success font-medium">
                    {(analyticsData.candidates_this_month -
                      analyticsData.candidates_previous_month) /
                      100}{" "}
                    %
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              )}
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
                  {analyticsData.total_interviews_conducted_this_month || 0}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Calendar className="h-5 w-5 text-brand" />
              </div>
            </div>
            {!!analyticsData.total_interviews_conducted_this_month &&
              !!analyticsData.total_interviews_conducted_previous_month && (
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUp className="h-4 w-4 text-success mr-1" />
                  <span className="text-success font-medium">
                    {(analyticsData.total_interviews_conducted_this_month -
                      analyticsData.total_interviews_conducted_previous_month) /
                      100}
                    %
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Interviews Completed
                </p>
                <h3 className="text-3xl font-bold">
                  {analyticsData.interview_completed_this_month || 0}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <CheckCircle className="h-5 w-5 text-brand" />
              </div>
            </div>
            {!!analyticsData.interview_completed_this_month &&
              !!analyticsData.interview_completed_previous_month && (
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUp className="h-4 w-4 text-success mr-1" />
                  <span className="text-success font-medium">{}</span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
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
                    <LineChart
                      width={500}
                      height={300}
                      data={analyticsData.daily_interviews_this_week || []}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        interval={0}
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        domain={["auto", "auto"]}
                        tickFormatter={(value) =>
                          Number.isInteger(value) ? value : ""
                        }
                      />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        dataKey="count"
                        fill="#8884d8"
                        name="Interviews Conducted"
                      />
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
                <CardDescription>
                  Number of interviews started vs completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          status: "started",
                          count: analyticsData.total_interviews_conducted,
                        },
                        {
                          status: "completed",
                          count: analyticsData.total_interviews_completed,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="started" name="Started" fill="#3b82f6" />
                      <Bar dataKey="count" name="interviews" fill="#10b981" />
                    </BarChart>
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
              <CardDescription>
                Current demand vs. available talent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        averageCandidateScore:
                          analyticsData.average_candidate_score || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="averageCandidateScore"
                      name="Average Candidate Score"
                      fill="green"
                      background={{ fill: "red" }}
                    />
                    <Bar
                      dataKey="supply"
                      name="Available Talent"
                      fill="#10b981"
                    />
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
