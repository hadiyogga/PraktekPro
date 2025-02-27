import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { AppSettings } from '../../types';
import { useForm } from 'react-hook-form';
import { backupData, restoreData } from '../../utils/dataUtils';
import { Squircle, Download, Save, Upload } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppSettings>();
  
  useEffect(() => {
    // Load settings from localStorage
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setSettings(parsedSettings);
      reset(parsedSettings);
    }
  }, [reset]);
  
  const handleSave = (data: AppSettings) => {
    localStorage.setItem('settings', JSON.stringify(data));
    setSettings(data);
    alert('Pengaturan berhasil disimpan');
  };
  
  const handleBackup = () => {
    const backupString = backupData();
    
    // Create and download backup file
    const blob = new Blob([backupString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pkl-system-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const success = restoreData(content);
        if (success) {
          alert('Data berhasil dipulihkan. Halaman akan dimuat ulang.');
          window.location.reload();
        } else {
          alert('Gagal memulihkan data. Format file tidak valid.');
        }
      } catch (error) {
        alert('Terjadi kesalahan saat memulihkan data.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };
  
  const handleDeleteAllData = () => {
    if (window.confirm('PERINGATAN: Semua data akan dihapus! Apakah Anda yakin ingin melanjutkan?')) {
      if (window.prompt('Ketik "HAPUS" untuk konfirmasi penghapusan data') === 'HAPUS') {
        // Default settings to preserve
        const currentSettings = JSON.parse(localStorage.getItem('settings') || '{}');
        
        // Clear all data from localStorage
        localStorage.clear();
        
        // Restore settings
        localStorage.setItem('settings', JSON.stringify(currentSettings));
        
        // Initialize with empty arrays for each data type
        localStorage.setItem('users', JSON.stringify([]));
        localStorage.setItem('applications', JSON.stringify([]));
        localStorage.setItem('attendances', JSON.stringify([]));
        localStorage.setItem('chats', JSON.stringify([]));
        localStorage.setItem('reports', JSON.stringify([]));
        localStorage.setItem('announcements', JSON.stringify([]));
        
        alert('Semua data telah dihapus. Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('Penghapusan data dibatalkan.');
      }
    }
  };
  
  if (!settings) {
    return <Layout title="Pengaturan" role="admin">Loading...</Layout>;
  }
  
  return (
    <Layout title="Pengaturan" role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Pengaturan Aplikasi</h2>
          <p className="text-sm text-gray-500">Konfigurasi sistem PKL</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit(handleSave)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
                <input
                  type="text"
                  {...register('schoolName', { required: 'Nama sekolah wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.schoolName && <p className="mt-1 text-sm text-red-600">{errors.schoolName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Alamat Sekolah</label>
                <textarea
                  rows={2}
                  {...register('schoolAddress', { required: 'Alamat sekolah wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                ></textarea>
                {errors.schoolAddress && <p className="mt-1 text-sm text-red-600">{errors.schoolAddress.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tahun Ajaran</label>
                <input
                  type="text"
                  {...register('currentAcademicYear', { required: 'Tahun ajaran wajib diisi' })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.currentAcademicYear && <p className="mt-1 text-sm text-red-600">{errors.currentAcademicYear.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Mulai PKL</label>
                  <input
                    type="date"
                    {...register('internshipPeriod.start', { required: 'Tanggal mulai PKL wajib diisi' })}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.internshipPeriod?.start && <p className="mt-1 text-sm text-red-600">{errors.internshipPeriod.start.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Selesai PKL</label>
                  <input
                    type="date"
                    {...register('internshipPeriod.end', { required: 'Tanggal selesai PKL wajib diisi' })}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.internshipPeriod?.end && <p className="mt-1 text-sm text-red-600">{errors.internshipPeriod.end.message}</p>}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan Pengaturan
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Restore Data</h3>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={handleBackup}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Backup
              </button>
              <p className="mt-1 text-sm text-gray-500">
                Download seluruh data aplikasi dalam format JSON
              </p>
            </div>
            
            <div>
              <label htmlFor="restore-file" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload Backup
              </label>
              <input
                id="restore-file"
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
              />
              <p className="mt-1 text-sm text-gray-500">
                Pulihkan data dari file backup (JSON)
              </p>
            </div>
          </div>
        </div>
        
        {/* Delete All Data Section */}
        <div className="bg-red-50 shadow rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Squircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Hapus Seluruh Data</h3>
              <div className="mt-2">
                <p className="text-sm text-red-700">
                  Tindakan ini akan menghapus seluruh data di sistem, termasuk data siswa, guru, pengajuan PKL, absensi, dan laporan.
                  Data yang dihapus tidak dapat dikembalikan kecuali Anda memiliki backup.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleDeleteAllData}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Hapus Semua Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;
