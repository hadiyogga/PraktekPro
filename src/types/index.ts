// User types
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Student extends User {
  role: 'student';
  class: string;
  nisn: string;
  teacherId: string | null;
  applicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  internshipLocation?: string;
  internshipStartDate?: string;
  internshipEndDate?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  nip: string;
  subject: string;
}

export interface Admin extends User {
  role: 'admin';
}

// Chat types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Attendance types
export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'sick' | 'holiday';
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface TeacherMonitoring {
  id: string;
  teacherId: string;
  date: string;
  studentIds: string[];
  notes?: string;
}

// Report types
export interface DailyReport {
  id: string;
  studentId: string;
  date: string;
  activities: string;
  notes?: string;
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  publishedBy: string;
  forRoles: UserRole[];
}

// Application types
export interface InternshipApplication {
  id: string;
  studentId: string;
  companyName: string;
  companyAddress: string;
  position: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  submittedDate: string;
}

// Settings type
export interface AppSettings {
  schoolName: string;
  schoolAddress: string;
  schoolLogo?: string;
  currentAcademicYear: string;
  internshipPeriod: {
    start: string;
    end: string;
  };
}
