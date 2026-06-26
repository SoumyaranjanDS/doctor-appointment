import React from 'react';

const PrescriptionViewer = ({ appointment, onClose }) => {
  const { prescription } = appointment;

  if (!prescription) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:rounded-none">
        
        {/* Header - Hidden on print */}
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest print:hidden">
          <h2 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            Prescription
          </h2>
          <div className="flex items-center gap-3">
            {prescription.type === 'digital' && (
              <button onClick={() => window.print()} className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors font-bold text-sm flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-[18px]">print</span> Print
              </button>
            )}
            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 print:p-0 print:overflow-visible">
          {prescription.type === 'upload' ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl">inventory_2</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-2">Uploaded Prescription</h3>
              <p className="text-body-lg text-on-surface-variant mb-8 mx-auto">
                This prescription was uploaded as a document file by the doctor.
              </p>
              <a 
                href={prescription.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold shadow-md hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined">visibility</span>
                View Document
              </a>
            </div>
          ) : (
            <div className="bg-white">
              {/* Prescription Header */}
              <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8">
                <div>
                  <h1 className="text-display-sm font-bold text-primary mb-1">Dr. {prescription.digitalData.doctorName}</h1>
                  <p className="text-title-md text-on-surface-variant font-medium">{prescription.digitalData.doctorDetails}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-title-lg font-bold text-on-surface">MediBook Health</h2>
                  <p className="text-body-md text-on-surface-variant mt-1">Digital Prescription</p>
                </div>
              </div>

              {/* Patient & Appointment Details */}
              <div className="flex flex-wrap justify-between gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 mb-8 print:border-none print:p-0">
                <div>
                  <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Patient Name</p>
                  <p className="text-title-md font-bold text-on-surface">{prescription.digitalData.patientName}</p>
                  <p className="text-body-md text-on-surface-variant mt-1">{prescription.digitalData.patientDetails}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Consultation Info</p>
                  <p className="text-title-md font-bold text-on-surface">
                    {new Date(prescription.digitalData.date).toLocaleDateString()}
                  </p>
                  <p className="text-body-md text-on-surface-variant mt-1">{prescription.digitalData.time}</p>
                </div>
              </div>

              {/* Rx Symbol */}
              <div className="mb-6">
                <span className="text-5xl font-serif font-bold text-on-surface">Rx</span>
              </div>

              {/* Medicines Table */}
              <div className="mb-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-outline-variant/50">
                      <th className="py-4 font-bold text-on-surface-variant uppercase text-sm w-12">#</th>
                      <th className="py-4 font-bold text-on-surface-variant uppercase text-sm">Medicine Name</th>
                      <th className="py-4 font-bold text-on-surface-variant uppercase text-sm">Dosage</th>
                      <th className="py-4 font-bold text-on-surface-variant uppercase text-sm">Duration</th>
                      <th className="py-4 font-bold text-on-surface-variant uppercase text-sm">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {prescription.digitalData.medicines.map((med, index) => (
                      <tr key={index}>
                        <td className="py-4 font-medium text-on-surface-variant">{index + 1}</td>
                        <td className="py-4 font-bold text-on-surface text-lg">{med.name}</td>
                        <td className="py-4 font-medium text-on-surface">{med.dosage}</td>
                        <td className="py-4 font-medium text-on-surface">{med.duration}</td>
                        <td className="py-4">
                          <span className="inline-block px-3 py-1 bg-surface-container-high rounded-full text-sm font-medium text-on-surface">
                            {med.timeToTake}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {prescription.digitalData.notes && (
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 mb-12">
                  <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">info</span>
                    Doctor's Advice / Notes
                  </h3>
                  <p className="text-on-surface whitespace-pre-wrap leading-relaxed">
                    {prescription.digitalData.notes}
                  </p>
                </div>
              )}

              {/* Footer Signature */}
              <div className="mt-16 pt-8 border-t border-outline-variant/30 flex justify-end">
                <div className="text-center">
                  <div className="w-48 h-12 border-b border-dashed border-outline-variant/50 mb-2 flex items-end justify-center">
                    <span className="font-signature text-2xl text-primary opacity-60 italic">{prescription.digitalData.doctorName}</span>
                  </div>
                  <p className="font-bold text-on-surface">Dr. {prescription.digitalData.doctorName}</p>
                  <p className="text-sm text-on-surface-variant">Electronically Signed</p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionViewer;
