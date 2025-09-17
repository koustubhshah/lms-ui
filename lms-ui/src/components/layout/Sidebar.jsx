import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileCheck,
  GraduationCap,
  Award,
  Search,
  BarChart3,
  UserCircle,
  Settings,
  FileText
} from 'lucide-react';

const Sidebar = ({ userRole }) => {
  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
    { icon: FileText, label: 'Modules', path: '/admin/modules' },
    { icon: FileCheck, label: 'Assignments', path: '/admin/assignments' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: GraduationCap, label: 'Enrollments', path: '/admin/enrollments' },
    { icon: BarChart3, label: 'Results', path: '/admin/results' },
    { icon: Award, label: 'Certificates', path: '/admin/certificates' },
    { icon: Search, label: 'Search', path: '/admin/search' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const traineeMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/trainee/dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/trainee/courses' },
    { icon: Search, label: 'Browse Courses', path: '/trainee/browse' },
    { icon: FileCheck, label: 'Assignments', path: '/trainee/assignments' },
    { icon: BarChart3, label: 'My Progress', path: '/trainee/progress' },
    { icon: Award, label: 'Certificates', path: '/trainee/certificates' },
    { icon: UserCircle, label: 'Profile', path: '/trainee/profile' },
  ];

  const menuItems = userRole === 'Admin' ? adminMenuItems : traineeMenuItems;

  return (
    <nav className="mt-8 px-4 space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-white text-slate-900 shadow-lg' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            <Icon className="h-5 w-5 mr-3" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Sidebar;