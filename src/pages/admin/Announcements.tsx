import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Announcement, UserRole } from '../../types';
import { useForm } from 'react-hook-form';
import { FilePlus, Pencil, Trash } from 'lucide-react';

const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Announcement>();
  
  useEffect(() => {
    // Load announcements from localStorage
    const storedAnnouncements = localStorage.getItem('announcements');
    if (storedAnnouncements) {
      setAnnouncements(JSON.parse(storedAnnouncements));
    }
  }, []);
  
  const handleSave = (data: any) => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    const announcementData: Announcement = {
      ...data,
      id: editing?.id || Date.now().toString(),
      publishedBy: currentUser.id,
      date: new Date().toISOString()
    };
    
    let updatedAnnouncements: Announcement[];
    
    if (editing) {
      // Update existing announcement
      updatedAnnouncements = announcements.map(item => 
        item.id === editing.id ? announcementData : item
      );
    } else {
      // Add new announcement
      updatedAnnouncements = [...announcements, announcementData];
    }
    
    // Save to localStorage
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    setAnnouncements(updatedAnnouncements);
    
    // Reset form
    setEditing(null);
    setShowForm(false);
    reset();
  };
  
  const handleEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setShowForm(true);
    reset(announcement);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Anda yakin ingin menghapus pengumuman ini?')) {
      const updatedAnnouncements = announcements.filter(item => item.id !== id);
      localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
      setAnnouncements(updatedAnnouncements);
    }
  };
  
  return (
    <Layout title="Pengumuman" role="admin">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Daftar Pengumuman</h2>
          <p className="text-sm text-gray-500">Kelola pengumuman untuk siswa dan guru</p>
        </div>
        <div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
              reset({
                id: '',
                title: '',
                content: '',
                date: '',
                publishedBy: '',
                forRoles: ['student', 'teacher']
              });
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Tambah Pengumuman
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editing ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
          </h3>
          <form onSubmit={handleSubmit(handleSave)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Judul</label>
                <input
                  type="text"
                  {...register('title', { required: 'Judul wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Isi Pengumuman</label>
                <textarea
                  rows={4}
                  {...register('content', { required: 'Isi pengumuman wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                ></textarea>
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Ditujukan untuk</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="role-student"
                      type="checkbox"
                      value="student"
                      {...register('forRoles')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="role-student" className="ml-2 block text-sm text-gray-700">
                      Siswa
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="role-teacher"
                      type="checkbox"
                      value="teacher"
                      {...register('forRoles')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="role-teacher" className="ml-2 block text-sm text-gray-700">
                      Guru
                    </label>
                  </div>
                </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ditujukan Untuk</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <tr key={announcement.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{announcement.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(announcement.date).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {announcement.forRoles.includes('student') && 
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                      Siswa
                    </span>
                  }
                  {announcement.forRoles.includes('teacher') && 
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Guru
                    </span>
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Belum ada pengumuman
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminAnnouncements;
