import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../config/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [appointment, setAppointment] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await api.get(`/appointments/verify-payment?session_id=${sessionId}`);
        setAppointment(res.data);
        setStatus('success');
      } catch (err) {
        console.error('Verification failed:', err);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId]);

  const generatePDF = async () => {
    if (!invoiceRef.current || !appointment) return;
    setIsGeneratingPdf(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MediBook_Invoice_${appointment._id.substring(0, 8)}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF invoice.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6"
        >
          <span className="material-symbols-outlined text-primary text-[40px] animate-spin">sync</span>
        </motion.div>
        <h1 className="font-headline-md text-on-surface mb-2">Verifying Payment...</h1>
        <p className="font-body-md text-on-surface-variant">Please wait while we confirm your transaction securely with Stripe.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="glass-card max-w-md w-full p-8 text-center rounded-6 border-t-4 border-error">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-error text-[40px]">error</span>
          </div>
          <h1 className="font-headline-md text-on-surface mb-2">Verification Failed</h1>
          <p className="font-body-md text-on-surface-variant mb-8">
            We could not verify this payment session. Please check your dashboard or contact support.
          </p>
          <Link to="/dashboard" className="bg-primary text-on-primary px-6 py-3 rounded-full hover:shadow-2 transition-shadow">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Confetti Background elements */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }} 
        animate={{ y: -500, opacity: [0, 1, 0] }} 
        transition={{ duration: 3, delay: 0.2 }}
        className="absolute left-1/4 w-4 h-4 bg-[#4EF27A] rounded-full"
      />
      <motion.div 
        initial={{ y: 100, opacity: 0 }} 
        animate={{ y: -600, opacity: [0, 1, 0] }} 
        transition={{ duration: 3.5, delay: 0.4 }}
        className="absolute right-1/3 w-6 h-6 bg-primary rounded-full"
      />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-card p-8 md:p-12 text-center rounded-[32px] shadow-2xl relative overflow-hidden">
          {/* Animated Checkmark */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            className="w-24 h-24 bg-[#4EF27A]/20 rounded-full flex items-center justify-center mx-auto mb-6 relative"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <span className="material-symbols-outlined text-[#008A28] text-[50px]">check_circle</span>
            </motion.div>
          </motion.div>

          <h1 className="text-display-sm font-bold text-on-surface mb-2">Payment Successful!</h1>
          <p className="font-body-lg text-on-surface-variant mb-10">
            Your appointment with <strong>Dr. {appointment?.doctorId?.name}</strong> is now confirmed.
          </p>

          {/* Invoice Render Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 text-left mb-8 relative">
            <div ref={invoiceRef} className="absolute top-[-9999px] left-[-9999px] w-[800px]" style={{ backgroundColor: '#ffffff', padding: '32px', color: '#1f2937', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ borderBottom: '2px solid #005FA3', paddingBottom: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#005FA3', margin: '0 0 4px 0' }}>MediBook Health</h1>
                  <p style={{ color: '#6b7280', margin: 0 }}>Official Payment Receipt / Invoice</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>INVOICE</h2>
                  <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>#{appointment?._id?.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                  <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Billed To:</h3>
                  <p style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>{appointment?.patientId?.firstName} {appointment?.patientId?.lastName}</p>
                  <p style={{ color: '#4b5563', margin: 0 }}>{appointment?.patientId?.email}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Service Provider:</h3>
                  <p style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>Dr. {appointment?.doctorId?.name}</p>
                  <p style={{ color: '#4b5563', margin: 0 }}>{appointment?.doctorId?.specialities?.[0]}</p>
                </div>
              </div>

              <table style={{ width: '100%', marginBottom: '32px', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 16px', borderTopLeftRadius: '8px' }}>Description</th>
                    <th style={{ padding: '12px 16px' }}>Date & Time</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderTopRightRadius: '8px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px', fontWeight: '500', color: '#1f2937' }}>Medical Consultation</td>
                    <td style={{ padding: '16px', color: '#4b5563' }}>
                      {new Date(appointment?.date).toLocaleDateString()} <br/>
                      {appointment?.startTime} - {appointment?.endTime}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '500', color: '#1f2937' }}>${appointment?.amount?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                <div style={{ width: '256px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 'bold', fontSize: '18px', color: '#005FA3', borderTop: '2px solid #005FA3' }}>
                    <span>Total Paid:</span>
                    <span>${appointment?.amount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '48px', borderTop: '1px solid #e5e7eb', paddingTop: '32px' }}>
                <p style={{ margin: '0 0 4px 0' }}>Thank you for choosing MediBook Health. For any queries, contact support@medibook.com</p>
                <p style={{ margin: 0 }}>Payment processed securely via Stripe. Status: PAID</p>
              </div>
            </div>

            {/* Visual Receipt for UI */}
            <h3 className="font-label-lg font-bold text-on-surface mb-4 border-b border-outline-variant/30 pb-2">Receipt Details</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-on-surface-variant font-body-md">Date:</span>
              <span className="font-label-md text-on-surface">{new Date(appointment?.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-on-surface-variant font-body-md">Time:</span>
              <span className="font-label-md text-on-surface">{appointment?.startTime}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-body-md">Provider:</span>
              <span className="font-label-md text-on-surface">Dr. {appointment?.doctorId?.name}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-on-surface">Total Paid:</span>
              <span className="font-bold text-primary">${appointment?.amount?.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={generatePDF}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto bg-surface-container-high text-on-surface font-label-md px-6 py-3 rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">{isGeneratingPdf ? 'hourglass_empty' : 'download'}</span> 
              {isGeneratingPdf ? 'Generating PDF...' : 'Download Invoice'}
            </button>
            <Link 
              to="/dashboard"
              className="w-full sm:w-auto bg-primary text-on-primary font-label-md px-6 py-3 rounded-full hover:shadow-6 transition-all flex items-center justify-center gap-2"
            >
              Go to Dashboard <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
