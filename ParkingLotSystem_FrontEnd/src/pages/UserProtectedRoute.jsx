import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const UserProtectedRoute = () => {
  const token = Cookies.get("token");
  const user = JSON.parse(localStorage.getItem("user"));
  
    if (!token || !user || user.role !== "User") {
      return <Navigate to="/" />;
    }
  
    return <Outlet />;
};

export default UserProtectedRoute;
