import React, { useState } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const PrescriptionMaker = ({ appointment, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('digital');
  const [loading, setLoading] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);

  // Digital state
  const [digitalData, setDigitalData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    doctorName: appointment?.doctorId?.name || '',
    doctorDetails: appointment?.doctorId?.specialization || 'General Physician',
    patientName: `${appointment?.patientId?.firstName || ''} ${appointment?.patientId?.lastName || ''}`,
    patientDetails: `Age: ${appointment?.patientId?.age || 'N/A'}, Gender: ${appointment?.patientId?.gender || 'N/A'}`,
    medicines: [{ name: '', dosage: '', duration: '', timeToTake: '' }],
    notes: ''
  });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a file');

    setLoading(true);
    const formData = new FormData();
    formData.append('prescription', selectedFile);

    try {
      await api.post(`/appointments/${appointment._id}/prescription/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Prescription uploaded successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload prescription');
    } finally {
      setLoading(false);
    }
  };

  const addMedicineRow = () => {
    setDigitalData({
      ...digitalData,
      medicines: [...digitalData.medicines, { name: '', dosage: '', duration: '', timeToTake: '' }]
    });
  };

  const updateMedicine = (index, field, value) => {
    const updatedMedicines = [...digitalData.medicines];
    updatedMedicines[index][field] = value;
    setDigitalData({ ...digitalData, medicines: updatedMedicines });
  };

  const removeMedicine = (index) => {
    const updatedMedicines = digitalData.medicines.filter((_, i) => i !== index);
    setDigitalData({ ...digitalData, medicines: updatedMedicines });
  };

  const handleDigitalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/appointments/${appointment._id}/prescription/digital`, digitalData);
      toast.success('Digital prescription created');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create digital prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">medical_information</span>
            Create Prescription
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest">
          <button 
            onClick={() => setActiveTab('digital')}
            className={`flex-1 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'digital' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container'}`}
          >
            Create Digital Prescription
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'upload' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container'}`}
          >
            Upload File
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-surface">
          {activeTab === 'upload' ? (
            <form onSubmit={handleUploadSubmit} className="mx-auto py-10 space-y-6">
              <div className="border-2 border-dashed border-primary/30 rounded-3xl p-10 text-center hover:bg-primary/5 transition-colors cursor-pointer relative">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.png,.jpg,.jpeg" />
                <span className="material-symbols-outlined text-5xl text-primary/50 mb-4">cloud_upload</span>
                <p className="font-bold text-on-surface mb-1">Click or drag file to upload</p>
                <p className="text-sm text-on-surface-variant">Supports PDF, PNG, JPG</p>
                {selectedFile && (
                  <div className="mt-6 p-3 bg-primary-container/30 text-on-primary-container rounded-xl font-medium border border-primary/20">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={loading || !selectedFile}
                className="w-full py-4 rounded-full bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin material-symbols-outlined">refresh</span> : <span className="material-symbols-outlined">upload</span>}
                Upload Prescription
              </button>
            </form>
          ) : (
            <form onSubmit={handleDigitalSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Doctor Info</label>
                  <input type="text" value={digitalData.doctorName} onChange={e => setDigitalData({...digitalData, doctorName: e.target.value})} className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary outline-none mb-3 font-medium bg-surface" placeholder="Doctor Name" required />
                  <input type="text" value={digitalData.doctorDetails} onChange={e => setDigitalData({...digitalData, doctorDetails: e.target.value})} className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary outline-none font-medium bg-surface" placeholder="Specialization / Credentials" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Patient Info</label>
                  <input type="text" value={digitalData.patientName} onChange={e => setDigitalData({...digitalData, patientName: e.target.value})} className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary outline-none mb-3 font-medium bg-surface" placeholder="Patient Name" required />
                  <input type="text" value={digitalData.patientDetails} onChange={e => setDigitalData({...digitalData, patientDetails: e.target.value})} className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary outline-none font-medium bg-surface" placeholder="Age, Gender, Weight, etc." />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">prescriptions</span> Medicines
                  </h3>
                  <button type="button" onClick={addMedicineRow} className="text-sm font-bold text-primary flex items-center gap-1 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span> Add Medicine
                  </button>
                </div>
                
                <div className="space-y-3">
                  {digitalData.medicines.map((med, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl relative group items-center shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <input type="text" placeholder="Medicine Name (e.g. Paracetamol 500mg)" value={med.name} onChange={e => updateMedicine(index, 'name', e.target.value)} required className="flex-[2] min-w-[200px] p-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm font-medium" />
                      <input type="text" placeholder="Dosage (e.g. 1-0-1)" value={med.dosage} onChange={e => updateMedicine(index, 'dosage', e.target.value)} required className="flex-1 min-w-[120px] p-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm" />
                      <input type="text" placeholder="Duration (e.g. 5 days)" value={med.duration} onChange={e => updateMedicine(index, 'duration', e.target.value)} required className="flex-1 min-w-[120px] p-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm" />
                      <select value={med.timeToTake} onChange={e => updateMedicine(index, 'timeToTake', e.target.value)} required className="flex-1 min-w-[140px] p-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white cursor-pointer">
                        <option value="">When to take?</option>
                        <option value="Before Food">Before Food</option>
                        <option value="After Food">After Food</option>
                        <option value="Empty Stomach">Empty Stomach</option>
                        <option value="Anytime">Anytime</option>
                      </select>
                      {digitalData.medicines.length > 1 && (
                        <button type="button" onClick={() => removeMedicine(index)} className="w-10 h-10 rounded-full text-error hover:bg-error/10 flex items-center justify-center transition-colors shrink-0">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Additional Instructions / Notes</label>
                <textarea 
                  rows="3" 
                  value={digitalData.notes} 
                  onChange={e => setDigitalData({...digitalData, notes: e.target.value})} 
                  placeholder="Drink plenty of water, avoid spicy food..."
                  className="w-full p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none resize-none font-medium bg-surface-container-lowest"
                />
              </div>

              <div className="pt-4 border-t border-outline-variant/30 flex justify-end gap-4 sticky bottom-0 bg-surface z-10 pb-2">
                <button type="button" onClick={onClose} className="px-8 py-3 rounded-full font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 shadow-md transition-all flex items-center gap-2">
                  {loading ? <span className="animate-spin material-symbols-outlined">refresh</span> : <span className="material-symbols-outlined">check_circle</span>}
                  Generate Prescription
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionMaker;
