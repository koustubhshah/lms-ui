import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { SignalRProvider } from "./contexts/SignalRContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./component/login";
import Register from "./component/register";
import Dashboard from "./component/dashboard";
import ForgotPassword from "./component/forgot-password";
import TraineeEnrollments from "./component/trainee-enrollments";
import Certificates from "./component/certificates";
import AdminDashboard from "./components/admin/AdminDashboard";
import TraineeDashboard from "./components/trainee/TraineeDashboard";
import Unauthorized from "./components/common/Unauthorized";

function App() {
  return (
    <SignalRProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trainee/*" 
          element={
            <ProtectedRoute traineeOnly>
              <TraineeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-enrollments" 
          element={
            <ProtectedRoute traineeOnly>
              <TraineeEnrollments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/certificates" 
          element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          } 
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </SignalRProvider>
  );
}

export default App;
