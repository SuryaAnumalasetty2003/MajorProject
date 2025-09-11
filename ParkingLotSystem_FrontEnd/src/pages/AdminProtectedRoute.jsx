import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user || user.role !== "Admin") {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
