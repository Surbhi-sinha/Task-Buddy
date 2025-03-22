import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Get the current user from AuthContext

  // If the user is not logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/" />;
  }

  // If the user is logged in, render the children (protected content)
  return children;
};

export default ProtectedRoute;