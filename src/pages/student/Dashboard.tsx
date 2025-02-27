import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { User, Student, Teacher, Announcement } from '../../types';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, MessageSquare } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  useEffect(() => {
    // Get current user
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      const userData = JSON.parse(userJson) as Student;
      setStudent(userData);
      
      // Get teacher info if assigned
      if (userData.teacherId) {
        const teachers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
        const foundTeacher = teachers.find(t => t.id === userData.teacherId) as Teacher;
        setTeacher(foundTeacher);
      }
      
      // Get announcements
      const allAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]') as Announcement[];
      const studentAnnouncements = allAnnouncements.filter(a => a.forRoles.includes('student'));
      setAnnouncements(studentAnnouncements);
    }
  }, []);
  
  const featuredLinks = [
    {
      title: 'Absensi Harian',
      description: 'Catat kehadiran harian selama PKL',
      icon: <Calendar className="h-6 w-6 text-blue-500" />,
      link: '/student/attendance'
    },
    {
      title: 'Laporan Kegiatan',
      description: 'Tulis laporan kegiatan selama PKL',
      icon: <ClipboardList className="h-6 w-6 text-green-500" />,
      link: '/student/reports'
    },
    {
      title: 'Chat Pembimbing',
      description: 'Diskusi dengan guru pembimbing',
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      link: '/student/chat'
    }
  ];
  
  return (
    <Layout title="Dashboard Siswa" role="student">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900">Selamat Datang, {student?.name}</h2>
        <p className="mt-1 text-sm text-gray-500">NISN: {student?.nisn} | Kelas: {student?.class}</p>
        
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h3 className="text-md font-medium text-gray-900">Status PKL:</h3>
          <div className="mt-2">
            {student?.applicationStatus === 'approved' ? (
              <div className="bg-green-50 p-4 rounded-md">
                <span className="text-green-800">
                  PKL Anda telah disetujui di {student?.internshipLocation || 'lokasi PKL'}
                </span>
              </div>
            ) : student?.applicationStatus === 'pending' ? (
              <div className="bg-yellow-50 p-4 rounded-md">
                <span className="text-yellow-800">
                  Pengajuan PKL Anda sedang dalam proses review
                </span>
              </div>
            ) : student?.applicationStatus === 'rejected' ? (
              <div className="bg-red-50 p-4 rounded-md">
                <span className="text-red-800">
                  Pengajuan PKL Anda ditolak. Silahkan ajukan kembali.
                </span>
                <Link to="/student/application" className="block mt-2 text-sm text-red-600 hover:text-red-800">
                  Ajukan Kembali
                </Link>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <span className="text-gray-800">
                  Anda belum mengajukan permohonan PKL
                </span>
                <Link to="/student/application" className="block mt-2 text-sm text-blue-600 hover:text-blue-800">
                  Ajukan Permohonan PKL
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {teacher && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-900">Guru Pembimbing:</h3>
            <p className="mt-2 text-sm text-gray-700">{teacher.name}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {featuredLinks.map((item, index) => (
          <Link to={item.link} key={index}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {item.icon}
                <h3 className="ml-3 text-lg font-medium text-gray-900">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
      
      {announcements.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pengumuman Terbaru</h2>
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
              <h3 className="text-md font-medium text-gray-900">{announcement.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{new Date(announcement.date).toLocaleDateString('id-ID')}</p>
              <p className="text-sm text-gray-700 mt-2">{announcement.content}</p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default StudentDashboard;
