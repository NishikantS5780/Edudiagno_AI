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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Mail,
  Shield,
  Database,
  Server,
  Key,
  Bell,
  Globe,
  Lock,
  RefreshCw,
  Save,
  Trash2,
  Plus,
} from "lucide-react";

const SystemSettings = () => {
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "noreply@edudiagno.com",
    smtpPassword: "********",
    fromEmail: "noreply@edudiagno.com",
    fromName: "Edudiagno",
  });

  const [aiSettings, setAiSettings] = useState({
    modelVersion: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    enableStreaming: true,
  });

  const [maintenanceSettings, setMaintenanceSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: "System is under maintenance. Please try again later.",
    scheduledMaintenance: false,
    maintenanceStart: "",
    maintenanceEnd: "",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">
            Configure platform settings and preferences
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic platform settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input defaultValue="Edudiagno" />
                </div>
                <div className="space-y-2">
                  <Label>Platform URL</Label>
                  <Input defaultValue="https://edudiagno.com" />
                </div>
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">EST</SelectItem>
                      <SelectItem value="pst">PST</SelectItem>
                      <SelectItem value="ist">IST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="enable-registration" />
                  <Label htmlFor="enable-registration">Enable User Registration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="enable-verification" />
                  <Label htmlFor="enable-verification">Require Email Verification</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email server settings and templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    value={emailSettings.smtpHost}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    value={emailSettings.smtpPort}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Username</Label>
                  <Input
                    value={emailSettings.smtpUser}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    value={emailSettings.fromEmail}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, fromEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={emailSettings.fromName}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, fromName: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="enable-email" defaultChecked />
                  <Label htmlFor="enable-email">Enable Email Notifications</Label>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Email Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage email notification templates
                    </p>
                  </div>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Template
                  </Button>
                </div>
                <div className="grid gap-4">
                  {/* Email template list would go here */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Welcome Email</p>
                      <p className="text-sm text-muted-foreground">
                        Sent to new users upon registration
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Settings</CardTitle>
              <CardDescription>
                Configure AI model parameters and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Model Version</Label>
                  <Select
                    value={aiSettings.modelVersion}
                    onValueChange={(value) =>
                      setAiSettings({ ...aiSettings, modelVersion: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-2">Claude 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Temperature</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.temperature}
                    onChange={(e) =>
                      setAiSettings({
                        ...aiSettings,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    min="1"
                    max="4000"
                    value={aiSettings.maxTokens}
                    onChange={(e) =>
                      setAiSettings({
                        ...aiSettings,
                        maxTokens: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-streaming"
                    checked={aiSettings.enableStreaming}
                    onCheckedChange={(checked) =>
                      setAiSettings({ ...aiSettings, enableStreaming: checked })
                    }
                  />
                  <Label htmlFor="enable-streaming">Enable Streaming Responses</Label>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">API Keys</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage API keys for AI services
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add API Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New API Key</DialogTitle>
                        <DialogDescription>
                          Add a new API key for AI service integration
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Service Provider</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="anthropic">Anthropic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input type="password" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Key</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid gap-4">
                  {/* API key list would go here */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">OpenAI API Key</p>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last used: 2 hours ago
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this API key? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and access control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" min="5" max="1440" />
                </div>
                <div className="space-y-2">
                  <Label>Password Policy</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="require-uppercase" defaultChecked />
                      <Label htmlFor="require-uppercase">
                        Require uppercase letters
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="require-numbers" defaultChecked />
                      <Label htmlFor="require-numbers">Require numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="require-special" defaultChecked />
                      <Label htmlFor="require-special">
                        Require special characters
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Password Length</Label>
                      <Input type="number" defaultValue="8" min="6" max="32" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="enable-2fa" />
                      <Label htmlFor="enable-2fa">Enable 2FA for all users</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="require-2fa" />
                      <Label htmlFor="require-2fa">Require 2FA for admins</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>IP Whitelist</Label>
                  <Textarea
                    placeholder="Enter IP addresses (one per line)"
                    className="h-24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Settings</CardTitle>
              <CardDescription>
                Configure system maintenance and downtime settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setMaintenanceSettings({
                        ...maintenanceSettings,
                        maintenanceMode: checked,
                      })
                    }
                  />
                  <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
                </div>
                <div className="space-y-2">
                  <Label>Maintenance Message</Label>
                  <Textarea
                    value={maintenanceSettings.maintenanceMessage}
                    onChange={(e) =>
                      setMaintenanceSettings({
                        ...maintenanceSettings,
                        maintenanceMessage: e.target.value,
                      })
                    }
                    className="h-24"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="scheduled-maintenance"
                    checked={maintenanceSettings.scheduledMaintenance}
                    onCheckedChange={(checked) =>
                      setMaintenanceSettings({
                        ...maintenanceSettings,
                        scheduledMaintenance: checked,
                      })
                    }
                  />
                  <Label htmlFor="scheduled-maintenance">
                    Enable Scheduled Maintenance
                  </Label>
                </div>
                {maintenanceSettings.scheduledMaintenance && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Maintenance Start</Label>
                      <Input
                        type="datetime-local"
                        value={maintenanceSettings.maintenanceStart}
                        onChange={(e) =>
                          setMaintenanceSettings({
                            ...maintenanceSettings,
                            maintenanceStart: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maintenance End</Label>
                      <Input
                        type="datetime-local"
                        value={maintenanceSettings.maintenanceEnd}
                        onChange={(e) =>
                          setMaintenanceSettings({
                            ...maintenanceSettings,
                            maintenanceEnd: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings; 