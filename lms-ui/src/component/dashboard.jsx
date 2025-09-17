import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Dashboard() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
   
      if (isAdmin()) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/trainee/dashboard', { replace: true });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }


  return <LoadingSpinner message="Redirecting..." />;
}