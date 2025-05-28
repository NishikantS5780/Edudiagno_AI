import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Briefcase,
  Video,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock data for demonstration
const userGrowthData = [
  { month: "Jan", users: 400, employers: 20 },
  { month: "Feb", users: 600, employers: 35 },
  { month: "Mar", users: 800, employers: 45 },
  { month: "Apr", users: 1000, employers: 55 },
  { month: "May", users: 1200, employers: 65 },
  { month: "Jun", users: 1400, employers: 75 },
];

const interviewMetricsData = [
  { month: "Jan", completed: 120, success: 85 },
  { month: "Feb", completed: 150, success: 95 },
  { month: "Mar", completed: 180, success: 110 },
  { month: "Apr", completed: 200, success: 130 },
  { month: "May", completed: 250, success: 160 },
  { month: "Jun", completed: 300, success: 190 },
];

const systemHealthData = [
  { name: "API Response Time", value: 95 },
  { name: "Server Uptime", value: 99.9 },
  { name: "Database Performance", value: 98 },
  { name: "Error Rate", value: 0.1 },
];

const AdminDashboard = () => {
  console.log("Rendering AdminDashboard");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Welcome to the admin dashboard</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>If you can see this, the component is rendering correctly.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 