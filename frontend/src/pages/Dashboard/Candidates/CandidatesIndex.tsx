
import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Calendar,
  Star,
  DownloadCloud,
  Mail,
  Phone,
  ChevronRight,
  FilePlus,
} from "lucide-react";

// Mock candidates data
const candidatesData = [
  {
    id: "cand-1",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "(555) 123-4567",
    avatar: "",
    jobTitle: "Senior Frontend Developer",
    status: "interviewed",
    score: 87,
    matchPercentage: 92,
    lastActivity: "2 days ago",
    appliedDate: "Apr 5, 2023",
    location: "San Francisco, CA",
    tags: ["React", "TypeScript", "UI/UX"],
  },
  {
    id: "cand-2",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "(555) 987-6543",
    avatar: "",
    jobTitle: "Full Stack Developer",
    status: "screening",
    score: 0,
    matchPercentage: 85,
    lastActivity: "Just now",
    appliedDate: "Apr 7, 2023",
    location: "Remote",
    tags: ["Node.js", "React", "MongoDB"],
  },
  {
    id: "cand-3",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "(555) 456-7890",
    avatar: "",
    jobTitle: "UX Designer",
    status: "shortlisted",
    score: 92,
    matchPercentage: 95,
    lastActivity: "5 days ago",
    appliedDate: "Apr 2, 2023",
    location: "New York, NY",
    tags: ["Figma", "User Research", "Prototyping"],
  },
  {
    id: "cand-4",
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "(555) 321-6549",
    avatar: "",
    jobTitle: "DevOps Engineer",
    status: "rejected",
    score: 65,
    matchPercentage: 70,
    lastActivity: "1 week ago",
    appliedDate: "Apr 1, 2023",
    location: "Austin, TX",
    tags: ["AWS", "Kubernetes", "CI/CD"],
  },
  {
    id: "cand-5",
    name: "Sarah Thompson",
    email: "sarah.thompson@example.com",
    phone: "(555) 789-0123",
    avatar: "",
    jobTitle: "Product Manager",
    status: "new",
    score: 0,
    matchPercentage: 88,
    lastActivity: "3 hours ago",
    appliedDate: "Apr 8, 2023",
    location: "Chicago, IL",
    tags: ["Agile", "Product Strategy", "Stakeholder Management"],
  },
];

const CandidatesIndex = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [viewType, setViewType] = useState("table");

  // Filter candidates based on search query and filters
  const filteredCandidates = candidatesData.filter((candidate) => {
    const matchesSearch =
      searchQuery === "" ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || candidate.status === statusFilter;

    const matchesJob =
      jobFilter === "all" || candidate.jobTitle.includes(jobFilter);

    return matchesSearch && matchesStatus && matchesJob;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            New
          </Badge>
        );
      case "screening":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Resume Screening
          </Badge>
        );
      case "interviewed":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Interviewed
          </Badge>
        );
      case "shortlisted":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Shortlisted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Candidates"
        description="Manage and track all candidates in your hiring pipeline"
      />

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="screening">Resume Screening</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Job</SelectLabel>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="Frontend">Frontend Developer</SelectItem>
                <SelectItem value="Full Stack">Full Stack Developer</SelectItem>
                <SelectItem value="UX">UX Designer</SelectItem>
                <SelectItem value="DevOps">DevOps Engineer</SelectItem>
                <SelectItem value="Product">Product Manager</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View options */}
      <div className="flex justify-between items-center mb-4">
        <Tabs value={viewType} onValueChange={setViewType}>
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>
        
          {/* Table View */}
          <TabsContent value="table" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Status
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Match
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Applied
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-muted-foreground mb-2">No candidates match your filters</p>
                          <Button variant="outline" onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                            setJobFilter("all");
                          }}>
                            Clear Filters
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                                <AvatarFallback className="bg-brand/10 text-brand">
                                  {candidate.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{candidate.name}</div>
                                <div className="text-sm text-muted-foreground">{candidate.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{candidate.jobTitle}</div>
                            <div className="text-sm text-muted-foreground">{candidate.location}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={candidate.matchPercentage} className="h-2 w-16" />
                              <span className="text-sm font-medium">{candidate.matchPercentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.appliedDate}</TableCell>
                          <TableCell className="text-right">
                            <Link to={`/dashboard/candidates/${candidate.id}`}>
                              <Button variant="ghost" size="sm">
                                View <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Card View */}
          <TabsContent value="cards" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">No candidates match your filters</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setJobFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredCandidates.map((candidate) => (
                  <Card key={candidate.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={candidate.avatar} alt={candidate.name} />
                            <AvatarFallback className="bg-brand/10 text-brand text-lg">
                              {candidate.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{candidate.name}</CardTitle>
                            <CardDescription>{candidate.jobTitle}</CardDescription>
                          </div>
                        </div>
                        {candidate.status === "shortlisted" && (
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate">{candidate.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{candidate.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{candidate.appliedDate}</span>
                          </div>
                          <div>
                            {getStatusBadge(candidate.status)}
                          </div>
                        </div>
                        
                        <div className="pt-1">
                          <div className="text-sm mb-1 flex justify-between">
                            <span>Match Score</span>
                            <span className="font-semibold">{candidate.matchPercentage}%</span>
                          </div>
                          <Progress value={candidate.matchPercentage} className="h-2" />
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-1">
                          {candidate.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="font-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <div className="border-t p-3 flex justify-end">
                      <Link to={`/dashboard/candidates/${candidate.id}`}>
                        <Button variant="ghost" size="sm">
                          View Profile <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex gap-2 justify-end mb-6">
        <Button variant="outline" size="sm">
          <DownloadCloud className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button size="sm" asChild>
          <Link to="/dashboard/candidates/upload">
            <FilePlus className="h-4 w-4 mr-2" />
            Import Candidates
          </Link>
        </Button>
      </div>

    </DashboardLayout>
  );
};

export default CandidatesIndex;
