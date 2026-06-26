import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateInvoice = async (appointment, currentUser) => {
  // 1. Create a container off-screen
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '40px';
  container.style.fontFamily = 'sans-serif';
  container.style.color = '#333333';
  
  const isPatientPopulated = appointment.patientId && typeof appointment.patientId === 'object' && appointment.patientId.firstName;
  const patientName = isPatientPopulated 
    ? `${appointment.patientId.firstName} ${appointment.patientId.lastName}` 
    : (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Patient');
  
  const pId = isPatientPopulated 
    ? appointment.patientId._id 
    : (typeof appointment.patientId === 'string' ? appointment.patientId : (currentUser?._id || 'UNKNOWN'));

  // 2. Build the HTML content
  const htmlContent = `
    <div style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #005FA3; padding-bottom: 20px; mb-6">
        <div>
          <h1 style="color: #005FA3; margin: 0; font-size: 28px; font-weight: bold;">MediBook Health</h1>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Official Payment Receipt</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 20px; color: #333;">RECEIPT</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Receipt No: ${appointment._id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin: 30px 0;">
        <div>
          <h3 style="margin: 0 0 10px 0; color: #555; font-size: 12px; text-transform: uppercase;">Billed To:</h3>
          <p style="margin: 0; font-weight: bold; font-size: 16px;">${patientName}</p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Patient ID: ${String(pId).substring(0, 8)}</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0 0 10px 0; color: #555; font-size: 12px; text-transform: uppercase;">Service Provided By:</h3>
          <p style="margin: 0; font-weight: bold; font-size: 16px;">Dr. ${appointment.doctorId?.name}</p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${appointment.doctorId?.specialities?.[0] || 'Medical Professional'}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; color: #555;">Description</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; color: #555;">Date of Service</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #555;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 15px 12px; border-bottom: 1px solid #eee;">
              <p style="margin: 0; font-weight: bold;">Medical Consultation</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Mode: ${appointment.meetingLink ? 'Video Consultation' : 'In-Person / Direct'}</p>
            </td>
            <td style="padding: 15px 12px; text-align: center; border-bottom: 1px solid #eee;">
              ${new Date(appointment.date).toLocaleDateString()}<br/>
              <span style="font-size: 12px; color: #666;">${appointment.startTime}</span>
            </td>
            <td style="padding: 15px 12px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">
              ₹${appointment.amount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
            <span style="color: #666;">Subtotal:</span>
            <span>₹${appointment.amount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 2px solid #333;">
            <span style="font-weight: bold; font-size: 18px;">Total Paid:</span>
            <span style="font-weight: bold; font-size: 18px; color: #005FA3;">₹${appointment.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 40px; text-align: center; color: #888; font-size: 12px;">
        <p>Payment Status: <span style="color: #2e7d32; font-weight: bold; text-transform: uppercase;">${appointment.paymentStatus === 'paid_at_clinic' ? 'PAID AT CLINIC' : 'PAID ONLINE'}</span></p>
        <p style="margin-top: 5px;">Thank you for trusting MediBook Health.</p>
        <p style="margin-top: 5px;">This is a computer generated receipt and does not require a signature.</p>
      </div>
    </div>
  `;
  
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // 3. Render HTML to canvas
    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    // 4. Generate PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // 5. Download PDF
    pdf.save(`Receipt_${appointment._id.substring(0, 8)}.pdf`);
    
  } catch (error) {
    console.error('Failed to generate receipt:', error);
    throw new Error('Failed to generate receipt PDF');
  } finally {
    // 6. Cleanup
    document.body.removeChild(container);
  }
};
