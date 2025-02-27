import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Student, InternshipApplication } from '../../types';
import { CircleCheck, File, Send, CircleX } from 'lucide-react';

const TeacherStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<{[key: string]: InternshipApplication}>({});
  
  useEffect(() => {
    // Get current teacher
    const userJson = sessionStorage.getItem('currentUser');
    if (!userJson) return;
    
    const teacherId = JSON.parse(userJson).id;
    
    // Get students assigned to this teacher
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const assignedStudents = allUsers.filter((user: any) => 
      user.role === 'student' && user.teacherId === teacherId
    ) as Student[];
    
    setStudents(assignedStudents);
    
    // Get applications
    const allApplications = JSON.parse(localStorage.getItem('applications') || '[]') as InternshipApplication[];
    const applicationsMap: {[key: string]: InternshipApplication} = {};
    
    allApplications.forEach(app => {
      if (assignedStudents.some(student => student.id === app.studentId)) {
        applicationsMap[app.studentId] = app;
      }
    });
    
    setApplications(applicationsMap);
  }, []);
  
  const handleApproveApplication = (application: InternshipApplication, studentId: string) => {
    // Update application status
    const updatedApplication = {
      ...application,
      status: 'approved'
    };
    
    // Update student status
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map((user: any) => {
      if (user.id === studentId) {
        return {
          ...user,
          applicationStatus: 'approved',
          internshipLocation: application.companyName,
          internshipStartDate: application.startDate,
          internshipEndDate: application.endDate
        };
      }
      return user;
    });
    
    // Get all applications and update the specific one
    const allApplications = JSON.parse(localStorage.getItem('applications') || '[]') as InternshipApplication[];
    const updatedApplications = allApplications.map(app => 
      app.id === application.id ? updatedApplication : app
    );
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
    
    // Update state
    setApplications({
      ...applications,
      [studentId]: updatedApplication
    });
    
    // Update student in the state
    setStudents(students.map(student => 
      student.id === studentId ? {...student, applicationStatus: 'approved'} : student
    ));
  };
  
  const handleRejectApplication = (application: InternshipApplication, studentId: string) => {
    // Update application status
    const updatedApplication = {
      ...application,
      status: 'rejected'
    };
    
    // Update student status
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map((user: any) => {
      if (user.id === studentId) {
        return {
          ...user,
          applicationStatus: 'rejected'
        };
      }
      return user;
    });
    
    // Get all applications and update the specific one
    const allApplications = JSON.parse(localStorage.getItem('applications') || '[]') as InternshipApplication[];
    const updatedApplications = allApplications.map(app => 
      app.id === application.id ? updatedApplication : app
    );
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
    
    // Update state
    setApplications({
      ...applications,
      [studentId]: updatedApplication
    });
    
    // Update student in the state
    setStudents(students.map(student => 
      student.id === studentId ? {...student, applicationStatus: 'rejected'} : student
    ));
  };
  
  return (
    <Layout title="Siswa Bimbingan" role="teacher">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Daftar Siswa Bimbingan</h2>
        <p className="text-sm text-gray-500">Kelola siswa PKL yang Anda bimbing</p>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status PKL</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {applications[student.id] && student.applicationStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveApplication(applications[student.id], student.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        <CircleCheck className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRejectApplication(applications[student.id], student.id)}
                        className="text-red-600 hover:text-red-900 mr-2"
                      >
                        <CircleX className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <a
                    href={`/teacher/chat/${student.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Send className="h-5 w-5" />
                  </a>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Belum ada siswa bimbingan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default TeacherStudents;
