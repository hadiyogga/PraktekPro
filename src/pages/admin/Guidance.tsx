import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getStudents, getTeachers } from '../../utils/dataUtils';
import { Student, Teacher } from '../../types';
import { Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const AdminGuidance: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  useEffect(() => {
    const allStudents = getStudents();
    const allTeachers = getTeachers();
    
    setStudents(allStudents);
    setTeachers(allTeachers);
    
    // Extract unique classes
    const uniqueClasses = Array.from(new Set(allStudents.map(student => student.class)));
    setClasses(uniqueClasses);
  }, []);
  
  const filteredStudents = selectedClass 
    ? students.filter(student => student.class === selectedClass)
    : students;
    
  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return 'Belum ditugaskan';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Belum ditugaskan';
  };
  
  const exportToExcel = () => {
    const data = filteredStudents.map(student => ({
      'NISN': student.nisn,
      'Nama Siswa': student.name,
      'Kelas': student.class,
      'Guru Pembimbing': getTeacherName(student.teacherId),
      'Status PKL': student.applicationStatus === 'approved' ? 'Disetujui' : 
                    student.applicationStatus === 'pending' ? 'Menunggu' : 
                    student.applicationStatus === 'rejected' ? 'Ditolak' : 
                    'Belum Mengajukan',
      'Lokasi PKL': student.internshipLocation || '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    const fileName = selectedClass 
      ? `siswa_bimbingan_${selectedClass.replace(/ /g, '_')}.xlsx`
      : 'siswa_bimbingan_semua.xlsx';
      
    XLSX.writeFile(workbook, fileName);
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text(`Data Siswa Bimbingan ${selectedClass ? selectedClass : 'Semua Kelas'}`, 20, 20);
    
    // Headers
    doc.setFontSize(11);
    doc.text('NISN', 20, 40);
    doc.text('Nama Siswa', 50, 40);
    doc.text('Kelas', 110, 40);
    doc.text('Guru Pembimbing', 140, 40);
    
    // Data
    let yPosition = 50;
    filteredStudents.forEach((student, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 40;
        
        // Headers on new page
        doc.text('NISN', 20, 30);
        doc.text('Nama Siswa', 50, 30);
        doc.text('Kelas', 110, 30);
        doc.text('Guru Pembimbing', 140, 30);
        yPosition = 40;
      }
      
      doc.text(student.nisn, 20, yPosition);
      doc.text(student.name, 50, yPosition);
      doc.text(student.class, 110, yPosition);
      doc.text(getTeacherName(student.teacherId), 140, yPosition);
      
      yPosition += 10;
    });
    
    const fileName = selectedClass 
      ? `siswa_bimbingan_${selectedClass.replace(/ /g, '_')}.pdf`
      : 'siswa_bimbingan_semua.pdf';
      
    doc.save(fileName);
  };
  
  return (
    <Layout title="Siswa Bimbingan" role="admin">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Data Siswa Bimbingan</h2>
          <p className="text-sm text-gray-500">Manajemen siswa dan guru pembimbing PKL</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Semua Kelas</option>
            {classes.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
          
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NISN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru Pembimbing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status PKL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi PKL</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.nisn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeacherName(student.teacherId)}</td>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.internshipLocation || '-'}
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada data yang sesuai dengan filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminGuidance;
