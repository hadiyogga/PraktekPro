import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getStudents } from '../../utils/dataUtils';
import { Student, Attendance } from '../../types';
import { Calendar, Download, FileText, Pencil, Trash } from 'lucide-react';
import { createDateFilter, filterAttendances, exportAttendancesToExcel, exportAttendancesToPDF } from '../../utils/reportUtils';
import { useForm } from 'react-hook-form';

type TimeRange = 'daily' | 'weekly' | 'monthly';

const AdminAttendanceRecap: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  
  // Filtered data
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Attendance>();
  
  useEffect(() => {
    const allStudents = getStudents();
    setStudents(allStudents);
    
    // Extract unique classes
    const uniqueClasses = Array.from(new Set(allStudents.map(student => student.class)));
    setClasses(uniqueClasses);
    
    // Get attendances
    loadAttendances();
  }, []);
  
  const loadAttendances = () => {
    const allAttendances = JSON.parse(localStorage.getItem('attendances') || '[]') as Attendance[];
    setAttendances(allAttendances);
  };
  
  useEffect(() => {
    // Filter attendances based on selected filters
    const dateFilter = createDateFilter(timeRange, selectedDate);
    
    const filtered = filterAttendances(
      attendances,
      dateFilter,
      selectedStudent || undefined,
      selectedClass || undefined,
      students
    );
    
    setFilteredAttendances(filtered);
  }, [selectedClass, selectedStudent, selectedDate, timeRange, attendances, students]);
  
  const handleExportExcel = () => {
    const dateFilter = createDateFilter(timeRange, selectedDate);
    exportAttendancesToExcel(filteredAttendances, students, timeRange, dateFilter);
  };
  
  const handleExportPDF = () => {
    const dateFilter = createDateFilter(timeRange, selectedDate);
    exportAttendancesToPDF(filteredAttendances, students, timeRange, dateFilter);
  };
  
  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setShowEditModal(true);
    reset(attendance);
  };
  
  const handleDelete = (attendance: Attendance) => {
    if (window.confirm('Apakah anda yakin ingin menghapus data absensi ini?')) {
      const updatedAttendances = attendances.filter(a => a.id !== attendance.id);
      localStorage.setItem('attendances', JSON.stringify(updatedAttendances));
      loadAttendances();
    }
  };
  
  const handleUpdateAttendance = (data: any) => {
    if (!editingAttendance) return;
    
    const updatedAttendance: Attendance = {
      ...editingAttendance,
      status: data.status,
      notes: data.notes,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime
    };
    
    const updatedAttendances = attendances.map(attendance => 
      attendance.id === editingAttendance.id ? updatedAttendance : attendance
    );
    
    localStorage.setItem('attendances', JSON.stringify(updatedAttendances));
    setAttendances(updatedAttendances);
    setShowEditModal(false);
    setEditingAttendance(null);
  };
  
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };
  
  const getFilteredStudents = () => {
    if (selectedClass) {
      return students.filter(student => student.class === selectedClass);
    }
    return students;
  };
  
  return (
    <Layout title="Rekap Absensi" role="admin">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Rekap Absensi Siswa PKL</h2>
          <p className="text-sm text-gray-500">Laporan kehadiran siswa selama pelaksanaan PKL</p>
        </div>
      </div>
      
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <h3 className="text-md font-medium text-gray-900 mb-4">Filter</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rentang Waktu</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudent(''); // Reset selected student when class changes
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Semua Kelas</option>
              {classes.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Siswa</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Semua Siswa</option>
              {getFilteredStudents().map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Masuk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Pulang</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAttendances.map((attendance) => {
              const student = students.find(s => s.id === attendance.studentId);
              return (
                <tr key={attendance.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(attendance.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStudentName(attendance.studentId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student?.class || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      attendance.status === 'present' ? 'bg-green-100 text-green-800' : 
                      attendance.status === 'absent' ? 'bg-red-100 text-red-800' : 
                      attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      attendance.status === 'sick' ? 'bg-blue-100 text-blue-800' :
                      attendance.status === 'holiday' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {attendance.status === 'present' ? 'Hadir' : 
                       attendance.status === 'absent' ? 'Tidak Hadir' : 
                       attendance.status === 'late' ? 'Terlambat' :
                       attendance.status === 'sick' ? 'Sakit' :
                       attendance.status === 'holiday' ? 'Libur' :
                       'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.checkInTime || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.checkOutTime || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(attendance)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(attendance)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredAttendances.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada data yang sesuai dengan filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Edit Attendance Modal */}
      {showEditModal && editingAttendance && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(handleUpdateAttendance)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Edit Absensi
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Siswa</label>
                          <input
                            type="text"
                            value={getStudentName(editingAttendance.studentId)}
                            disabled
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                          <input
                            type="text"
                            value={new Date(editingAttendance.date).toLocaleDateString('id-ID')}
                            disabled
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <select
                            {...register('status', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="present">Hadir</option>
                            <option value="absent">Tidak Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="sick">Sakit</option>
                            <option value="holiday">Libur</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Jam Masuk</label>
                          <input
                            type="time"
                            {...register('checkInTime')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Jam Pulang</label>
                          <input
                            type="time"
                            {...register('checkOutTime')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Catatan</label>
                          <textarea
                            rows={3}
                            {...register('notes')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAttendance(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminAttendanceRecap;
