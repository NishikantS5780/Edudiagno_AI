import React, { useEffect, useState } from "react";
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
import { interviewAPI } from "@/lib/api";
import { InterviewData } from "@/types/interview";

const InterviewsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [interviewsData, setInterviewsData] = useState<InterviewData[]>();

  useEffect(() => {
    const getInterviewData = async () => {
      const res = await interviewAPI.getInterviews();
      setInterviewsData(() =>
        res.data.map((interview) => {
          return {
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
          };
        })
      );
    };
    getInterviewData();
  }, []);

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
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive"
          >
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
              {/* {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))} */}
            </SelectContent>
          </Select>

          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {/* {jobs.map((job) => (
                <SelectItem key={job} value={job}>
                  {job}
                </SelectItem>
              ))} */}
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
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviewsData && interviewsData.length > 0 ? (
              interviewsData.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={null} alt={interview.firstName} />
                        <AvatarFallback>
                          {interview.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          to={`/dashboard/interviews/${interview.id}`}
                          className="font-medium hover:underline"
                        >
                          {interview.firstName} {interview.lastName}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {interview.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(interview.status)}</TableCell>
                  <TableCell>
                    {new Date(interview.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {interview.status === "completed" ? (
                      <span className={getScoreColor(interview.overallScore)}>
                        {interview.overallScore}%
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
                              <Link
                                to={`/dashboard/interviews/${interview.id}/report`}
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Report
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/dashboard/interviews/${interview.id}/transcript`}
                              >
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
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
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
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
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

export default InterviewsPage;
