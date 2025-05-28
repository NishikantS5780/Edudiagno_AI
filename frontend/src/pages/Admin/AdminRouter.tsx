import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "@/routes/admin";

// Create a router specifically for admin routes
const adminRouter = createBrowserRouter(adminRoutes, {
  basename: "/admin-test", // This will make all admin routes start with /admin-test
});

const AdminRouter = () => {
  return <RouterProvider router={adminRouter} />;
};

export default AdminRouter; 