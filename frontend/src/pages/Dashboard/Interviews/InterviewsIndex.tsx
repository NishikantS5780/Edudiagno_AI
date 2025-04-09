
import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  FileText,
  Share,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock interview data
const interviewsData = [
  {
    id: "int-1",
    candidate: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "",
    },
    job: "Senior Frontend Developer",
    department: "Engineering",
    score: 87,
    status: "completed",
    date: "Apr 5, 2023",
    duration: "32 min",
  },
  {
    id: "int-2",
    candidate: {
      name: "Michael Johnson",
      email: "michael.johnson@example.com",
      avatar: "",
    },
    job: "Product Marketing Manager",
    department: "Marketing",
    score: 92,
    status: "completed",
    date: "Apr 4, 2023",
    duration: "28 min",
  },
  {
    id: "int-3",
    candidate: {
      name: "David Lee",
      email: "david.lee@example.com",
      avatar: "",
    },
    job: "UX Designer",
    department: "Design",
    score: 79,
    status: "completed",
    date: "Apr 3, 2023",
    duration: "35 min",
  },
  {
    id: "int-4",
    candidate: {
      name: "Sarah Miller",
      email: "sarah.miller@example.com",
      avatar: "",
    },
    job: "DevOps Engineer",
    department: "Engineering",
    score: 0,
    status: "scheduled",
    date: "Apr 8, 2023",
    duration: "Not started",
  },
  {
    id: "int-5",
    candidate: {
      name: "Robert Wilson",
      email: "robert.wilson@example.com",
      avatar: "",
    },
    job: "Account Executive",
    department: "Sales",
    score: 0,
    status: "scheduled",
    date: "Apr 10, 2023",
    duration: "Not started",
  },
  {
    id: "int-6",
    candidate: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      avatar: "",
    },
    job: "Content Writer",
    department: "Marketing",
    score: 68,
    status: "completed",
    date: "Apr 2, 2023",
    duration: "29 min",
  },
  {
    id: "int-7",
    candidate: {
      name: "James Brown",
      email: "james.brown@example.com",
      avatar: "",
    },
    job: "Backend Developer",
    department: "Engineering",
    score: 90,
    status: "completed",
    date: "Apr 1, 2023",
    duration: "40 min",
  },
  {
    id: "int-8",
    candidate: {
      name: "Jennifer Martinez",
      email: "jennifer.martinez@example.com",
      avatar: "",
    },
    job: "HR Specialist",
    department: "Human Resources",
    score: 0,
    status: "cancelled",
    date: "Mar 31, 2023",
    duration: "Cancelled",
  },
  {
    id: "int-9",
    candidate: {
      name: "Daniel Taylor",
      email: "daniel.taylor@example.com",
      avatar: "",
    },
    job: "Financial Analyst",
    department: "Finance",
    score: 0,
    status: "pending",
    date: "Apr 15, 2023",
    duration: "Waiting for candidate",
  },
  {
    id: "int-10",
    candidate: {
      name: "Lisa Anderson",
      email: "lisa.anderson@example.com",
      avatar: "",
    },
    job: "Mobile Developer",
    department: "Engineering",
    score: 85,
    status: "completed",
    date: "Mar 30, 2023",
    duration: "33 min",
  },
];

const InterviewsIndex = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");

  // Filter interviews based on search query and filters
  const filteredInterviews = interviewsData.filter((interview) => {
    // Search filter
    const matchesSearch = interview.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.job.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;

    // Department filter
    const matchesDepartment = departmentFilter === "all" || interview.department === departmentFilter;

    // Job filter
    const matchesJob = jobFilter === "all" || interview.job === jobFilter;

    return matchesSearch && matchesStatus && matchesDepartment && matchesJob;
  });

  // Get unique departments and jobs for filter dropdowns
  const departments = Array.from(new Set(interviewsData.map(interview => interview.department)));
  const jobs = Array.from(new Set(interviewsData.map(interview => interview.job)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-success/10 text-success">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-brand/10 text-brand">
            <Calendar className="h-3 w-3 mr-1" /> Scheduled
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return "text-muted-foreground";
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-brand";
    return "text-destructive";
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="AI Interviews" 
        description="Manage and review AI-conducted candidate interviews"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates or jobs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job} value={job}>{job}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInterviews.length > 0 ? (
              filteredInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={interview.candidate.avatar} alt={interview.candidate.name} />
                        <AvatarFallback>
                          {interview.candidate.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to={`/dashboard/interviews/${interview.id}`} className="font-medium hover:underline">
                          {interview.candidate.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {interview.candidate.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {interview.job}
                      <div className="text-xs text-muted-foreground">
                        {interview.department}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(interview.status)}</TableCell>
                  <TableCell>{interview.date}</TableCell>
                  <TableCell>{interview.duration}</TableCell>
                  <TableCell>
                    {interview.status === "completed" ? (
                      <span className={getScoreColor(interview.score)}>
                        {interview.score}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/interviews/${interview.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {interview.status === "completed" && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/interviews/${interview.id}/report`}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Report
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/interviews/${interview.id}/transcript`}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Transcript
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share Interview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No interviews found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </DashboardLayout>
  );
};

export default InterviewsIndex;
