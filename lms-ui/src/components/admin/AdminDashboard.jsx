import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';

import AdminOverview from './AdminOverview';
import CourseManagement from './CourseManagement';
import {
  ModuleManagement,
  AssignmentManagement,
  UserManagement,
  EnrollmentManagement,
  ResultManagement,
  CertificateManagement,
  SearchPage,
  SettingsPage
} from './PlaceholderComponents';

const AdminDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="courses/*" element={<CourseManagement />} />
        <Route path="modules/*" element={<ModuleManagement />} />
        <Route path="assignments/*" element={<AssignmentManagement />} />
        <Route path="users/*" element={<UserManagement />} />
        <Route path="enrollments/*" element={<EnrollmentManagement />} />
        <Route path="results/*" element={<ResultManagement />} />
        <Route path="certificates/*" element={<CertificateManagement />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="" element={<AdminOverview />} />
      </Routes>
    </Layout>
  );
};

export default AdminDashboard;