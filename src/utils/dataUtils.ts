import { User, Student, Teacher, Admin, Announcement, AppSettings } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

// Initialize default data if not exists
export const initializeDefaultData = () => {
  // Check if data exists
  if (!localStorage.getItem('users')) {
    // Create default admin account
    const adminUser: Admin = {
      id: '1',
      username: 'admin',
      password: 'admin123',
      name: 'Administrator',
      role: 'admin'
    };

    // Create default teacher
    const teacherUser: Teacher = {
      id: '2',
      username: 'teacher1',
      password: 'teacher123',
      name: 'Budi Santoso',
      role: 'teacher',
      nip: '198512102010011002',
      subject: 'Komputer'
    };

    // Create default student
    const studentUser: Student = {
      id: '3',
      username: 'student1',
      password: 'student123',
      name: 'Ani Wijaya',
      role: 'student',
      class: 'XII RPL 1',
      nisn: '0051237584',
      teacherId: '2',
      applicationStatus: 'none'
    };

    // Default settings
    const settings: AppSettings = {
      schoolName: 'SMK Remaja Pluit',
      schoolAddress: 'Jl. Pluit Raya, Jakarta Utara',
      currentAcademicYear: '2023/2024',
      internshipPeriod: {
        start: '2023-07-01',
        end: '2023-12-31'
      }
    };

    // Default announcements
    const announcements: Announcement[] = [
      {
        id: '1',
        title: 'Pendaftaran PKL Dibuka',
        content: 'Pendaftaran PKL untuk semester ini telah dibuka. Silahkan ajukan permohonan melalui sistem.',
        date: '2023-06-01',
        publishedBy: '1',
        forRoles: ['student', 'teacher']
      }
    ];

    // Store data in localStorage
    localStorage.setItem('users', JSON.stringify([adminUser, teacherUser, studentUser]));
    localStorage.setItem('settings', JSON.stringify(settings));
    localStorage.setItem('announcements', JSON.stringify(announcements));
    localStorage.setItem('chats', JSON.stringify([]));
    localStorage.setItem('attendances', JSON.stringify([]));
    localStorage.setItem('teacherMonitorings', JSON.stringify([]));
    localStorage.setItem('reports', JSON.stringify([]));
    localStorage.setItem('applications', JSON.stringify([]));
  }
};

// User related functions
export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const getUser = (id: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};

export const getUserByUsername = (username: string): User | null => {
  const users = getUsers();
  return users.find(u => u.username === username) || null;
};

// Students functions
export const getStudents = (): Student[] => {
  const users = getUsers();
  return users.filter(user => user.role === 'student') as Student[];
};

export const saveStudent = (student: Student) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === student.id);
  
  if (index >= 0) {
    users[index] = student;
  } else {
    // New student
    student.id = Date.now().toString();
    users.push(student);
  }
  
  localStorage.setItem('users', JSON.stringify(users));
  return student;
};

export const deleteStudent = (id: string) => {
  const users = getUsers();
  const filtered = users.filter(user => user.id !== id);
  localStorage.setItem('users', JSON.stringify(filtered));
};

// Teachers functions
export const getTeachers = (): Teacher[] => {
  const users = getUsers();
  return users.filter(user => user.role === 'teacher') as Teacher[];
};

export const saveTeacher = (teacher: Teacher) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === teacher.id);
  
  if (index >= 0) {
    users[index] = teacher;
  } else {
    // New teacher
    teacher.id = Date.now().toString();
    users.push(teacher);
  }
  
  localStorage.setItem('users', JSON.stringify(users));
  return teacher;
};

export const deleteTeacher = (id: string) => {
  const users = getUsers();
  const filtered = users.filter(user => user.id !== id);
  localStorage.setItem('users', JSON.stringify(filtered));
};

// Admin functions
export const getAdmins = (): Admin[] => {
  const users = getUsers();
  return users.filter(user => user.role === 'admin') as Admin[];
};

export const saveAdmin = (admin: Admin) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === admin.id);
  
  if (index >= 0) {
    users[index] = admin;
  } else {
    // New admin
    admin.id = Date.now().toString();
    users.push(admin);
  }
  
  localStorage.setItem('users', JSON.stringify(users));
  return admin;
};

