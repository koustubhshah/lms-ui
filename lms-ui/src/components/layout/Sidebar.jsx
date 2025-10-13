import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  FileText,
  ChevronDown,
  Home,
  Bookmark,
  Clock,
  Bell,
  HelpCircle,
  MessageSquare,
  Calendar,
  Star,
  Download,
  Upload,
  LogOut
} from 'lucide-react';

const MenuSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
      {title}
    </h3>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

// Default icon component in case the provided icon is undefined
const DefaultIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

const NavItem = ({ icon: Icon, label, path, badge, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Use the provided icon or fallback to DefaultIcon
  const IconComponent = Icon || DefaultIcon;
  
  return (
    <NavLink
      to={path}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={({ isActive }) => `
        group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white'
        }
      `}
    >
      <div className="flex items-center">
        <div className={`
          p-1.5 mr-3 rounded-lg transition-all duration-200 flex items-center justify-center
          ${isActive 
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500 dark:bg-gray-700/50 dark:group-hover:bg-blue-900/30'
          }`}
        >
          <IconComponent className="h-4 w-4 flex-shrink-0" />
        </div>
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          {badge}
        </span>
      )}
      {isHovered && (
        <div className="ml-2 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300">
          <ChevronDown className="h-4 w-4" />
        </div>
      )}
    </NavLink>
  );
};

