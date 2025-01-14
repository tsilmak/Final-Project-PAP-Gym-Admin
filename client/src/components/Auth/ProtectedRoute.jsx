import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectCurrentToken, selectCurrentUser } from "state/authSlice";

const ProtectedRoute = ({ children, roles }) => {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const userRole = user?.role; // Verifica se user existe antes de acessar role

  // Verifique se o usuário tem um dos roles permitidos
  if (!userRole || !roles.includes(userRole) || !token) {
    return <Navigate to="/negado" replace />;
  }

  return children;
};

export default ProtectedRoute;
