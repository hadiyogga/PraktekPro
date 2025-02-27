import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Student, InternshipApplication } from '../../types';
import { useForm } from 'react-hook-form';

const StudentApplication: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [application, setApplication] = useState<InternshipApplication | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<InternshipApplication>();
  
  useEffect(() => {
    // Get current student
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      const userData = JSON.parse(userJson) as Student;
      setStudent(userData);
      
      // Check for existing application
      const allApplications = JSON.parse(localStorage.getItem('applications') || '[]') as InternshipApplication[];
      const studentApplication = allApplications.find(app => app.studentId === userData.id);
      
      if (studentApplication) {
        setApplication(studentApplication);
      }
    }
  }, []);
  
  const handleApply = (data: any) => {
    if (!student) return;
    
    const applicationData: InternshipApplication = {
      ...data,
      id: Date.now().toString(),
      studentId: student.id,
      status: 'pending',
      submittedDate: new Date().toISOString()
    };
    
    // Save application
    const allApplications = JSON.parse(localStorage.getItem('applications') || '[]') as InternshipApplication[];
    const updatedApplications = [...allApplications, applicationData];
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
    
    // Update student status
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map((user: any) => {
      if (user.id === student.id) {
        return {
          ...user,
          applicationStatus: 'pending'
        };
      }
      return user;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    sessionStorage.setItem('currentUser', JSON.stringify({
      ...student,
      applicationStatus: 'pending'
    }));
    
    // Update state
    setApplication(applicationData);
    setStudent({
      ...student,
      applicationStatus: 'pending'
    });
  };
  
  const renderApplicationStatus = () => {
    if (!student) return null;
    
    switch (student.applicationStatus) {
      case 'approved':
        return (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-6">
            <h3 className="text-lg font-medium text-green-800">PKL Anda Telah Disetujui!</h3>
            <p className="mt-2 text-sm text-green-700">
              Permohonan PKL Anda telah disetujui. Detail informasi:
            </p>
            <ul className="mt-3 list-disc list-inside text-sm text-green-700">
              <li>Tempat PKL: {student.internshipLocation}</li>
              <li>Periode: {student.internshipStartDate} s/d {student.internshipEndDate}</li>
            </ul>
          </div>
        );
        
      case 'pending':
        return (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
            <h3 className="text-lg font-medium text-yellow-800">Permohonan PKL Sedang Diproses</h3>
            <p className="mt-2 text-sm text-yellow-700">
              Permohonan PKL Anda sedang dalam proses review oleh guru pembimbing. Silahkan periksa status secara berkala.
            </p>
            {application && (
              <div className="mt-3 text-sm text-yellow-700">
                <p>Permohonan diajukan pada: {new Date(application.submittedDate).toLocaleDateString('id-ID')}</p>
              </div>
            )}
          </div>
        );
        
      case 'rejected':
        return (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
            <h3 className="text-lg font-medium text-red-800">Permohonan PKL Ditolak</h3>
            <p className="mt-2 text-sm text-red-700">
              Maaf, permohonan PKL Anda ditolak. Silahkan hubungi guru pembimbing untuk informasi lebih lanjut.
            </p>
            <button
              onClick={() => {
                // Reset student application status
                const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
                const updatedUsers = allUsers.map((user: any) => {
                  if (user.id === student.id) {
                    return {
                      ...user,
                      applicationStatus: 'none'
                    };
                  }
                  return user;
                });
                
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                sessionStorage.setItem('currentUser', JSON.stringify({
                  ...student,
                  applicationStatus: 'none'
                }));
                
                // Update state
                setApplication(null);
                setStudent({
                  ...student,
                  applicationStatus: 'none'
                });
              }}
              className="mt-3 text-sm font-medium text-red-700 hover:text-red-800"
            >
              Ajukan Permohonan Baru
            </button>
          </div>
        );
        
      default:
        return (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Form Pengajuan PKL</h3>
            <form onSubmit={handleSubmit(handleApply)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Perusahaan</label>
                <input
                  type="text"
                  {...register('companyName', { required: 'Nama perusahaan wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Alamat Perusahaan</label>
                <textarea
                  rows={3}
                  {...register('companyAddress', { required: 'Alamat perusahaan wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                ></textarea>
                {errors.companyAddress && <p className="mt-1 text-sm text-red-600">{errors.companyAddress.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Posisi/Departemen</label>
                <input
                  type="text"
                  {...register('position', { required: 'Posisi wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                  <input
                    type="date"
                    {...register('startDate', { required: 'Tanggal mulai wajib diisi' })}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                  <input
                    type="date"
                    {...register('endDate', { required: 'Tanggal selesai wajib diisi' })}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
                <textarea
                  rows={3}
                  {...register('notes')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ajukan Permohonan
                </button>
              </div>
            </form>
          </div>
        );
    }
  };
  
  return (
    <Layout title="Pengajuan PKL" role="student">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Pengajuan Praktik Kerja Lapangan</h2>
        <p className="text-sm text-gray-500">Ajukan permohonan PKL ke perusahaan yang Anda inginkan</p>
      </div>
      
      {renderApplicationStatus()}
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Penting</h3>
        <div className="prose text-sm text-gray-500">
          <p>
            Praktik Kerja Lapangan (PKL) merupakan program wajib yang harus dilaksanakan oleh siswa SMK sebagai bagian dari kurikulum pendidikan.
          </p>
          <p>
            Beberapa hal yang perlu diperhatikan:
          </p>
          <ul>
            <li>Pastikan perusahaan yang Anda pilih sesuai dengan jurusan Anda</li>
            <li>Perhatikan jarak dan akses transportasi ke lokasi PKL</li>
            <li>Persiapkan dokumen pendukung seperti CV dan surat pengantar dari sekolah</li>
            <li>Konsultasikan dengan guru pembimbing sebelum mengajukan permohonan</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default StudentApplication;
