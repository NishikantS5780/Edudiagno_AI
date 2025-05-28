import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  Activity,
  AlertOctagon,
  Bell,
  Settings,
  Shield,
  Zap,
  BarChart3,
  LineChart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Mock data for demonstration
const systemMetrics = {
  cpu: {
    usage: 45,
    cores: 8,
    temperature: 65,
    load: [2.1, 1.8, 1.5, 1.2, 1.0, 0.8],
  },
  memory: {
    total: 16384,
    used: 8192,
    free: 8192,
    swap: {
      total: 4096,
      used: 1024,
      free: 3072,
    },
  },
  disk: {
    total: 512000,
    used: 256000,
    free: 256000,
    iops: 1500,
  },
  network: {
    bandwidth: {
      up: 50,
      down: 100,
    },
    connections: 250,
    latency: 25,
  },
};

const alerts = [
  {
    id: 1,
    type: "warning",
    message: "High CPU usage detected",
    timestamp: "2024-03-15 15:30",
    status: "active",
    severity: "medium",
  },
  {
    id: 2,
    type: "error",
    message: "Database connection pool exhausted",
    timestamp: "2024-03-15 15:25",
    status: "resolved",
    severity: "high",
  },
  {
    id: 3,
    type: "info",
    message: "Scheduled maintenance in 24 hours",
    timestamp: "2024-03-15 15:20",
    status: "active",
    severity: "low",
  },
];

const performanceData = [
  { time: "00:00", cpu: 30, memory: 40, disk: 25, network: 35 },
  { time: "04:00", cpu: 25, memory: 35, disk: 20, network: 30 },
  { time: "08:00", cpu: 45, memory: 50, disk: 30, network: 45 },
  { time: "12:00", cpu: 60, memory: 65, disk: 40, network: 55 },
  { time: "16:00", cpu: 55, memory: 60, disk: 35, network: 50 },
  { time: "20:00", cpu: 40, memory: 45, disk: 30, network: 40 },
  { time: "24:00", cpu: 35, memory: 40, disk: 25, network: 35 },
];

const SystemHealth = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500";
      case "resolved":
        return "bg-blue-500/10 text-blue-500";
      case "warning":
        return "bg-yellow-500/10 text-yellow-500";
      case "error":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "low":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">
            Monitor system performance, server status, and resource usage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpu.usage}%</div>
            <Progress value={systemMetrics.cpu.usage} className="mt-2" />
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +2.5% from last hour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((systemMetrics.memory.used / systemMetrics.memory.total) * 100)}%
            </div>
            <Progress
              value={(systemMetrics.memory.used / systemMetrics.memory.total) * 100}
              className="mt-2"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {systemMetrics.memory.used}GB / {systemMetrics.memory.total}GB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((systemMetrics.disk.used / systemMetrics.disk.total) * 100)}%
            </div>
            <Progress
              value={(systemMetrics.disk.used / systemMetrics.disk.total) * 100}
              className="mt-2"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {systemMetrics.disk.used}GB / {systemMetrics.disk.total}GB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.network.latency}ms</div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <div>↑ {systemMetrics.network.bandwidth.up}Mbps</div>
              <div>↓ {systemMetrics.network.bandwidth.down}Mbps</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {systemMetrics.network.connections} active connections
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="cpu"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />
                      <Area
                        type="monotone"
                        dataKey="memory"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                      />
                      <Area
                        type="monotone"
                        dataKey="disk"
                        stackId="1"
                        stroke="#ffc658"
                        fill="#ffc658"
                      />
                      <Area
                        type="monotone"
                        dataKey="network"
                        stackId="1"
                        stroke="#ff8042"
                        fill="#ff8042"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>
                  Current system alerts and warnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts
                    .filter((alert) => alert.status === "active")
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {alert.type === "error" ? (
                              <AlertOctagon className="h-4 w-4 text-red-500" />
                            ) : alert.type === "warning" ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Bell className="h-4 w-4 text-blue-500" />
                            )}
                            <p className="font-medium">{alert.message}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.timestamp}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={getSeverityColor(alert.severity)}
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Detailed system performance metrics
                  </CardDescription>
                </div>
                <Select defaultValue="24h">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="cpu"
                      stroke="#8884d8"
                      name="CPU Usage"
                    />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke="#82ca9d"
                      name="Memory Usage"
                    />
                    <Line
                      type="monotone"
                      dataKey="disk"
                      stroke="#ffc658"
                      name="Disk Usage"
                    />
                    <Line
                      type="monotone"
                      dataKey="network"
                      stroke="#ff8042"
                      name="Network Usage"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>
                    View and manage system alerts
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Alert Settings
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {alert.type === "error" ? (
                            <AlertOctagon className="h-4 w-4 text-red-500" />
                          ) : alert.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Bell className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="capitalize">{alert.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{alert.message}</TableCell>
                      <TableCell>{alert.timestamp}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(alert.status)}
                        >
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getSeverityColor(alert.severity)}
                        >
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>
                    View and analyze system logs
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Logs
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="rounded-md border">
                <div className="h-[400px] overflow-auto p-4 font-mono text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500">[ERROR]</span>
                      <span>Database connection failed: Connection timeout</span>
                      <span className="text-muted-foreground">2024-03-15 15:30:45</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-500">[WARNING]</span>
                      <span>High CPU usage detected: 85%</span>
                      <span className="text-muted-foreground">2024-03-15 15:30:40</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500">[INFO]</span>
                      <span>User authentication successful: user_id=12345</span>
                      <span className="text-muted-foreground">2024-03-15 15:30:35</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500">[DEBUG]</span>
                      <span>API request completed: /api/v1/users (200)</span>
                      <span className="text-muted-foreground">2024-03-15 15:30:30</span>
                    </div>
                    {/* Add more log entries as needed */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealth; 