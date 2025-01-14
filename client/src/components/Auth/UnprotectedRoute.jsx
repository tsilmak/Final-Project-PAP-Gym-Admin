import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectCurrentToken, selectCurrentUser } from "state/authSlice";

const UnProtectedRoute = ({ children }) => {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  // Ensure that 'user' exists before checking properties
  if (token || user) {
    return <Navigate to="/" replace />;
  }

  // Render the children if not authenticated
  return children;
};

export default UnProtectedRoute;
