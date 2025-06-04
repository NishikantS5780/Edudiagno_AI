import { useEffect, useState } from "react";
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
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterviewData } from "@/types/interview";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { interviewAPI } from "@/services/interviewAPI";
import { jobAPI } from "@/services/jobApi";

const InterviewsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [interviewToDelete, setInterviewToDelete] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [interviewsData, setInterviewsData] = useState<InterviewData[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    interviewAPI
      .getInterviews({
        start: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      })
      .then((res) => {
        const jobIds = res.data.interviews.map(
          (interview: any) => interview.job_id
        ) as number[];
        const uniqueJobIds = Array.from(new Set(jobIds));

        const jobTitlePromises = uniqueJobIds.map(async (jobId) => {
          try {
            const jobRes = await jobAPI.getCurrentRecruiterJob(
              jobId.toString()
            );
            return { jobId, title: jobRes.data.title };
          } catch (error) {
            console.error(`Error fetching job ${jobId}:`, error);
            return { jobId, title: "Unknown Job" };
          }
        });

        Promise.all(jobTitlePromises).then((values) => {
          const jobTitlesMap = values.reduce((acc, { jobId, title }) => {
            acc[jobId] = title;
            return acc;
          }, {} as Record<number, string>);
        });

        const totalCount = res.data.count;
        setTotalPages(Math.ceil(totalCount / itemsPerPage));

        setInterviewsData(res.data.interviews);
      });
  }, []);

  // const deleteInterviewMutation = useMutation({
  //   mutationFn: (id: number) => interviewAPI.deleteInterview(id),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["interviews"] });
  //     toast.success("Interview deleted successfully");
  //   },
  //   onError: (error) => {
  //     console.error("Error deleting interview:", error);
  //     toast.error("Failed to delete interview");
  //   },
  // });

  const handleDeleteInterview = (id: number) => {
    setInterviewToDelete(id);
  };

  // const confirmDelete = () => {
  //   if (interviewToDelete) {
  //     deleteInterviewMutation.mutate(interviewToDelete);
  //     setInterviewToDelete(null);
  //   }
  // };

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
      <div className="container mx-auto py-6">
        <PageHeader
          title="Interviews"
          description="Manage and track all your interviews"
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
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[140px]">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="90-100">90-100%</SelectItem>
                <SelectItem value="80-89">80-89%</SelectItem>
                <SelectItem value="70-79">70-79%</SelectItem>
                <SelectItem value="60-69">60-69%</SelectItem>
                <SelectItem value="0-59">0-59%</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-[150px] hidden">
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
              <SelectTrigger className="w-[180px] hidden">
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
                <TableHead>Job Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviewsData && interviewsData.length > 0 ? (
                interviewsData
                  .filter((interview: InterviewData) => {
                    console.log("Filtering interview:", interview);
                    // Filter by score
                    if (scoreFilter !== "all") {
                      const score = interview.overall_score || 0;
                      const [min, max] = scoreFilter.split("-").map(Number);
                      console.log("Score filter:", { score, min, max });
                      if (score < min || score > max) {
                        console.log("Interview filtered out by score");
                        return false;
                      }
                    }

                    // Filter by search query
                    if (searchQuery) {
                      const searchLower = searchQuery.toLowerCase();
                      const matches =
                        interview.first_name
                          ?.toLowerCase()
                          .includes(searchLower) ||
                        interview.last_name
                          ?.toLowerCase()
                          .includes(searchLower) ||
                        interview.email?.toLowerCase().includes(searchLower);
                      console.log("Search filter:", { searchLower, matches });
                      if (!matches) {
                        console.log("Interview filtered out by search");
                        return false;
                      }
                    }

                    console.log("Interview passed all filters");
                    return true;
                  })
                  .map((interview: InterviewData) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={undefined}
                              alt={interview.first_name}
                            />
                            <AvatarFallback>
                              {interview.first_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              to={`/dashboard/interviews/${interview.id}`}
                              className="font-medium hover:underline"
                            >
                              {interview.first_name} {interview.last_name}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {interview.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* {interview.job_id ? (
                          <Link
                            to={`/dashboard/jobs/${interview.job_id}`}
                            className="text-sm hover:underline"
                          >
                            {interviewsData.j[interview.jobId] ||
                              "Loading..."}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )} */}
                      </TableCell>
                      <TableCell>
                        {interview.created_at &&
                          new Date(interview.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {interview.overall_score ? (
                          <span
                            className={getScoreColor(interview.overall_score)}
                          >
                            {interview.overall_score}%
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
                            <DropdownMenuItem>
                              <Link
                                to={`/dashboard/interviews/${interview.id}`}
                                className="flex items-center"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                to={`/dashboard/interviews/${interview.id}/report`}
                                className="flex items-center"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View Report
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleDeleteInterview(interview.id!)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Interview
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
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={interviewToDelete !== null}
        onOpenChange={() => setInterviewToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {/* <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default InterviewsPage;
