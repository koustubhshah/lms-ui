import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Dashboard() {
  const { user, loading, isAdmin, isTrainee } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard useEffect - Loading:', loading, 'User:', user);
    
    if (!loading) {
      if (user) {
        console.log('User is authenticated, role:', user.role);
        console.log('isAdmin():', isAdmin());
        console.log('isTrainee():', isTrainee());
        
        if (isAdmin()) {
          console.log('Redirecting to admin dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else if (isTrainee()) {
          console.log('Redirecting to trainee dashboard');
          navigate('/trainee/dashboard', { replace: true });
        } else {
          console.log('User role not recognized, redirecting to login');
          navigate('/login', { replace: true });
        }
      } else {
        console.log('No user found, redirecting to login');
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, isAdmin, isTrainee, navigate]);

  if (loading) {
    console.log('Showing loading spinner');
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  console.log('Rendering redirect message');
  return <LoadingSpinner message="Redirecting..." />;
}