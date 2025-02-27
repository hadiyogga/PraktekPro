import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getTeachers, getStudents } from '../../utils/dataUtils';
import { Student, Teacher } from '../../types';
import { Download, FileText, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

type TimeRange = 'daily' | 'weekly' | 'monthly';

const AdminTeacherMonitoring: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  
  // Filter states
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const allTeachers = getTeachers();
    const allStudents = getStudents();
    setTeachers(allTeachers);
    setStudents(allStudents);
    
    // Get teacher visits
    const allVisits = JSON.parse(localStorage.getItem('teacherVisits') || '[]');
    setVisits(allVisits);
    setFilteredVisits(allVisits);
  }, []);
  
  useEffect(() => {
    filterVisits();
  }, [selectedTeacher, selectedDate, timeRange, searchTerm, visits]);

  const filterVisits = () => {
    // Create date filter
    const date = new Date(selectedDate);
    let startDate = new Date(date);
    let endDate = new Date(date);
    
    if (timeRange === 'daily') {
      // Just keep the same date
    } else if (timeRange === 'weekly') {
      // Calculate first day (Sunday) of the week
      const day = date.getDay();
      startDate.setDate(date.getDate() - day);
      endDate.setDate(startDate.getDate() + 6);
    } else if (timeRange === 'monthly') {
      // First day of the month
      startDate.setDate(1);
      // Last day of the month
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    let filtered = visits.filter(visit => {
      const visitDate = new Date(visit.date);
      return visitDate >= startDate && visitDate <= endDate;
    });

    // Filter by teacher
    if (selectedTeacher) {
      filtered = filtered.filter(visit => visit.teacherId === selectedTeacher);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(visit => {
        const teacher = teachers.find(t => t.id === visit.teacherId);
        const studentNames = visit.visitedStudentIds.map((studentId: string) => {
          const student = students.find(s => s.id === studentId);
          return student ? student.name.toLowerCase() : '';
        }).join(' ');
        
        return (
          (teacher && teacher.name.toLowerCase().includes(term)) ||
          visit.location.toLowerCase().includes(term) ||
          studentNames.includes(term)
        );
      });
    }

    setFilteredVisits(filtered);
  };
  
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown';
  };

  const getStudentNames = (studentIds: string[]) => {
    return studentIds.map(id => {
      const student = students.find(s => s.id === id);
      return student ? student.name : 'Unknown';
    }).join(', ');
  };

  const exportToExcel = () => {
    const data = filteredVisits.map(visit => {
      return {
        'Tanggal': new Date(visit.date).toLocaleDateString('id-ID'),
        'Guru': getTeacherName(visit.teacherId),
        'Jenis Kunjungan': visit.visitType === 'physical' ? 'Kunjungan Fisik' : 
                          visit.visitType === 'virtual' ? 'Kunjungan Virtual' : 'Telepon',
        'Lokasi': visit.location,
        'Siswa yang Dikunjungi': getStudentNames(visit.visitedStudentIds),
        'Catatan': visit.visitNotes || '-',
        'Tindak Lanjut': visit.issuedFollowUp ? 'Ya' : 'Tidak',
        'Catatan Tindak Lanjut': visit.followUpNotes || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monitoring');
    
    const periodText = timeRange === 'daily' ? 'Harian' : 
                    timeRange === 'weekly' ? 'Mingguan' : 'Bulanan';
                    
    XLSX.writeFile(workbook, `rekap_monitoring_guru_${periodText}_${selectedDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    const periodText = timeRange === 'daily' ? 'Harian' : 
                   timeRange === 'weekly' ? 'Mingguan' : 'Bulanan';
    doc.text(`Rekap Monitoring Kunjungan Guru ${periodText}`, 20, 20);
    
    // Headers
    doc.setFontSize(12);
    doc.text('Tanggal', 15, 40);
    doc.text('Guru', 45, 40);
    doc.text('Lokasi', 105, 40);
    doc.text('Jenis Kunjungan', 155, 40);
    
    // Data
    let yPosition = 50;
    filteredVisits.forEach((visit) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 40;
        
        // Headers on new page
        doc.text('Tanggal', 15, 30);
        doc.text('Guru', 45, 30);
        doc.text('Lokasi', 105, 30);
        doc.text('Jenis Kunjungan', 155, 30);
        yPosition = 40;
      }
      
      const visitTypeText = visit.visitType === 'physical' ? 'Kunjungan Fisik' : 
                          visit.visitType === 'virtual' ? 'Kunjungan Virtual' : 'Telepon';
      
      doc.text(new Date(visit.date).toLocaleDateString('id-ID'), 15, yPosition);
      doc.text(getTeacherName(visit.teacherId), 45, yPosition);
      doc.text(visit.location, 105, yPosition);
      doc.text(visitTypeText, 155, yPosition);
      
      yPosition += 10;
      
      // Add students visited
      doc.text('Siswa yang Dikunjungi:', 20, yPosition);
      yPosition += 7;
      visit.visitedStudentIds.forEach((studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
          doc.text(`- ${student.name}`, 25, yPosition);
          yPosition += 7;
        }
      });
      
      // Add notes if any
      if (visit.visitNotes) {
        yPosition += 3;
        doc.text('Catatan:', 20, yPosition);
        yPosition += 7;
        const textLines = doc.splitTextToSize(visit.visitNotes, 170);
        textLines.forEach((line: string) => {
          doc.text(line, 25, yPosition);
          yPosition += 7;
        });
      }
      
      yPosition += 10;
    });
    
    doc.save(`rekap_monitoring_guru_${periodText}_${selectedDate}.pdf`);
  };

  return (
    <Layout title="Rekap Monitoring Kunjungan" role="admin">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Rekap Monitoring Kunjungan PKL</h2>
          <p className="text-sm text-gray-500">Laporan kunjungan guru pembimbing ke lokasi PKL</p>
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
            <label className="block text-sm font-medium text-gray-700">Guru</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Semua Guru</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Cari</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Cari nama atau lokasi"
              />
            </div>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredVisits.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Tidak ada data yang sesuai dengan filter</p>
          </div>
        ) : (
          filteredVisits.map((visit) => (
            <div key={visit.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {new Date(visit.date).toLocaleDateString('id-ID')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Guru: {getTeacherName(visit.teacherId)}
                  </p>
                </div>
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
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Lokasi/Perusahaan:</p>
                <p className="text-sm text-gray-700 mt-1">{visit.location}</p>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Siswa yang Dikunjungi:</p>
                <ul className="mt-1 text-sm text-gray-700 list-disc list-inside pl-2">
                  {visit.visitedStudentIds.map((studentId: string) => {
                    const student = students.find(s => s.id === studentId);
                    return student ? (
                      <li key={studentId}>{student.name}</li>
                    ) : null;
                  })}
                </ul>
              </div>
              
              {visit.visitNotes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Catatan Kunjungan:</p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{visit.visitNotes}</p>
                </div>
              )}
              
              {visit.issuedFollowUp && visit.followUpNotes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Tindak Lanjut:</p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{visit.followUpNotes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default AdminTeacherMonitoring;
