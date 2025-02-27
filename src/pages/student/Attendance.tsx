import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Student, Attendance } from '../../types';
import { useForm } from 'react-hook-form';
import { Calendar, Check, Clock } from 'lucide-react';

const StudentAttendance: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  useEffect(() => {
    // Get current student
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      const userData = JSON.parse(userJson) as Student;
      setStudent(userData);
      
      // Get attendances for this student
      const allAttendances = JSON.parse(localStorage.getItem('attendances') || '[]') as Attendance[];
      const studentAttendances = allAttendances.filter(a => a.studentId === userData.id);
      setAttendances(studentAttendances);
      
      // Check if student has already checked in today
      const today = new Date().toISOString().split('T')[0];
      const todaysAttendance = studentAttendances.find(a => a.date === today);
      setTodayAttendance(todaysAttendance || null);
    }
  }, []);
  
  const handleCheckIn = (data: any) => {
    if (!student) return;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    
    // Create or update attendance record
    let attendance: Attendance;
    let allAttendances = JSON.parse(localStorage.getItem('attendances') || '[]') as Attendance[];
    
    // Check if record already exists for today
    const existingIndex = allAttendances.findIndex(a => 
      a.studentId === student.id && a.date === today
    );
    
    if (existingIndex >= 0) {
      // Update existing record
      attendance = {
        ...allAttendances[existingIndex],
        checkOutTime: time,
        notes: data.notes || allAttendances[existingIndex].notes
      };
      allAttendances[existingIndex] = attendance;
    } else {
      // Create new record with the selected status
      attendance = {
        id: Date.now().toString(),
        studentId: student.id,
        date: today,
        status: data.status || 'present',
        checkInTime: data.status === 'sick' || data.status === 'holiday' ? undefined : time,
        notes: data.notes
      };
      allAttendances.push(attendance);
    }
    
    // Save to localStorage
    localStorage.setItem('attendances', JSON.stringify(allAttendances));
    
    // Update state
    setTodayAttendance(attendance);
    setAttendances(allAttendances.filter(a => a.studentId === student.id));
  };
  
  const filterAttendancesByMonth = (month: number) => {
    if (!attendances.length) return [];
    
    return attendances.filter(a => {
      const attendanceDate = new Date(a.date);
      return attendanceDate.getMonth() === month;
    });
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  const currentMonth = new Date().getMonth();
  const currentMonthAttendances = filterAttendancesByMonth(currentMonth);
  
  if (!student) {
    return <Layout title="Absensi Harian" role="student">Loading...</Layout>;
  }
  
  const isCheckedIn = todayAttendance?.checkInTime;
  const isCheckedOut = todayAttendance?.checkOutTime;
  const hasReportedStatus = todayAttendance?.status === 'sick' || todayAttendance?.status === 'holiday';
  
  return (
    <Layout title="Absensi Harian" role="student">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Absensi PKL</h2>
        <p className="text-sm text-gray-500">Catat kehadiran harian selama PKL</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Absensi Hari Ini: {formatDate(new Date().toISOString().split('T')[0])}
          </h3>
          
          {student.applicationStatus !== 'approved' ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <p className="text-sm text-yellow-700">
                Anda belum mendapatkan persetujuan PKL. Absensi hanya tersedia setelah PKL disetujui.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleCheckIn)} className="space-y-4">
              {!todayAttendance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Kehadiran</label>
                  <select
                    {...register('status')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="present"
                  >
                    <option value="present">Hadir</option>
                    <option value="sick">Sakit</option>
                    <option value="holiday">Libur</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Catatan Kegiatan</label>
                <textarea
                  rows={3}
                  {...register('notes')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Catatan kegiatan hari ini"
                  defaultValue={todayAttendance?.notes}
                ></textarea>
              </div>
              
              <div className="flex space-x-2">
                {!todayAttendance ? (
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Kirim Absensi
                  </button>
                ) : !isCheckedOut && !hasReportedStatus ? (
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Check Out
                  </button>
                ) : (
                  <div className="text-green-600 font-medium flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Absensi telah tercatat
                  </div>
                )}
              </div>
              
              {todayAttendance && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      todayAttendance.status === 'present' ? 'bg-green-100 text-green-800' : 
                      todayAttendance.status === 'sick' ? 'bg-blue-100 text-blue-800' :
                      todayAttendance.status === 'holiday' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {todayAttendance.status === 'present' ? 'Hadir' : 
                       todayAttendance.status === 'sick' ? 'Sakit' :
                       todayAttendance.status === 'holiday' ? 'Libur' :
                       todayAttendance.status}
                    </span>
                  </div>
                  {todayAttendance.checkInTime && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Check In:</span>
                      <span className="font-medium">{todayAttendance.checkInTime}</span>
                    </div>
                  )}
                  {todayAttendance.checkOutTime && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Check Out:</span>
                      <span className="font-medium">{todayAttendance.checkOutTime}</span>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Riwayat Absensi Bulan Ini
          </h3>
          
          {currentMonthAttendances.length > 0 ? (
            <div className="space-y-4">
              {currentMonthAttendances.map((attendance) => (
                <div key={attendance.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{formatDate(attendance.date)}</span>
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
                  </div>
                  {(attendance.checkInTime || attendance.checkOutTime) && (
                    <div className="mt-1 text-sm text-gray-500">
                      {attendance.checkInTime && <span>Masuk: {attendance.checkInTime}</span>}
                      {attendance.checkInTime && attendance.checkOutTime && <span> | </span>}
                      {attendance.checkOutTime && <span>Pulang: {attendance.checkOutTime}</span>}
                    </div>
                  )}
                  {attendance.notes && (
                    <div className="mt-2 text-sm text-gray-700">
                      {attendance.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2">Belum ada data absensi bulan ini</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentAttendance;
