import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Admin } from '../../types';
import { useForm } from 'react-hook-form';
import { FilePlus, Pencil, Trash } from 'lucide-react';
import { saveAdmin, deleteAdmin } from '../../utils/dataUtils';

const AdminAccounts: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Admin>();
  
  useEffect(() => {
    loadAdmins();
  }, []);
  
  const loadAdmins = () => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUsers = allUsers.filter((user: any) => user.role === 'admin') as Admin[];
    setAdmins(adminUsers);
  };
  
  const handleSave = (data: any) => {
    const adminData: Admin = {
      ...data,
      id: editing?.id || Date.now().toString(),
      role: 'admin'
    };
    
    // Get current user from session
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    // Save the admin
    saveAdmin(adminData);
    
    // Reload the admin list
    loadAdmins();
    
    // If the current user is being edited, update the session
    if (currentUser.id === adminData.id) {
      sessionStorage.setItem('currentUser', JSON.stringify(adminData));
    }
    
    // Close the form
    setEditing(null);
    setShowForm(false);
    reset();
  };
  
  const handleEdit = (admin: Admin) => {
    setEditing(admin);
    setShowForm(true);
    reset(admin);
  };
  
  const handleDelete = (id: string) => {
    // Get current user from session
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    // Don't allow deleting your own account
    if (currentUser.id === id) {
      alert('Anda tidak dapat menghapus akun yang sedang digunakan.');
      return;
    }
    
    if (window.confirm('Anda yakin ingin menghapus admin ini?')) {
      deleteAdmin(id);
      loadAdmins();
    }
  };
  
  return (
    <Layout title="Akun Admin" role="admin">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Daftar Akun Admin</h2>
          <p className="text-sm text-gray-500">Kelola akun admin untuk sistem PKL</p>
        </div>
        <div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
              reset({
                id: '',
                username: '',
                password: 'admin123',
                name: '',
                role: 'admin'
              });
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Tambah Admin
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editing ? 'Edit Admin' : 'Tambah Admin Baru'}
          </h3>
          <form onSubmit={handleSubmit(handleSave)}>
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
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
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input
                  type="text"
                  {...register('name', { required: 'Nama wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
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
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(admin)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  Belum ada data admin
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminAccounts;