export const deleteAdmin = (id: string) => {
  const users = getUsers();
  const filtered = users.filter(user => user.id !== id);
  localStorage.setItem('users', JSON.stringify(filtered));
};

// Import/Export functions for students
export const importStudentsFromExcel = (file: File): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const students: Student[] = json.map((row: any, index) => ({
          id: Date.now().toString() + index,
          username: row.nisn || row.NISN,
          password: 'student123', // Default password
          name: row.name || row.NAME,
          role: 'student',
          class: row.class || row.CLASS,
          nisn: row.nisn || row.NISN,
          teacherId: null,
          applicationStatus: 'none'
        }));
        
        resolve(students);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const exportStudentsToExcel = () => {
  const students = getStudents();
  const data = students.map(student => ({
    'NISN': student.nisn,
    'Nama': student.name,
    'Kelas': student.class,
    'Status PKL': student.applicationStatus
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  XLSX.writeFile(workbook, 'daftar_siswa.xlsx');
};

// Import/Export functions for teachers
export const importTeachersFromExcel = (file: File): Promise<Teacher[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const teachers: Teacher[] = json.map((row: any, index) => ({
          id: Date.now().toString() + index,
          username: row.nip || row.NIP,
          password: 'teacher123', // Default password
          name: row.name || row.NAME,
          role: 'teacher',
          nip: row.nip || row.NIP,
          subject: row.subject || row.SUBJECT || row.mapel || row.MAPEL
        }));
        
        resolve(teachers);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const exportTeachersToExcel = () => {
  const teachers = getTeachers();
  const data = teachers.map(teacher => ({
    'NIP': teacher.nip,
    'Nama': teacher.name,
    'Mata Pelajaran': teacher.subject
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');
  XLSX.writeFile(workbook, 'daftar_guru.xlsx');
};

// PDF generation
export const generateStudentPDF = (student: Student) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Data Siswa PKL SMK Remaja Pluit', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Nama: ${student.name}`, 20, 40);
  doc.text(`NISN: ${student.nisn}`, 20, 50);
  doc.text(`Kelas: ${student.class}`, 20, 60);
  doc.text(`Status PKL: ${student.applicationStatus}`, 20, 70);
  
  if (student.internshipLocation) {
    doc.text(`Lokasi PKL: ${student.internshipLocation}`, 20, 80);
  }
  
  if (student.internshipStartDate && student.internshipEndDate) {
    doc.text(`Periode PKL: ${student.internshipStartDate} s/d ${student.internshipEndDate}`, 20, 90);
  }
  
  doc.save(`data_siswa_${student.nisn}.pdf`);
};

// Backup and restore
export const backupData = (): string => {
  const data = {
    users: JSON.parse(localStorage.getItem('users') || '[]'),
    settings: JSON.parse(localStorage.getItem('settings') || '{}'),
    announcements: JSON.parse(localStorage.getItem('announcements') || '[]'),
    chats: JSON.parse(localStorage.getItem('chats') || '[]'),
    attendances: JSON.parse(localStorage.getItem('attendances') || '[]'),
    teacherMonitorings: JSON.parse(localStorage.getItem('teacherMonitorings') || '[]'),
    reports: JSON.parse(localStorage.getItem('reports') || '[]'),
    applications: JSON.parse(localStorage.getItem('applications') || '[]')
  };
  
  return JSON.stringify(data);
};

export const restoreData = (jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.users) localStorage.setItem('users', JSON.stringify(data.users));
    if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
    if (data.announcements) localStorage.setItem('announcements', JSON.stringify(data.announcements));
    if (data.chats) localStorage.setItem('chats', JSON.stringify(data.chats));
    if (data.attendances) localStorage.setItem('attendances', JSON.stringify(data.attendances));
    if (data.teacherMonitorings) localStorage.setItem('teacherMonitorings', JSON.stringify(data.teacherMonitorings));
    if (data.reports) localStorage.setItem('reports', JSON.stringify(data.reports));
    if (data.applications) localStorage.setItem('applications', JSON.stringify(data.applications));
    
    return true;
  } catch (error) {
    console.error('Failed to restore data:', error);
    return false;
  }
};
