import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Auth
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';

// Admin routes
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminTeachers from './pages/admin/Teachers';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminSettings from './pages/admin/Settings';
import AdminGuidance from './pages/admin/Guidance';
import AdminAttendanceRecap from './pages/admin/AttendanceRecap';
import AdminReportsRecap from './pages/admin/ReportsRecap';
import AdminApplications from './pages/admin/Applications';
import AdminAccounts from './pages/admin/Accounts';
import AdminTeacherMonitoring from './pages/admin/TeacherMonitoring';

// Teacher routes  
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherStudents from './pages/teacher/Students';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherChat from './pages/teacher/Chat';

// Student routes
import StudentDashboard from './pages/student/Dashboard';
import StudentApplication from './pages/student/Application';
import StudentAttendance from './pages/student/Attendance';
import StudentReports from './pages/student/Reports';
import StudentChat from './pages/student/Chat';

// Initialize default data if not exists
import { initializeDefaultData } from './utils/dataUtils';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load required font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Initialize default data in localStorage if not exists
    initializeDefaultData();
    
    setLoading(false);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AuthGuard role="admin"><AdminDashboard /></AuthGuard>} />
        <Route path="/admin/students" element={<AuthGuard role="admin"><AdminStudents /></AuthGuard>} />
        <Route path="/admin/teachers" element={<AuthGuard role="admin"><AdminTeachers /></AuthGuard>} />
        <Route path="/admin/announcements" element={<AuthGuard role="admin"><AdminAnnouncements /></AuthGuard>} />
        <Route path="/admin/settings" element={<AuthGuard role="admin"><AdminSettings /></AuthGuard>} />
        <Route path="/admin/guidance" element={<AuthGuard role="admin"><AdminGuidance /></AuthGuard>} />
        <Route path="/admin/attendance-recap" element={<AuthGuard role="admin"><AdminAttendanceRecap /></AuthGuard>} />
        <Route path="/admin/reports-recap" element={<AuthGuard role="admin"><AdminReportsRecap /></AuthGuard>} />
        <Route path="/admin/applications" element={<AuthGuard role="admin"><AdminApplications /></AuthGuard>} />
        <Route path="/admin/accounts" element={<AuthGuard role="admin"><AdminAccounts /></AuthGuard>} />
        <Route path="/admin/teacher-monitoring" element={<AuthGuard role="admin"><AdminTeacherMonitoring /></AuthGuard>} />
        
        {/* Teacher Routes */}
        <Route path="/teacher" element={<AuthGuard role="teacher"><TeacherDashboard /></AuthGuard>} />
        <Route path="/teacher/students" element={<AuthGuard role="teacher"><TeacherStudents /></AuthGuard>} />
        <Route path="/teacher/attendance" element={<AuthGuard role="teacher"><TeacherAttendance /></AuthGuard>} />
        <Route path="/teacher/chat" element={<AuthGuard role="teacher"><TeacherChat /></AuthGuard>} />
        <Route path="/teacher/chat/:studentId" element={<AuthGuard role="teacher"><TeacherChat /></AuthGuard>} />
        
        {/* Student Routes */}
        <Route path="/student" element={<AuthGuard role="student"><StudentDashboard /></AuthGuard>} />
        <Route path="/student/application" element={<AuthGuard role="student"><StudentApplication /></AuthGuard>} />
        <Route path="/student/attendance" element={<AuthGuard role="student"><StudentAttendance /></AuthGuard>} />
        <Route path="/student/reports" element={<AuthGuard role="student"><StudentReports /></AuthGuard>} />
        <Route path="/student/chat" element={<AuthGuard role="student"><StudentChat /></AuthGuard>} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
