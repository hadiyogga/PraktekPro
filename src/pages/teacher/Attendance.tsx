import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Student, Attendance } from '../../types';
import { useForm } from 'react-hook-form';
import { Building, CalendarCheck, Map, Plus } from 'lucide-react';

const TeacherAttendance: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { register, handleSubmit, reset, watch } = useForm();
  const visitType = watch('visitType');
  
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
    
    // Get teacher visits
    const allVisits = JSON.parse(localStorage.getItem('teacherVisits') || '[]');
    const teacherVisits = allVisits.filter((visit: any) => visit.teacherId === teacherId);
    setVisits(teacherVisits);
  }, []);
  
  const getVisitForDate = (date: string) => {
    return visits.find(v => v.date === date);
  };
  
  const handleSaveVisit = (data: any) => {
    const userJson = sessionStorage.getItem('currentUser');
    if (!userJson) return;
    
    const teacherId = JSON.parse(userJson).id;
    
    // Format the list of visited students
    const visitedStudentIds = Object.keys(data)
      .filter(key => key.startsWith('student-') && data[key])
      .map(key => key.replace('student-', ''));
    
    const visitData = {
      id: Date.now().toString(),
      teacherId,
      date: selectedDate,
      visitType: data.visitType,
      location: data.location,
      visitNotes: data.visitNotes,
      visitedStudentIds,
      issuedFollowUp: data.issuedFollowUp === 'true',
      followUpNotes: data.followUpNotes
    };
    
    // Update localStorage
    const allVisits = JSON.parse(localStorage.getItem('teacherVisits') || '[]');
    
    // Remove existing visit for this date if any
    const filteredVisits = allVisits.filter(v => 
      !(v.teacherId === teacherId && v.date === selectedDate)
    );
    
    // Add new visit
    const updatedVisits = [...filteredVisits, visitData];
    localStorage.setItem('teacherVisits', JSON.stringify(updatedVisits));
    
    // Update state
    setVisits(updatedVisits.filter(v => v.teacherId === teacherId));
    setShowForm(false);
    reset();
  };
  
  return (
    <Layout title="Kunjungan PKL" role="teacher">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Monitoring Kunjungan PKL</h2>
          <p className="text-sm text-gray-500">Catat kunjungan ke lokasi PKL siswa</p>
        </div>
        <div className="flex space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Input Kunjungan
          </button>
        </div>
      </div>
      
      {showForm ? (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Input Kunjungan: {new Date(selectedDate).toLocaleDateString('id-ID')}
          </h3>
          <form onSubmit={handleSubmit(handleSaveVisit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Kunjungan</label>
                <select
                  {...register('visitType', { required: true })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="physical">Kunjungan Fisik</option>
                  <option value="virtual">Kunjungan Virtual</option>
                  <option value="phone">Telepon</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Lokasi/Perusahaan</label>
                <input
                  type="text"
                  {...register('location', { required: true })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Catatan Kunjungan</label>
                <textarea
                  rows={3}
                  {...register('visitNotes')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Deskripsikan hasil monitoring kunjungan"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Siswa yang Dikunjungi</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        {...register(`student-${student.id}`)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`student-${student.id}`} className="ml-2 block text-sm text-gray-900">
                        {student.name} ({student.class})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Perlu Tindak Lanjut?</label>
                <select
                  {...register('issuedFollowUp')}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="false">Tidak</option>
                  <option value="true">Ya</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Catatan Tindak Lanjut</label>
                <textarea
                  rows={2}
                  {...register('followUpNotes')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Rencana tindak lanjut jika diperlukan"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {visits.filter(v => v.date === selectedDate).length > 0 ? (
            visits.filter(v => v.date === selectedDate).map(visit => (
              <div key={visit.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Kunjungan {new Date(visit.date).toLocaleDateString('id-ID')}
                  </h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    visit.visitType === 'physical' ? 'bg-green-100 text-green-800' : 
                    visit.visitType === 'virtual' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {visit.visitType === 'physical' ? 'Kunjungan Fisik' : 
                     visit.visitType === 'virtual' ? 'Kunjungan Virtual' : 
                     'Telepon'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-700 mb-2">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Lokasi/Perusahaan:</span>
                    <span className="ml-2">{visit.location}</span>
                  </div>
                </div>
                
                {visit.visitNotes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Catatan Kunjungan:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{visit.visitNotes}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Siswa yang Dikunjungi:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {visit.visitedStudentIds.map((studentId: string) => {
                      const student = students.find(s => s.id === studentId);
                      return student ? (
                        <div key={studentId} className="text-sm text-gray-700">
                          • {student.name} ({student.class})
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                
                {visit.issuedFollowUp && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tindak Lanjut:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{visit.followUpNotes}</p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setShowForm(true);
                      // Pre-fill the form with existing data
                      const formData = {
                        visitType: visit.visitType,
                        location: visit.location,
                        visitNotes: visit.visitNotes,
                        issuedFollowUp: visit.issuedFollowUp ? 'true' : 'false',
                        followUpNotes: visit.followUpNotes,
                      };
                      
                      // Add student checkboxes
                      visit.visitedStudentIds.forEach((id: string) => {
                        formData[`student-${id}`] = true;
                      });
                      
                      reset(formData);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit Kunjungan
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <CalendarCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada kunjungan</h3>
              <p className="mt-1 text-sm text-gray-500">Klik tombol "Input Kunjungan" untuk mencatat kunjungan pada tanggal yang dipilih.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default TeacherAttendance;
