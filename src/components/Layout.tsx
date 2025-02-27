import React, { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { LogOut, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  role: 'admin' | 'teacher' | 'student';
}

const Layout: React.FC<LayoutProps> = ({ children, title, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const userJson = sessionStorage.getItem('currentUser');
  const user: User = userJson ? JSON.parse(userJson) : null;
  
  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/login');
  };
  
  const adminLinks = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/students', label: 'Data Siswa' },
    { path: '/admin/teachers', label: 'Data Guru' },
    { path: '/admin/applications', label: 'Pengajuan PKL' },
    { path: '/admin/announcements', label: 'Pengumuman' },
    { path: '/admin/accounts', label: 'Akun Admin' },
    { path: '/admin/settings', label: 'Pengaturan' },
  ];
  
  const teacherLinks = [
    { path: '/teacher', label: 'Dashboard' },
    { path: '/teacher/students', label: 'Siswa Bimbingan' },
    { path: '/teacher/attendance', label: 'Kunjungan PKL' },
    { path: '/teacher/chat', label: 'Chat' },
  ];
  
  const studentLinks = [
    { path: '/student', label: 'Dashboard' },
    { path: '/student/application', label: 'Pengajuan PKL' },
    { path: '/student/attendance', label: 'Absensi Harian' },
    { path: '/student/reports', label: 'Laporan Kegiatan' },
    { path: '/student/chat', label: 'Chat dengan Pembimbing' },
  ];
  
  const links = role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : studentLinks;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} role="dialog">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center px-4">
            <h2 className="text-xl font-bold text-gray-900">SMK Remaja Pluit</h2>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    location.pathname === link.path
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-xl font-bold text-gray-900">SMK Remaja Pluit</h2>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    location.pathname === link.path
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-3">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
