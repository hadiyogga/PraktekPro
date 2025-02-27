import { Attendance, DailyReport, Student } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

type TimeRange = 'daily' | 'weekly' | 'monthly';
type ReportFormat = 'excel' | 'pdf';

interface DateFilter {
  startDate: string;
  endDate: string;
}

// Helper to create date filter
export const createDateFilter = (timeRange: TimeRange, selectedDate: string): DateFilter => {
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
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// Filter attendances based on date range and student/class
export const filterAttendances = (
  allAttendances: Attendance[],
  dateFilter: DateFilter,
  studentId?: string,
  className?: string,
  students?: Student[]
): Attendance[] => {
  return allAttendances.filter(attendance => {
    const attendanceDate = new Date(attendance.date);
    const startDate = new Date(dateFilter.startDate);
    const endDate = new Date(dateFilter.endDate);
    
    // Date is within range
    const dateInRange = attendanceDate >= startDate && attendanceDate <= endDate;
    
    // Student ID filter
    const studentIdMatch = !studentId || attendance.studentId === studentId;
    
    // Class filter
    let classMatch = true;
    if (className && students) {
      const student = students.find(s => s.id === attendance.studentId);
      classMatch = student?.class === className;
    }
    
    return dateInRange && studentIdMatch && classMatch;
  });
};

// Filter reports based on date range and student/class
export const filterReports = (
  allReports: DailyReport[],
  dateFilter: DateFilter,
  studentId?: string,
  className?: string,
  students?: Student[]
): DailyReport[] => {
  return allReports.filter(report => {
    const reportDate = new Date(report.date);
    const startDate = new Date(dateFilter.startDate);
    const endDate = new Date(dateFilter.endDate);
    
    // Date is within range
    const dateInRange = reportDate >= startDate && reportDate <= endDate;
    
    // Student ID filter
    const studentIdMatch = !studentId || report.studentId === studentId;
    
    // Class filter
    let classMatch = true;
    if (className && students) {
      const student = students.find(s => s.id === report.studentId);
      classMatch = student?.class === className;
    }
    
    return dateInRange && studentIdMatch && classMatch;
  });
};

// Export attendance data to Excel
export const exportAttendancesToExcel = (
  attendances: Attendance[],
  students: Student[],
  timeRange: TimeRange,
  dateFilter: DateFilter
) => {
  const data = attendances.map(attendance => {
    const student = students.find(s => s.id === attendance.studentId);
    return {
      'Tanggal': new Date(attendance.date).toLocaleDateString('id-ID'),
      'Nama': student?.name || 'Unknown',
      'NISN': student?.nisn || 'Unknown',
      'Kelas': student?.class || 'Unknown',
      'Status': attendance.status === 'present' ? 'Hadir' : 
                attendance.status === 'absent' ? 'Tidak Hadir' : 
                attendance.status === 'late' ? 'Terlambat' : 
                attendance.status === 'sick' ? 'Sakit' : 
                attendance.status === 'holiday' ? 'Libur' : 'Unknown',
      'Jam Masuk': attendance.checkInTime || '-',
      'Jam Pulang': attendance.checkOutTime || '-',
      'Catatan': attendance.notes || '-'
    };
  });
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  
  const periodText = timeRange === 'daily' ? 'Harian' : 
                    timeRange === 'weekly' ? 'Mingguan' : 'Bulanan';
                    
  XLSX.writeFile(workbook, `rekap_absensi_${periodText}_${dateFilter.startDate}_${dateFilter.endDate}.xlsx`);
};

// Export report data to Excel
export const exportReportToExcel = (
  reports: DailyReport[],
  students: Student[],
  timeRange: TimeRange,
  dateFilter: DateFilter
) => {
  const data = reports.map(report => {
    const student = students.find(s => s.id === report.studentId);
    return {
      'Tanggal': new Date(report.date).toLocaleDateString('id-ID'),
      'Nama': student?.name || 'Unknown',
      'NISN': student?.nisn || 'Unknown',
      'Kelas': student?.class || 'Unknown',
      'Kegiatan': report.activities,
      'Catatan': report.notes || '-'
    };
  });
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
  
  const periodText = timeRange === 'daily' ? 'Harian' : 
                    timeRange === 'weekly' ? 'Mingguan' : 'Bulanan';
                    
  XLSX.writeFile(workbook, `rekap_laporan_${periodText}_${dateFilter.startDate}_${dateFilter.endDate}.xlsx`);
};

// Export attendance data to PDF
export const exportAttendancesToPDF = (
  attendances: Attendance[],
  students: Student[],
  timeRange: TimeRange,
  dateFilter: DateFilter
) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  const periodText = timeRange === 'daily' ? 'Harian' : 
                   timeRange === 'weekly' ? 'Mingguan' : 'Bulanan';
  doc.text(`Rekap Absensi ${periodText}: ${dateFilter.startDate} s/d ${dateFilter.endDate}`, 20, 20);
  
  // Headers
  doc.setFontSize(12);
  doc.text('Tanggal', 20, 40);
  doc.text('Nama', 50, 40);
  doc.text('NISN', 100, 40);
  doc.text('Kelas', 130, 40);
  doc.text('Status', 160, 40);
  
  // Data
  let yPosition = 50;
  attendances.forEach((attendance, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 40;
      
      // Headers on new page
      doc.text('Tanggal', 20, 30);
      doc.text('Nama', 50, 30);
      doc.text('NISN', 100, 30);
      doc.text('Kelas', 130, 30);
      doc.text('Status', 160, 30);
      yPosition = 40;
    }
    
    const student = students.find(s => s.id === attendance.studentId);
    let statusText = 'Unknown';
    
    if (attendance.status === 'present') statusText = 'Hadir';
    else if (attendance.status === 'absent') statusText = 'Tidak Hadir';
    else if (attendance.status === 'late') statusText = 'Terlambat';
    else if (attendance.status === 'sick') statusText = 'Sakit';
    else if (attendance.status === 'holiday') statusText = 'Libur';
    
    doc.text(new Date(attendance.date).toLocaleDateString('id-ID'), 20, yPosition);
    doc.text(student?.name || 'Unknown', 50, yPosition);
    doc.text(student?.nisn || 'Unknown', 100, yPosition);
    doc.text(student?.class || 'Unknown', 130, yPosition);
    doc.text(statusText, 160, yPosition);
    
    yPosition += 10;
  });
  
  doc.save(`rekap_absensi_${periodText}_${dateFilter.startDate}_${dateFilter.endDate}.pdf`);
};

