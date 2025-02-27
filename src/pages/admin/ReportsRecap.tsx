import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getStudents } from '../../utils/dataUtils';
import { Student, DailyReport } from '../../types';
import { Download, FileText } from 'lucide-react';
import { createDateFilter, filterReports, exportReportToExcel, exportReportsToPDF } from '../../utils/reportUtils';

type TimeRange = 'daily' | 'weekly' | 'monthly';

const AdminReportsRecap: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  
  // Filtered data
  const [filteredReports, setFilteredReports] = useState<DailyReport[]>([]);
  
  useEffect(() => {
    const allStudents = getStudents();
    setStudents(allStudents);
    
    // Extract unique classes
    const uniqueClasses = Array.from(new Set(allStudents.map(student => student.class)));
    setClasses(uniqueClasses);
    
    // Get reports
    const allReports = JSON.parse(localStorage.getItem('reports') || '[]') as DailyReport[];
    setReports(allReports);
  }, []);
  
  useEffect(() => {
    // Filter reports based on selected filters
    const dateFilter = createDateFilter(timeRange, selectedDate);
    
    const filtered = filterReports(
      reports,
      dateFilter,
      selectedStudent || undefined,
      selectedClass || undefined,
      students
    );
    
    setFilteredReports(filtered);
  }, [selectedClass, selectedStudent, selectedDate, timeRange, reports, students]);
  
  const handleExportExcel = () => {
    const dateFilter = createDateFilter(timeRange, selectedDate);
    exportReportToExcel(filteredReports, students, timeRange, dateFilter);
  };
  
  const handleExportPDF = () => {
    const dateFilter = createDateFilter(timeRange, selectedDate);
    exportReportsToPDF(filteredReports, students, timeRange, dateFilter);
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
    <Layout title="Rekap Laporan Kegiatan" role="admin">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Rekap Laporan Kegiatan PKL</h2>
          <p className="text-sm text-gray-500">Laporan aktivitas siswa selama pelaksanaan PKL</p>
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
      
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Tidak ada data yang sesuai dengan filter</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const student = students.find(s => s.id === report.studentId);
            return (
              <div key={report.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {new Date(report.date).toLocaleDateString('id-ID')}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {getStudentName(report.studentId)} - {student?.class || ''}
                    </p>
                  </div>
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
            );
          })
        )}
      </div>
    </Layout>
  );
};

export default AdminReportsRecap;
