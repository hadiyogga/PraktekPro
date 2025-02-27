import React, { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { getStudents, getTeachers, saveStudent, deleteStudent, importStudentsFromExcel, exportStudentsToExcel, generateStudentPDF } from '../../utils/dataUtils';
import { Student, Teacher } from '../../types';
import { useForm } from 'react-hook-form';
import { Download, FilePlus, FileText, Pencil, Search, Trash, Upload } from 'lucide-react';
import AccountCard from '../../components/AccountCard';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(getStudents());
  const [editing, setEditing] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const teachers = getTeachers();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Student>();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(
      student => 
        student.name.toLowerCase().includes(term) ||
        student.nisn.toLowerCase().includes(term) ||
        student.class.toLowerCase().includes(term)
    );
    
    setFilteredStudents(filtered);
  };
  
  const handleSave = (data: any) => {
    const studentData: Student = {
      ...data,
      id: editing?.id || Date.now().toString(),
      role: 'student',
      applicationStatus: editing?.applicationStatus || 'none'
    };
    
    saveStudent(studentData);
    const updatedStudents = getStudents();
    setStudents(updatedStudents);
    setFilteredStudents(updatedStudents);
    setEditing(null);
    setShowForm(false);
    reset();
  };
  
  const handleEdit = (student: Student) => {
    setEditing(student);
    setShowForm(true);
    reset(student);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Anda yakin ingin menghapus siswa ini?')) {
      deleteStudent(id);
      const updatedStudents = getStudents();
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
    }
  };
  
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const importedStudents = await importStudentsFromExcel(file);
      
      // Save imported students
      importedStudents.forEach(student => {
        saveStudent(student);
      });
      
      const updatedStudents = getStudents();
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      alert(`Berhasil mengimpor ${importedStudents.length} siswa`);
    } catch (error) {
      alert('Gagal mengimpor data: ' + (error as Error).message);
    }
  };
  
  return (
    <Layout title="Data Siswa" role="admin">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Daftar Siswa</h2>
          <p className="text-sm text-gray-500">Kelola data siswa PKL</p>
        </div>
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </button>
          <button
            onClick={exportStudentsToExcel}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          <AccountCard users={students} type="student" />
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
              reset({
                id: '',
                username: '',
                password: 'student123',
                name: '',
                role: 'student',
                class: '',
                nisn: '',
                teacherId: null,
                applicationStatus: 'none'
              });
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Tambah Siswa
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editing ? 'Edit Siswa' : 'Tambah Siswa Baru'}
          </h3>
          <form onSubmit={handleSubmit(handleSave)}>
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">NISN</label>
                <input
                  type="text"
                  {...register('nisn', { required: 'NISN wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.nisn && <p className="mt-1 text-sm text-red-600">{errors.nisn.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  {...register('username', { required: 'Username wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  {...register('password', { required: 'Password wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input
                  type="text"
                  {...register('name', { required: 'Nama wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Kelas</label>
                <input
                  type="text"
                  {...register('class', { required: 'Kelas wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.class && <p className="mt-1 text-sm text-red-600">{errors.class.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Guru Pembimbing</label>
                <select
                  {...register('teacherId')}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">-- Pilih Guru Pembimbing --</option>
                  {teachers.map((teacher: Teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
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
      
      <div className="mb-4">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Cari siswa berdasarkan nama, NISN, atau kelas"
          />
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NISN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status PKL</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.nisn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(student)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => generateStudentPDF(student)}
                    className="text-green-600 hover:text-green-900 mr-2"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada siswa yang sesuai dengan pencarian' : 'Belum ada data siswa'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminStudents;
