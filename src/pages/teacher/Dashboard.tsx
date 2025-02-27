import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { Building, MessageSquare, Users } from 'lucide-react';
import { Teacher, Student } from '../../types';

const TeacherDashboard: React.FC = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    // Get current user
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      const userData = JSON.parse(userJson) as Teacher;
      setTeacher(userData);
      
      // Get students assigned to this teacher
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const assignedStudents = allUsers.filter((user: any) => 
        user.role === 'student' && user.teacherId === userData.id
      ) as Student[];
      
      setStudents(assignedStudents);
    }
  }, []);
  
  const featuredLinks = [
    {
      title: 'Siswa Bimbingan',
      description: 'Lihat dan kelola siswa yang Anda bimbing',
      icon: <Users className="h-6 w-6 text-blue-500" />,
      link: '/teacher/students',
      count: students.length
    },
    {
      title: 'Kunjungan PKL',
      description: 'Catat kunjungan ke lokasi PKL siswa',
      icon: <Building className="h-6 w-6 text-green-500" />,
      link: '/teacher/attendance'
    },
    {
      title: 'Chat',
      description: 'Komunikasi dengan siswa bimbingan',
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      link: '/teacher/chat'
    }
  ];
  
  return (
    <Layout title="Dashboard Guru Pembimbing" role="teacher">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900">Selamat Datang, {teacher?.name}</h2>
        <p className="mt-1 text-sm text-gray-500">NIP: {teacher?.nip} | Mata Pelajaran: {teacher?.subject}</p>
        
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h3 className="text-md font-medium text-gray-900">Ringkasan:</h3>
          <p className="mt-2 text-sm text-gray-700">
            Anda membimbing {students.length} siswa PKL.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        {featuredLinks.map((item, index) => (
          <Link to={item.link} key={index}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {item.icon}
                <h3 className="ml-3 text-lg font-medium text-gray-900">{item.title}</h3>
                {item.count !== undefined && (
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
      
      {students.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Siswa Bimbingan</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status PKL</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.applicationStatus === 'approved' ? 'bg-green-100 text-green-800' : 
                        student.applicationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        student.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.applicationStatus === 'approved' ? 'Disetujui' : 
                         student.applicationStatus === 'pending' ? 'Menunggu' : 
                         student.applicationStatus === 'rejected' ? 'Ditolak' : 
                         'Belum Mengajukan'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TeacherDashboard;
