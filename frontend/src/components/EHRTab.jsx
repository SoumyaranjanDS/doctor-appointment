import React, { useState } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const EHRTab = ({ records, isPatient, onRecordsUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) {
      return toast.error('Please provide a title and select a file');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('record', selectedFile);
    formData.append('title', title);

    try {
      await api.post('/user/medical-records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Medical record uploaded successfully');
      setTitle('');
      setSelectedFile(null);
      if (onRecordsUpdated) onRecordsUpdated();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await api.delete(`/user/medical-records/${recordId}`);
      toast.success('Record deleted');
      if (onRecordsUpdated) onRecordsUpdated();
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {isPatient && (
        <div className="glass-card rounded-[24px] p-6 shadow-sm border border-outline-variant/30">
          <h2 className="text-headline-md font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">upload_file</span>
            Upload New Record
          </h2>
          <form onSubmit={handleUploadSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Document Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Blood Test Results, MRI Scan" 
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none" 
                required 
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Select File (PDF, PNG, JPG)</label>
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="w-full px-4 py-2 rounded-xl border border-outline-variant file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                accept=".pdf,.png,.jpg,.jpeg"
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !selectedFile || !title}
              className="px-8 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full md:w-auto justify-center"
            >
              {loading ? <span className="animate-spin material-symbols-outlined text-[20px]">refresh</span> : 'Upload'}
            </button>
          </form>
        </div>
      )}

      <div className="glass-card rounded-[24px] p-6 shadow-sm border border-outline-variant/30">
        <h2 className="text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">folder_open</span>
          {isPatient ? 'My Health Records' : "Patient's Health Records"}
        </h2>

        {(!records || records.length === 0) ? (
          <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/50">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-2">folder_off</span>
            <p className="text-on-surface-variant font-medium">No medical records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map(record => (
              <div key={record._id} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 hover:border-primary/30 hover:shadow-md transition-all group flex flex-col relative">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <h3 className="font-bold text-on-surface text-lg mb-1 truncate" title={record.title}>{record.title}</h3>
                <p className="text-sm text-on-surface-variant mb-4">Uploaded: {new Date(record.uploadedAt).toLocaleDateString()}</p>
                
                <div className="mt-auto pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                  <a 
                    href={record.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                  >
                    View Document <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </a>
                  {isPatient && (
                    <button 
                      onClick={() => handleDelete(record._id)}
                      className="w-8 h-8 rounded-full text-error hover:bg-error/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Record"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EHRTab;
