import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  BarChart3,
  Settings,
  FileText,
  Shield,
  CreditCard,
  MessageSquare,
  Link2,
  Activity,
  Code2,
  FileSpreadsheet,
  ClipboardCheck,
  Menu,
  X,
  Search,
  Bell,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const navigation = [
  {
    title: "User Management",
    icon: Users,
    href: "/admin-test/users",
    color: "text-blue-500",
  },
  {
    title: "Platform Analytics",
    icon: BarChart3,
    href: "/admin-test/analytics",
    color: "text-violet-500",
  },
  {
    title: "System Settings",
    icon: Settings,
    href: "/admin-test/settings",
    color: "text-green-500",
  },
  {
    title: "Content Management",
    icon: FileText,
    href: "/admin-test/content",
    color: "text-orange-500",
  },
  {
    title: "Security & Compliance",
    icon: Shield,
    href: "/admin-test/security",
    color: "text-red-500",
  },
  {
    title: "Billing & Subscription",
    icon: CreditCard,
    href: "/admin-test/billing",
    color: "text-emerald-500",
  },
  {
    title: "Support & Communication",
    icon: MessageSquare,
    href: "/admin-test/support",
    color: "text-pink-500",
  },
  {
    title: "Integration Management",
    icon: Link2,
    href: "/admin-test/integrations",
    color: "text-cyan-500",
  },
  {
    title: "System Health",
    icon: Activity,
    href: "/admin-test/health",
    color: "text-yellow-500",
  },
  {
    title: "Development & Testing",
    icon: Code2,
    href: "/admin-test/development",
    color: "text-purple-500",
  },
  {
    title: "Reporting & Export",
    icon: FileSpreadsheet,
    href: "/admin-test/reports",
    color: "text-indigo-500",
  },
  {
    title: "Audit & Compliance",
    icon: ClipboardCheck,
    href: "/admin-test/audit",
    color: "text-rose-500",
  },
];

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Current location:", location.pathname);
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <Link to="/admin-test" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Edudiagno Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="w-[200px] pl-8"
                />
              </div>
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-4 w-4 p-0">3</Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r bg-background md:sticky md:block",
            isSidebarOpen && "block"
          )}
        >
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <div className="space-y-1">
              {navigation.map((item) => (
                <div key={item.href}>
                  <Button
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      location.pathname === item.href && "bg-muted font-medium"
                    )}
                    onClick={() => {
                      console.log("Navigating to:", item.href);
                      navigate(item.href);
                    }}
                  >
                    <item.icon className={cn("mr-2 h-4 w-4", item.color)} />
                    {item.title}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 