import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const userRole = localStorage.getItem("role"); // get stored role

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // For "user" role, allow staff, manager, financial staff, physical staff, registrar and admin (admins should be able to access user pages)
  if (role === "user" && !["staff", "manager", "admin", "financialStaff", "physicalStaff", "registrar"].includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // For admin role, strictly check
  if (role === "admin" && userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
