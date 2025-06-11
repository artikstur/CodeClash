import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthQuery } from "../hooks/api/useAuthQuery";

const AuthRedirect = () => {
  const { isLoading, isError } = useAuthQuery();

  if (isLoading) return <div>Загрузка...</div>;
  if (isError) return <Navigate to="/login" replace />;

  return <Navigate to="/main" replace />;
};

export default AuthRedirect;
