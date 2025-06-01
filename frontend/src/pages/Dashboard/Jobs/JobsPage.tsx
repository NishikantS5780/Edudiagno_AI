import React, { useState, useEffect } from "react";
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
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Share,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { JobData } from "@/types/job";
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
import { jobAPI } from "@/services/jobApi";

const JobsPage = () => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<
    "title" | "department" | "city" | "type" | "show_salary" | "status"
  >("title");
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">(
    "ascending"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Function to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Get unique departments and cities from jobs data
  const departments = React.useMemo(() => {
    const uniqueDepts = new Set(
      jobs.map((job) => job.department).filter(Boolean)
    );
    return Array.from(uniqueDepts).sort();
  }, [jobs]);

  const cities = React.useMemo(() => {
    const uniqueCities = new Set(jobs.map((job) => job.city).filter(Boolean));
    return Array.from(uniqueCities).sort();
  }, [jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getCurrentRecruiterAllJobs({
        sort: sortOrder,
        sort_field: sortField,
        start: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      });

      const data = response.data;
      const totalCount = parseInt(response.headers["x-total-count"] || "0");
      setTotalPages(Math.ceil(totalCount / itemsPerPage));

      const jobsData = data.map(
        (jobData: {
          id: number;
          title: string;
          department: string;
          city: string;
          type: string;
          status: string;
          created_at?: string;
        }) => {
          const date = jobData.created_at
            ? new Date(jobData.created_at.replace("Z", ""))
            : new Date();
          return {
            id: jobData.id,
            title: jobData.title,
            department: jobData.department,
            city: jobData.city,
            type: jobData.type,
            status: jobData.status,
            createdAt: date,
          };
        }
      );
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever jobs, searchQuery, or filters change
  useEffect(() => {
    let filtered = [...jobs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.department.toLowerCase().includes(query) ||
          job.city.toLowerCase().includes(query)
      );
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((job) => job.department === departmentFilter);
    }

    // Apply city filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((job) => job.city === cityFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, departmentFilter, cityFilter, statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [sortField, sortOrder, currentPage]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-success/10 text-success">
            <CheckCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> Draft
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive"
          >
            <XCircle className="h-3 w-3 mr-1" /> Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      const response = await jobAPI.deleteJob(jobId.toString());
      if (response.status === 204) {
        toast.success("Job deleted successfully");
        await fetchJobs();
      } else {
        throw new Error("Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    } finally {
      setJobToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Format the date as MM/DD/YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const copyInterviewLink = async (jobId: number) => {
    try {
      if (!jobId || isNaN(jobId)) {
        toast.error("Invalid job ID");
        return;
      }

      const interviewLink = `${window.location.origin}/interview?job_id=${jobId}`;
      await navigator.clipboard.writeText(interviewLink);
      toast.success("Interview link copied to clipboard", {
        description: interviewLink,
      });
    } catch (error) {
      console.error("Error creating interview link:", error);
      toast.error("Failed to create interview link");
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "ascending" ? "descending" : "ascending");
    } else {
      setSortField(field);
      setSortOrder("ascending");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Jobs" description="Manage your job postings">
          <Link to="/dashboard/jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </Link>
        </PageHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {capitalizeWords(dept)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {capitalizeWords(city)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jobs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center">
                      Job Title
                      {sortField === "title" && (
                        <ChevronDown
                          className={`h-4 w-4 ml-1 transition-transform ${
                            sortOrder === "descending" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("department")}
                  >
                    <div className="flex items-center">
                      Department
                      {sortField === "department" && (
                        <ChevronDown
                          className={`h-4 w-4 ml-1 transition-transform ${
                            sortOrder === "descending" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("city")}
                  >
                    <div className="flex items-center">
                      City
                      {sortField === "city" && (
                        <ChevronDown
                          className={`h-4 w-4 ml-1 transition-transform ${
                            sortOrder === "descending" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === "status" && (
                        <ChevronDown
                          className={`h-4 w-4 ml-1 transition-transform ${
                            sortOrder === "descending" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{capitalizeWords(job.department)}</TableCell>
                      <TableCell>{capitalizeWords(job.city)}</TableCell>
                      <TableCell>{capitalizeWords(job.type)}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{formatDate(job.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/jobs/${job.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/jobs/${job.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyInterviewLink(job.id)}
                            >
                              <Share className="mr-2 h-4 w-4" />
                              Copy Interview Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setJobToDelete(job.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* First page */}
                {currentPage > 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Ellipsis if needed */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Current page and surrounding pages */}
                {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
                  .filter((page) => page > 0 && page <= totalPages)
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                {/* Ellipsis if needed */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Last page */}
                {currentPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!jobToDelete}
          onOpenChange={() => setJobToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                job posting and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default JobsPage;
