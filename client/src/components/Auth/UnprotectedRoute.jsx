import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectCurrentToken, selectCurrentUser } from "state/authSlice";

const UnProtectedRoute = ({ children }) => {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  // If token exists and user has a role, redirect based on role
  if (token && user?.role) {
    if (user.role === "Treinador") {
      return <Navigate to="/clientes" replace />;
    }
    if (user.role === "Administrador") {
      return <Navigate to="/" replace />;
    }
  }

  // Render children if no token or no matching role
  return children;
};

export default UnProtectedRoute;
