
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Analytics = () => {
  const [dateRange, setDateRange] = useState("30days");

  // Mock data for charts
  const interviewData = [
    { date: "Jan", completed: 45, started: 58 },
    { date: "Feb", completed: 52, started: 69 },
    { date: "Mar", completed: 48, started: 62 },
    { date: "Apr", completed: 70, started: 85 },
    { date: "May", completed: 95, started: 110 },
    { date: "Jun", completed: 78, started: 95 },
  ];

  const candidateSourceData = [
    { name: "Job Boards", value: 45 },
    { name: "Referrals", value: 20 },
    { name: "Company Website", value: 25 },
    { name: "Social Media", value: 10 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f43f5e"];

  const jobPerformanceData = [
    {
      name: "Software Engineer",
      interviews: 58,
      hires: 5,
      conversionRate: "8.6%",
      avgScore: 82,
    },
    {
      name: "Product Manager",
      interviews: 45,
      hires: 3,
      conversionRate: "6.7%",
      avgScore: 79,
    },
    {
      name: "UX Designer",
      interviews: 32,
      hires: 4,
      conversionRate: "12.5%",
      avgScore: 85,
    },
    {
      name: "Sales Representative",
      interviews: 74,
      hires: 8,
      conversionRate: "10.8%",
      avgScore: 76,
    },
    {
      name: "Marketing Specialist",
      interviews: 41,
      hires: 2,
      conversionRate: "4.9%",
      avgScore: 74,
    },
  ];

  const stageConversionData = [
    { name: "Application", value: 100 },
    { name: "Resume Screening", value: 65 },
    { name: "AI Interview", value: 40 },
    { name: "Hiring Manager", value: 25 },
    { name: "Offer", value: 12 },
    { name: "Hired", value: 10 },
  ];

  const timeToHireData = [
    { date: "Jan", days: 32 },
    { date: "Feb", days: 28 },
    { date: "Mar", days: 25 },
    { date: "Apr", days: 22 },
    { date: "May", days: 18 },
    { date: "Jun", days: 15 },
  ];

  const skillsGapData = [
    { name: "JavaScript", demand: 85, supply: 65 },
    { name: "Python", demand: 75, supply: 60 },
    { name: "React", demand: 80, supply: 55 },
    { name: "AWS", demand: 70, supply: 45 },
    { name: "SQL", demand: 65, supply: 70 },
    { name: "Leadership", demand: 60, supply: 40 },
  ];

  const diversityData = {
    gender: [
      { name: "Male", value: 58 },
      { name: "Female", value: 38 },
      { name: "Non-binary", value: 4 },
    ],
    ethnicity: [
      { name: "White", value: 45 },
      { name: "Asian", value: 25 },
      { name: "Hispanic", value: 15 },
      { name: "Black", value: 10 },
      { name: "Other", value: 5 },
    ],
  };

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

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Insights</h1>
            <p className="text-muted-foreground">
              Track your hiring performance and recruitment metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button>Export Report</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Total Interviews</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-bold">428</div>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <span>↑ 12%</span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Completion Rate</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-bold">82%</div>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <span>↑ 5%</span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Avg. Time to Hire</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-bold">15 days</div>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <span>↓ 3 days</span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Offer Acceptance</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-bold">92%</div>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <span>↓ 2%</span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </p>
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

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Activity</CardTitle>
                  <CardDescription>Number of interviews started vs completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={interviewData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
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
                  <div className="h-[300px]">
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Hiring Pipeline Conversion</CardTitle>
                  <CardDescription>Candidate progression through hiring stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stageConversionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" name="Candidates" stroke="#3b82f6" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Time to Hire Trend</CardTitle>
                  <CardDescription>Average days to hire by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeToHireData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="days" name="Days" stroke="#3b82f6" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills Gap Analysis</CardTitle>
                  <CardDescription>Demand vs. supply of skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillsGapData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="demand" name="Demand" fill="#3b82f6" />
                        <Bar dataKey="supply" name="Supply" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="candidates">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Journey</CardTitle>
                  <CardDescription>Time spent in each hiring stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { stage: "Resume Screening", avg: "2 hours", range: "1-4 hours" },
                      { stage: "AI Interview", avg: "48 hours", range: "24-72 hours" },
                      { stage: "Hiring Manager Review", avg: "3 days", range: "1-5 days" },
                      { stage: "Offer Process", avg: "5 days", range: "3-7 days" },
                    ].map((stage, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{stage.stage}</span>
                          <span className="text-muted-foreground text-sm">{stage.range}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${Math.random() * 40 + 60}%` }}
                          />
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Average: {stage.avg}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interview Completion Analysis</CardTitle>
                  <CardDescription>Reasons for incomplete interviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Technical Issues", value: 35 },
                            { name: "No Show", value: 25 },
                            { name: "Incomplete Answers", value: 20 },
                            { name: "Time Limit Exceeded", value: 15 },
                            { name: "Other", value: 5 },
                          ]}
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="diversity">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                  <CardDescription>Gender diversity of candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
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
                        <Tooltip />
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
                  <div className="h-[300px]">
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Diversity Trends</CardTitle>
                  <CardDescription>Monthly diversity metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: "Jan", diversity: 45, inclusion: 42 },
                          { month: "Feb", diversity: 48, inclusion: 45 },
                          { month: "Mar", diversity: 52, inclusion: 50 },
                          { month: "Apr", diversity: 55, inclusion: 54 },
                          { month: "May", diversity: 58, inclusion: 56 },
                          { month: "Jun", diversity: 62, inclusion: 60 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="diversity" name="Diversity Score" stroke="#3b82f6" />
                        <Line type="monotone" dataKey="inclusion" name="Inclusion Score" stroke="#10b981" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills Gap Analysis</CardTitle>
                  <CardDescription>Current demand vs. available talent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillsGapData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="demand" name="Skill Demand" fill="#3b82f6" />
                        <Bar dataKey="supply" name="Available Talent" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Required Skills</CardTitle>
                    <CardDescription>Most in-demand skills across all positions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {skillsGapData.map((skill, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{skill.name}</span>
                            <span className="text-sm">
                              <Badge variant={skill.demand > skill.supply ? "destructive" : "success"}>
                                {skill.demand > skill.supply ? "Gap" : "Surplus"}
                              </Badge>
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${(skill.supply / skill.demand) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                            <span>Supply: {skill.supply}%</span>
                            <span>Demand: {skill.demand}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skill Development Recommendations</CardTitle>
                    <CardDescription>Suggested areas for team upskilling</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {skillsGapData
                        .filter(skill => skill.demand > skill.supply)
                        .map((skill, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">{skill.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Current skill gap of {skill.demand - skill.supply}%. Consider prioritizing 
                                {skill.name} training and recruitment efforts.
                              </p>
                              <Button variant="link" className="p-0 h-auto mt-2">
                                View Training Resources →
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