// Export reports data to PDF
export const exportReportsToPDF = (
  reports: DailyReport[],
  students: Student[],
  timeRange: TimeRange,
  dateFilter: DateFilter
) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  const periodText = timeRange === 'daily' ? 'Harian' : 
                   timeRange === 'weekly' ? 'Mingguan' : 'Bulanan';
  doc.text(`Rekap Laporan Kegiatan ${periodText}: ${dateFilter.startDate} s/d ${dateFilter.endDate}`, 20, 20);
  
  // Headers
  doc.setFontSize(12);
  doc.text('Tanggal', 20, 40);
  doc.text('Nama', 50, 40);
  doc.text('NISN', 100, 40);
  doc.text('Kelas', 130, 40);
  
  // Data
  let yPosition = 50;
  reports.forEach((report, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 40;
      
      // Headers on new page
      doc.text('Tanggal', 20, 30);
      doc.text('Nama', 50, 30);
      doc.text('NISN', 100, 30);
      doc.text('Kelas', 130, 30);
      yPosition = 40;
    }
    
    const student = students.find(s => s.id === report.studentId);
    
    doc.text(new Date(report.date).toLocaleDateString('id-ID'), 20, yPosition);
    doc.text(student?.name || 'Unknown', 50, yPosition);
    doc.text(student?.nisn || 'Unknown', 100, yPosition);
    doc.text(student?.class || 'Unknown', 130, yPosition);
    
    yPosition += 10;
    
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 40;
    }
    
    // Add activities with word wrapping
    doc.text('Kegiatan:', 20, yPosition);
    yPosition += 10;
    
    const activities = report.activities.split('\n');
    activities.forEach(line => {
      const textLines = doc.splitTextToSize(line, 170);
      textLines.forEach(textLine => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 40;
        }
        doc.text(textLine, 30, yPosition);
        yPosition += 8;
      });
    });
    
    yPosition += 10;
  });
  
  doc.save(`rekap_laporan_${periodText}_${dateFilter.startDate}_${dateFilter.endDate}.pdf`);
};
