import {useAuthQuery} from "../hooks/api/useAuthQuery.ts";
import {Navigate} from "react-router-dom";
import React from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isError } = useAuthQuery();

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;