import React from 'react';
import Layout from '../../components/Layout';
import { getStudents, getTeachers } from '../../utils/dataUtils';
import { Bell, ClipboardCheck, ClipboardList, FileText, GraduationCap, Map, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const students = getStudents();
  const teachers = getTeachers();
  
  // Count pending applications
  const allApplications = JSON.parse(localStorage.getItem('applications') || '[]');
  const pendingApplications = allApplications.filter((app: any) => app.status === 'pending');
  
  const statsCards = [
    {
      title: 'Total Siswa',
      value: students.length,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      link: '/admin/students'
    },
    {
      title: 'Total Guru',
      value: teachers.length,
      icon: <GraduationCap className="h-6 w-6 text-green-500" />,
      link: '/admin/teachers'
    },
    {
      title: 'Pengajuan PKL',
      value: pendingApplications.length,
      icon: <ClipboardCheck className="h-6 w-6 text-orange-500" />,
      link: '/admin/applications'
    },
    {
      title: 'Pengumuman',
      value: '1',
      icon: <Bell className="h-6 w-6 text-yellow-500" />,
      link: '/admin/announcements'
    }
  ];
  
  const reportCards = [
    {
      title: 'Akun Admin',
      description: 'Kelola akun admin sistem PKL',
      icon: <Users className="h-6 w-6 text-purple-500" />,
      link: '/admin/accounts'
    },
    {
      title: 'Rekap Absensi',
      description: 'Rekap absen siswa PKL',
      icon: <FileText className="h-6 w-6 text-orange-500" />,
      link: '/admin/attendance-recap'
    },
    {
      title: 'Rekap Laporan Kegiatan',
      description: 'Rekap laporan kegiatan PKL',
      icon: <ClipboardList className="h-6 w-6 text-teal-500" />,
      link: '/admin/reports-recap'
    },
    {
      title: 'Monitoring Kunjungan',
      description: 'Rekap kunjungan guru ke lokasi PKL',
      icon: <Map className="h-6 w-6 text-indigo-500" />,
      link: '/admin/teacher-monitoring'
    }
  ];
  
  return (
    <Layout title="Dashboard Admin" role="admin">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <Link to={card.link} key={index}>
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">{card.icon}</div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{card.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <h2 className="mt-8 text-lg leading-6 font-medium text-gray-900">Manajemen Sistem</h2>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {reportCards.map((card, index) => (
          <Link to={card.link} key={index}>
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">{card.icon}</div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="text-lg font-medium text-gray-900">{card.title}</div>
                    <p className="mt-1 text-sm text-gray-500">{card.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Ringkasan Sistem PKL</h2>
        <div className="mt-4 bg-white shadow rounded-lg p-6">
          <p className="text-gray-700">
            Selamat datang di Sistem Manajemen PKL SMK Remaja Pluit. Sistem ini digunakan untuk mengelola Praktik Kerja Lapangan siswa.
          </p>
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-900">Fitur-fitur admin:</h3>
            <ul className="mt-2 list-disc list-inside text-gray-700">
              <li>Manajemen data siswa (termasuk import/export)</li>
              <li>Manajemen data guru pembimbing</li>
              <li>Manajemen akun admin</li>
              <li>Konfirmasi pengajuan PKL siswa</li>
              <li>Pembuatan pengumuman</li>
              <li>Rekap laporan kegiatan siswa</li>
              <li>Rekap absensi harian siswa</li>
              <li>Rekap monitoring kunjungan guru</li>
              <li>Konfigurasi sistem</li>
              <li>Backup dan restore data</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