const CollapsibleMenu = ({ icon: Icon, label, items, isOpen: isOpenProp, onToggle }) => {
  const [isOpen, setIsOpen] = useState(isOpenProp || false);
  const location = useLocation();
  
  const isActive = items.some(item => location.pathname.startsWith(item.path));
  
  const handleToggle = (e) => {
    e.preventDefault();
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle(newState);
  };

  // Use the provided icon or fallback to DefaultIcon
  const IconComponent = Icon || DefaultIcon;

  return (
    <div className="space-y-1">
      <button
        onClick={handleToggle}
        className={`
          w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
          ${isActive 
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white'
          }
        `}
      >
        <div className="flex items-center">
          <div className={`
            p-1.5 mr-3 rounded-lg transition-all duration-200 flex items-center justify-center
            ${isActive 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
              : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500 dark:bg-gray-700/50 dark:group-hover:bg-blue-900/30'
            }`}
          >
            <IconComponent className="h-4 w-4 flex-shrink-0" />
          </div>
          <span>{label}</span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="py-1 pl-4 space-y-1">
          {items.map((item) => (
            <NavItem 
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ userRole }) => {
  const [openMenus, setOpenMenus] = useState({});
  const isAdmin = userRole === 'Admin';

  const handleMenuToggle = (menu, isOpen) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: isOpen
    }));
  };

  const adminMenuSections = [
    {
      title: 'Management',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          path: '/admin/dashboard',
          badge: ''
        },
        {
          icon: BarChart3,
          label: 'Progress',
          path: '/admin/progress',
        },
        {
          icon: BookOpen,
          label: 'Courses',
          path: '/admin/courses',
          badge: '5',
          subItems: [
            { label: 'All Courses', path: '/admin/courses' },
            { label: 'Add New', path: '/admin/courses/new' },
            { label: 'Categories', path: '/admin/courses/categories' }
          ]
        },
        {
          icon: FileText,
          label: 'Content',
          path: '/admin/content',
          subItems: [
            { label: 'Modules', path: '/admin/modules' },
            { label: 'Lessons', path: '/admin/lessons' },
            { label: 'Resources', path: '/admin/resources' }
          ]
        },
        {
          icon: Users,
          label: 'Users',
          path: '/admin/users',
          badge: '3 new',
          subItems: [
            { label: 'All Users', path: '/admin/users' },
            { label: 'Pending Requests', path: '/admin/users/pending-requests', badge: '3' },
            { label: 'Roles', path: '/admin/users/roles' },
            { label: 'Permissions', path: '/admin/users/permissions' }
          ]
        },
        {
          icon: GraduationCap,
          label: 'Enrollments',
          path: '/admin/enrollments',
          subItems: [
            { label: 'All Enrollments', path: '/admin/enrollments' },
            { label: 'Reports', path: '/admin/enrollments/reports' }
          ]
        },
        {
          icon: BarChart3,
          label: 'Analytics',
          path: '/admin/analytics',
          subItems: [
            { label: 'Overview', path: '/admin/analytics' },
            { label: 'Course Stats', path: '/admin/analytics/courses' },
            { label: 'User Activity', path: '/admin/analytics/activity' }
          ]
        },
        {
          icon: FileCheck,
          label: 'Results',
          path: '/admin/results',
        },
        {
          icon: Award,
          label: 'Certificates',
          path: '/admin/certificates',
        }
      ]
    },
    {
      title: 'Tools',
      items: [
        {
          icon: Settings,
          label: 'Settings',
          path: '/admin/settings',
          subItems: [
            { label: 'General', path: '/admin/settings/general' },
            { label: 'Appearance', path: '/admin/settings/appearance' },
            { label: 'Notifications', path: '/admin/settings/notifications' }
          ]
        },
        {
          icon: HelpCircle,
          label: 'Help & Support',
          path: '/admin/support',
          badge: 'New'
        }
      ]
    }
  ];

  const traineeMenuSections = [
    {
      title: 'Learning',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          path: '/trainee/dashboard',
          badge: ''
        },
        {
          icon: BookOpen,
          label: 'My Courses',
          path: '/trainee/courses',
          badge: '3',
          subItems: [
            { label: 'All Courses', path: '/trainee/courses' },
            { label: 'In Progress', path: '/trainee/courses/in-progress' },
            { label: 'Completed', path: '/trainee/courses/completed' }
          ]
        },
        {
          icon: Search,
          label: 'Browse Courses',
          path: '/trainee/browse',
          badge: 'New'
        },
        {
          icon: FileCheck,
          label: 'Assignments',
          path: '/trainee/assignments',
          badge: '2 due',
          subItems: [
            { label: 'Pending', path: '/trainee/assignments/pending' },
            { label: 'Submitted', path: '/trainee/assignments/submitted' },
            { label: 'Graded', path: '/trainee/assignments/graded' }
          ]
        },
        {
          icon: BarChart3,
          label: 'My Progress',
          path: '/trainee/progress',
          subItems: [
            { label: 'Overview', path: '/trainee/progress' },
            { label: 'Achievements', path: '/trainee/progress/achievements' },
            { label: 'Certificates', path: '/trainee/progress/certificates' }
          ]
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          icon: UserCircle,
          label: 'Profile',
          path: '/trainee/profile',
          subItems: [
            { label: 'Edit Profile', path: '/trainee/profile/edit' },
            { label: 'Preferences', path: '/trainee/profile/preferences' },
            { label: 'Security', path: '/trainee/profile/security' }
          ]
        },
        {
          icon: MessageSquare,
          label: 'Messages',
          path: '/trainee/messages',
          badge: '5'
        },
        {
          icon: Calendar,
          label: 'Schedule',
          path: '/trainee/schedule'
        },
        {
          icon: HelpCircle,
          label: 'Help Center',
          path: '/trainee/help'
        }
      ]
    }
  ];

  const menuSections = isAdmin ? adminMenuSections : traineeMenuSections;

  return (
    <div className="h-full overflow-y-auto px-3 py-4">
      <div className="mb-8 px-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="space-y-8">
        {menuSections.map((section, index) => (
          <MenuSection key={index} title={section.title}>
            <div className="space-y-1">
              {section.items.map((item) =>
                item.subItems ? (
                  <CollapsibleMenu
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    items={item.subItems}
                    isOpen={openMenus[item.path]}
                    onToggle={(isOpen) => handleMenuToggle(item.path, isOpen)}
                  />
                ) : (
                  <NavItem
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    badge={item.badge}
                  />
                )
              )}
            </div>
          </MenuSection>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 space-y-2">
          <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white rounded-lg transition-colors duration-200">
            <span className="flex items-center">
              <HelpCircle className="h-4 w-4 mr-3" />
              Help & Support
            </span>
          </button>
          <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white rounded-lg transition-colors duration-200">
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;