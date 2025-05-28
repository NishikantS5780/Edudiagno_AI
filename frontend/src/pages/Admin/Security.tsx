import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Lock,
  FileText,
  AlertTriangle,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Globe,
  Database,
  Server,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for demonstration
const securityLogs = [
  {
    id: 1,
    timestamp: "2024-03-15 14:30:00",
    event: "Login Attempt",
    user: "john.doe@example.com",
    ip: "192.168.1.1",
    status: "success",
    details: "Successful login from Chrome browser",
  },
  {
    id: 2,
    timestamp: "2024-03-15 14:25:00",
    event: "Failed Login",
    user: "unknown",
    ip: "192.168.1.2",
    status: "failed",
    details: "Invalid credentials",
  },
];

const auditLogs = [
  {
    id: 1,
    timestamp: "2024-03-15 14:30:00",
    user: "admin@edudiagno.com",
    action: "Updated User Role",
    target: "john.doe@example.com",
    details: "Changed role from User to Admin",
  },
  {
    id: 2,
    timestamp: "2024-03-15 14:25:00",
    user: "admin@edudiagno.com",
    action: "Modified Settings",
    target: "System Settings",
    details: "Updated email notification settings",
  },
];

const SecurityCompliance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security & Compliance</h2>
          <p className="text-muted-foreground">
            Manage security settings, monitor logs, and ensure compliance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  Configure authentication and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all users
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Password Policy</h4>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Minimum Password Length</Label>
                      <Input
                        type="number"
                        value={passwordPolicy.minLength}
                        onChange={(e) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            minLength: parseInt(e.target.value),
                          })
                        }
                        min="8"
                        max="32"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            requireUppercase: checked,
                          })
                        }
                      />
                      <Label>Require Uppercase Letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            requireLowercase: checked,
                          })
                        }
                      />
                      <Label>Require Lowercase Letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            requireNumbers: checked,
                          })
                        }
                      />
                      <Label>Require Numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            requireSpecialChars: checked,
                          })
                        }
                      />
                      <Label>Require Special Characters</Label>
                    </div>
                    <div className="grid gap-2">
                      <Label>Password Expiry (days)</Label>
                      <Input
                        type="number"
                        value={passwordPolicy.expiryDays}
                        onChange={(e) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            expiryDays: parseInt(e.target.value),
                          })
                        }
                        min="30"
                        max="365"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>
                  Manage IP whitelisting and session settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>IP Whitelist</Label>
                    <Textarea
                      placeholder="Enter IP addresses (one per line)"
                      className="h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Only these IP addresses will be allowed to access the admin panel
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input type="number" defaultValue="30" min="5" max="120" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Force HTTPS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Rate Limiting</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Privacy</CardTitle>
                <CardDescription>
                  Configure data retention and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Data Retention Period (days)</Label>
                    <Input type="number" defaultValue="365" min="30" max="3650" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Data Encryption at Rest</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Data Encryption in Transit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable GDPR Compliance Tools</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Monitoring</CardTitle>
                <CardDescription>
                  Configure security alerts and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Security Alerts</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label>Alert Email Recipients</Label>
                    <Input
                      type="email"
                      placeholder="Enter email addresses (comma-separated)"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Monitor Failed Login Attempts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Monitor Suspicious Activities</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Security Logs</CardTitle>
                  <CardDescription>
                    Monitor security events and access logs
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="login">Login Attempts</SelectItem>
                      <SelectItem value="password">Password Changes</SelectItem>
                      <SelectItem value="access">Access Control</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.event}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.ip}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            log.status === "success"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Audit Trail</CardTitle>
                  <CardDescription>
                    Track system changes and user actions
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Audit Log
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.target}</TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>GDPR Compliance</CardTitle>
                <CardDescription>
                  Manage GDPR compliance settings and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable GDPR Compliance Mode</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label>Data Protection Officer Email</Label>
                    <Input type="email" placeholder="dpo@edudiagno.com" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Data Subject Rights Management</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Cookie Consent Management</Label>
                  </div>
                  <Button variant="outline" className="w-full">
                    Generate GDPR Compliance Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Subject Rights</CardTitle>
                <CardDescription>
                  Manage data subject access requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Request Processing Time (days)</Label>
                    <Input type="number" defaultValue="30" min="1" max="90" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Automated Request Processing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Data Portability</Label>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Pending Requests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>
                  Configure automated backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Automated Backups</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label>Backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Retention Period (days)</Label>
                    <Input type="number" defaultValue="30" min="1" max="365" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Backup Storage Location</Label>
                    <Select defaultValue="s3">
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                        <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" className="w-full">
                    Run Manual Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recovery Settings</CardTitle>
                <CardDescription>
                  Configure system recovery options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Point-in-Time Recovery</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label>Recovery Point Objective (minutes)</Label>
                    <Input type="number" defaultValue="15" min="1" max="1440" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Recovery Time Objective (minutes)</Label>
                    <Input type="number" defaultValue="60" min="1" max="1440" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Automated Recovery Testing</Label>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Backup History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityCompliance; 