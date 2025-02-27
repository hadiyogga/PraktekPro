import React, { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { getTeachers, saveTeacher, deleteTeacher, importTeachersFromExcel, exportTeachersToExcel } from '../../utils/dataUtils';
import { Teacher } from '../../types';
import { useForm } from 'react-hook-form';
import { Download, FilePlus, Pencil, Search, Trash, Upload } from 'lucide-react';
import AccountCard from '../../components/AccountCard';

const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(getTeachers());
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>(getTeachers());
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Teacher>();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredTeachers(teachers);
      return;
    }
    
    const filtered = teachers.filter(
      teacher => 
        teacher.name.toLowerCase().includes(term) ||
        teacher.nip.toLowerCase().includes(term) ||
        teacher.subject.toLowerCase().includes(term)
    );
    
    setFilteredTeachers(filtered);
  };
  
  const handleSave = (data: any) => {
    const teacherData: Teacher = {
      ...data,
      id: editing?.id || Date.now().toString(),
      role: 'teacher'
    };
    
    saveTeacher(teacherData);
    const updatedTeachers = getTeachers();
    setTeachers(updatedTeachers);
    setFilteredTeachers(updatedTeachers);
    setEditing(null);
    setShowForm(false);
    reset();
  };
  
  const handleEdit = (teacher: Teacher) => {
    setEditing(teacher);
    setShowForm(true);
    reset(teacher);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Anda yakin ingin menghapus guru ini?')) {
      deleteTeacher(id);
      const updatedTeachers = getTeachers();
      setTeachers(updatedTeachers);
      setFilteredTeachers(updatedTeachers);
    }
  };
  
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const importedTeachers = await importTeachersFromExcel(file);
      
      // Save imported teachers
      importedTeachers.forEach(teacher => {
        saveTeacher(teacher);
      });
      
      const updatedTeachers = getTeachers();
      setTeachers(updatedTeachers);
      setFilteredTeachers(updatedTeachers);
      alert(`Berhasil mengimpor ${importedTeachers.length} guru`);
    } catch (error) {
      alert('Gagal mengimpor data: ' + (error as Error).message);
    }
  };
  
  return (
    <Layout title="Data Guru" role="admin">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Daftar Guru</h2>
          <p className="text-sm text-gray-500">Kelola data guru pembimbing PKL</p>
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
            onClick={exportTeachersToExcel}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          <AccountCard users={teachers} type="teacher" />
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
              reset({
                id: '',
                username: '',
                password: 'teacher123',
                name: '',
                role: 'teacher',
                nip: '',
                subject: ''
              });
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Tambah Guru
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editing ? 'Edit Guru' : 'Tambah Guru Baru'}
          </h3>
          <form onSubmit={handleSubmit(handleSave)}>
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">NIP</label>
                <input
                  type="text"
                  {...register('nip', { required: 'NIP wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.nip && <p className="mt-1 text-sm text-red-600">{errors.nip.message}</p>}
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
                <label className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
                <input
                  type="text"
                  {...register('subject', { required: 'Mata pelajaran wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
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
            placeholder="Cari guru berdasarkan nama, NIP, atau mata pelajaran"
          />
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.nip}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTeachers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada guru yang sesuai dengan pencarian' : 'Belum ada data guru'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminTeachers;
