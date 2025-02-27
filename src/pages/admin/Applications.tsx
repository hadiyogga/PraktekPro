import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Student, InternshipApplication } from '../../types';
import { CircleCheck, CircleX, Download, FileText, Search, Trash } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminApplications: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<InternshipApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<InternshipApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Get all students
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const allStudents = allUsers.filter((user: any) => user.role === 'student') as Student[];
    setStudents(allStudents);
    
    // Get all applications
    const allApplications = JSON.parse(localStorage.getItem('applications') || '[]') as InternshipApplication[];
    setApplications(allApplications);
    setFilteredApplications(allApplications);
  }, []);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredApplications(applications);
      return;
    }
    
    const filtered = applications.filter(application => {
      const student = students.find(s => s.id === application.studentId);
      return (
        student?.name.toLowerCase().includes(term) ||
        application.companyName.toLowerCase().includes(term) ||
        application.companyAddress.toLowerCase().includes(term)
      );
    });
    
    setFilteredApplications(filtered);
  };
  
  const handleViewDetails = (application: InternshipApplication) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };
  
  const handleDeleteApplication = (applicationId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengajuan PKL ini?")) return;
    
    // Remove application from storage
    const updatedApplications = applications.filter(app => app.id !== applicationId);
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
    
    // Update state
    setApplications(updatedApplications);
    setFilteredApplications(
      searchTerm ? 
        updatedApplications.filter(app => {
          const student = students.find(s => s.id === app.studentId);
          return (
            student?.name.toLowerCase().includes(searchTerm) ||
            app.companyName.toLowerCase().includes(searchTerm) ||
            app.companyAddress.toLowerCase().includes(searchTerm)
          );
        }) : 
        updatedApplications
    );
    
    // Close details if the deleted application was selected
    if (selectedApplication && selectedApplication.id === applicationId) {
      setShowDetails(false);
      setSelectedApplication(null);
    }
  };
  
  const handleApproveApplication = (application: InternshipApplication) => {
    // Update application status
    const updatedApplication = {
      ...application,
      status: 'approved'
    };
    
    // Update student status
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map((user: any) => {
      if (user.id === application.studentId) {
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
    setApplications(updatedApplications);
    setFilteredApplications(
      searchTerm ? 
        updatedApplications.filter(app => {
          const student = students.find(s => s.id === app.studentId);
          return (
            student?.name.toLowerCase().includes(searchTerm) ||
            app.companyName.toLowerCase().includes(searchTerm) ||
            app.companyAddress.toLowerCase().includes(searchTerm)
          );
        }) : 
        updatedApplications
    );
    setShowDetails(false);
    
    // Show confirmation
    alert('Pengajuan PKL berhasil disetujui');
  };
  
  const handleRejectApplication = (application: InternshipApplication) => {
    // Update application status
    const updatedApplication = {
      ...application,
      status: 'rejected'
    };
    
    // Update student status
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = allUsers.map((user: any) => {
      if (user.id === application.studentId) {
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
    setApplications(updatedApplications);
    setFilteredApplications(
      searchTerm ? 
        updatedApplications.filter(app => {
          const student = students.find(s => s.id === app.studentId);
          return (
            student?.name.toLowerCase().includes(searchTerm) ||
            app.companyName.toLowerCase().includes(searchTerm) ||
            app.companyAddress.toLowerCase().includes(searchTerm)
          );
        }) : 
        updatedApplications
    );
    setShowDetails(false);
    
    // Show confirmation
    alert('Pengajuan PKL ditolak');
  };
  
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };
  
  const getStudentClass = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.class : '';
  };
  
  const getPendingApplications = () => {
    return filteredApplications.filter(app => app.status === 'pending');
  };
  
  const getApprovedApplications = () => {
    return filteredApplications.filter(app => app.status === 'approved');
  };
  
  const getRejectedApplications = () => {
    return filteredApplications.filter(app => app.status === 'rejected');
  };

  const exportApplicationsToExcel = () => {
    const data = applications.map(app => {
      const student = students.find(s => s.id === app.studentId);
      return {
        'Nama Siswa': getStudentName(app.studentId),
        'Kelas': getStudentClass(app.studentId),
        'Perusahaan': app.companyName,
        'Alamat': app.companyAddress,
        'Posisi': app.position,
        'Tanggal Mulai': app.startDate,
        'Tanggal Selesai': app.endDate,
        'Tanggal Pengajuan': new Date(app.submittedDate).toLocaleDateString('id-ID'),
        'Status': app.status === 'pending' ? 'Menunggu' : 
                 app.status === 'approved' ? 'Disetujui' : 'Ditolak',
        'Catatan': app.notes || '-'
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');
    XLSX.writeFile(workbook, `rekap_pengajuan_pkl_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  // Calculate application statistics
  const totalApplications = applications.length;
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;

  return (
    <Layout title="Pengajuan PKL" role="admin">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Konfirmasi Pengajuan PKL</h2>
        <p className="text-sm text-gray-500">Kelola dan konfirmasi pengajuan PKL siswa</p>
      </div>

      {/* Application Summary */}
      <div className="mb-4 bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium text-gray-900">Rekap Pengajuan PKL</h3>
          <button
            onClick={exportApplicationsToExcel}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <div className="bg-gray-100 p-3 rounded-md">
            <div className="text-sm font-medium text-gray-500">Total Pengajuan</div>
            <div className="text-2xl font-bold">{totalApplications}</div>
          </div>
          <div className="bg-yellow-100 p-3 rounded-md">
            <div className="text-sm font-medium text-yellow-800">Menunggu</div>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-md">
            <div className="text-sm font-medium text-green-800">Disetujui</div>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </div>
          <div className="bg-red-100 p-3 rounded-md">
            <div className="text-sm font-medium text-red-800">Ditolak</div>
            <div className="text-2xl font-bold">{rejectedCount}</div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Cari berdasarkan nama siswa atau perusahaan"
          />
        </div>
      </div>
      
      {showDetails && selectedApplication && (
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Detail Pengajuan PKL</h3>
              <p className="text-sm text-gray-500">
                {getStudentName(selectedApplication.studentId)} - {getStudentClass(selectedApplication.studentId)}
              </p>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-sm">Tutup</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nama Perusahaan</p>
              <p className="mt-1">{selectedApplication.companyName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Posisi/Departemen</p>
              <p className="mt-1">{selectedApplication.position}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Alamat Perusahaan</p>
              <p className="mt-1">{selectedApplication.companyAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Periode PKL</p>
              <p className="mt-1">{selectedApplication.startDate} s/d {selectedApplication.endDate}</p>
            </div>
            {selectedApplication.notes && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Catatan Tambahan</p>
                <p className="mt-1">{selectedApplication.notes}</p>
              </div>
            )}
          </div>
          
          {selectedApplication.status === 'pending' && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleRejectApplication(selectedApplication)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <CircleX className="h-4 w-4 mr-2" />
                Tolak
              </button>
              <button
                onClick={() => handleApproveApplication(selectedApplication)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <CircleCheck className="h-4 w-4 mr-2" />
                Setujui
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Pending Applications */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-yellow-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Menunggu Konfirmasi</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Pengajuan PKL yang perlu diproses</p>
          </div>
          <div className="border-t border-gray-200">
            {getPendingApplications().length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perusahaan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPendingApplications().map(application => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getStudentName(application.studentId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getStudentClass(application.studentId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.submittedDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(application.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                {searchTerm ? 'Tidak ada pengajuan yang sesuai dengan pencarian' : 'Tidak ada pengajuan yang menunggu konfirmasi'}
              </div>
            )}
          </div>
        </div>
        
        {/* Approved Applications */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-green-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Pengajuan Disetujui</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Pengajuan PKL yang telah disetujui</p>
          </div>
          <div className="border-t border-gray-200">
            {getApprovedApplications().length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perusahaan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getApprovedApplications().map(application => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getStudentName(application.studentId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getStudentClass(application.studentId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.startDate} - {application.endDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(application.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                {searchTerm ? 'Tidak ada pengajuan yang sesuai dengan pencarian' : 'Tidak ada pengajuan yang disetujui'}
              </div>
            )}
          </div>
        </div>
        
        {/* Rejected Applications */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-red-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Pengajuan Ditolak</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Pengajuan PKL yang ditolak</p>
          </div>
          <div className="border-t border-gray-200">
            {getRejectedApplications().length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perusahaan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getRejectedApplications().map(application => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getStudentName(application.studentId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getStudentClass(application.studentId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.submittedDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(application.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                {searchTerm ? 'Tidak ada pengajuan yang sesuai dengan pencarian' : 'Tidak ada pengajuan yang ditolak'}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminApplications;
