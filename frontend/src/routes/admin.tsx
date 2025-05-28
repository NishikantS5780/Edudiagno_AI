import { RouteObject } from "react-router-dom";
import AdminLayout from "@/pages/Admin/AdminLayout";
import AdminDashboard from "@/pages/Admin/Dashboard";
import UserManagement from "@/pages/Admin/Users";
import DevelopmentManagement from "@/pages/Admin/Development";
import ContentManagement from "@/pages/Admin/Content";
import SecurityCompliance from "@/pages/Admin/Security";
import SystemHealth from "@/pages/Admin/Health";
import SystemSettings from "@/pages/Admin/Settings";
import PlatformAnalytics from "@/pages/Admin/Analytics";
import BillingManagement from "@/pages/Admin/Billing";
import IntegrationManagement from "@/pages/Admin/Integrations";
import SupportManagement from "@/pages/Admin/Support";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin-test",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "development",
        element: <DevelopmentManagement />,
      },
      {
        path: "content",
        element: <ContentManagement />,
      },
      {
        path: "security",
        element: <SecurityCompliance />,
      },
      {
        path: "health",
        element: <SystemHealth />,
      },
      {
        path: "settings",
        element: <SystemSettings />,
      },
      {
        path: "analytics",
        element: <PlatformAnalytics />,
      },
      {
        path: "billing",
        element: <BillingManagement />,
      },
      {
        path: "integrations",
        element: <IntegrationManagement />,
      },
      {
        path: "support",
        element: <SupportManagement />,
      },
      // Additional routes can be added here as they are created
      // {
      //   path: "reports",
      //   element: <Reports />,
      // },
      // {
      //   path: "audit",
      //   element: <Audit />,
      // },
    ],
  },
]; 