import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Student, DailyReport } from '../../types';
import { useForm } from 'react-hook-form';
import { Calendar, ClipboardList, FileText, Plus } from 'lucide-react';

const StudentReports: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DailyReport>();
  
  useEffect(() => {
    // Get current student
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      const userData = JSON.parse(userJson) as Student;
      setStudent(userData);
      
      // Get reports for this student
      const allReports = JSON.parse(localStorage.getItem('reports') || '[]') as DailyReport[];
      const studentReports = allReports.filter(r => r.studentId === userData.id);
      // Sort by date, newest first
      studentReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReports(studentReports);
    }
  }, []);
  
  const handleSaveReport = (data: any) => {
    if (!student) return;
    
    const reportData: DailyReport = {
      ...data,
      id: editingReport?.id || Date.now().toString(),
      studentId: student.id
    };
    
    // Save report
    const allReports = JSON.parse(localStorage.getItem('reports') || '[]') as DailyReport[];
    
    if (editingReport) {
      // Update existing report
      const updatedReports = allReports.map(report => 
        report.id === editingReport.id ? reportData : report
      );
      localStorage.setItem('reports', JSON.stringify(updatedReports));
    } else {
      // Add new report
      localStorage.setItem('reports', JSON.stringify([...allReports, reportData]));
    }
    
    // Update state and reset form
    const updatedReports = editingReport
      ? reports.map(report => report.id === editingReport.id ? reportData : report)
      : [reportData, ...reports];
    
    // Sort by date, newest first
    updatedReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setReports(updatedReports);
    setShowForm(false);
    setEditingReport(null);
    reset();
  };
  
  const handleEdit = (report: DailyReport) => {
    setEditingReport(report);
    setShowForm(true);
    reset(report);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  return (
    <Layout title="Laporan Kegiatan" role="student">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Laporan Kegiatan PKL</h2>
          <p className="text-sm text-gray-500">Catat aktivitas harian selama PKL</p>
        </div>
        <div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingReport(null);
              reset({
                id: '',
                studentId: student?.id || '',
                date: new Date().toISOString().split('T')[0],
                activities: '',
                notes: ''
              });
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={student?.applicationStatus !== 'approved'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Laporan
          </button>
        </div>
      </div>
      
      {student?.applicationStatus !== 'approved' && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
          <p className="text-sm text-yellow-700">
            Anda belum mendapatkan persetujuan PKL. Fitur laporan kegiatan akan tersedia setelah PKL disetujui.
          </p>
        </div>
      )}
      
      {showForm && (
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingReport ? 'Edit Laporan' : 'Tambah Laporan Baru'}
          </h3>
          <form onSubmit={handleSubmit(handleSaveReport)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                <input
                  type="date"
                  {...register('date', { required: 'Tanggal wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Kegiatan</label>
                <textarea
                  rows={4}
                  {...register('activities', { required: 'Kegiatan wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Deskripsikan kegiatan yang dilakukan hari ini"
                ></textarea>
                {errors.activities && <p className="mt-1 text-sm text-red-600">{errors.activities.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  {...register('notes')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Catatan tambahan, kendala, dll."
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingReport(null);
                  reset();
                }}
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
      )}
      
      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">{formatDate(report.date)}</h3>
                <button
                  onClick={() => handleEdit(report)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
              <div className="mt-4 prose text-gray-700">
                <div className="font-medium text-gray-900 mb-2">Kegiatan:</div>
                <p className="whitespace-pre-line">{report.activities}</p>
              </div>
              {report.notes && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="font-medium text-gray-900 mb-2">Catatan:</div>
                  <p className="text-gray-700 whitespace-pre-line">{report.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Belum ada laporan kegiatan</p>
          {student?.applicationStatus === 'approved' && (
            <button
              onClick={() => {
                setShowForm(true);
                reset({
                  id: '',
                  studentId: student?.id || '',
                  date: new Date().toISOString().split('T')[0],
                  activities: '',
                  notes: ''
                });
              }}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Laporan Pertama
            </button>
          )}
        </div>
      )}
    </Layout>
  );
};

export default StudentReports;
