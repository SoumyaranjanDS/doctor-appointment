import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    // Generate next 7 days
    const today = new Date();
    const generatedDates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
    setDates(generatedDates);
    setSelectedDate(generatedDates[0]);
  }, []);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        if (res.data && res.data.success) {
          setDoctor(res.data.data);
        } else {
          console.error('Failed to fetch doctor', res.data.message);
        }
      } catch (err) {
        console.error('Failed to fetch doctor', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (doctor && selectedDate) {
      const fetchSlots = async () => {
        try {
          const dateString = selectedDate.toISOString().split('T')[0];
          const res = await api.get(`/appointments/available-slots?doctorId=${doctor._id}&date=${dateString}`);
          setSlots(res.data);
        } catch (err) {
          console.error('Failed to fetch slots', err);
          setSlots([]);
        }
      };
      fetchSlots();
      setSelectedSlot(null); // Reset selection on date change
    }
  }, [doctor, selectedDate]);

  const handleRequestAppointment = async () => {
    if (!selectedSlot) return;
    setBookingLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      await api.post('/appointments/request', {
        doctorId: doctor._id,
        date: dateString,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reasonForVisit: 'General Consultation'
      });
      alert('Appointment requested successfully! It is now awaiting doctor approval.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to request appointment. Ensure you are logged in as a patient.');
      if (err.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const getDayName = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  if (loading) return <div className="text-center p-20 font-body-lg text-primary">Loading doctor profile...</div>;
  if (!doctor) return <div className="text-center p-20 font-body-lg text-error">Doctor not found</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-5 md:px-10 py-section-gap grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      {/* Left Column: Doctor Details (8 cols) */}
      <div className="lg:col-span-8 space-y-section-gap">
        {/* Hero Profile Card */}
        <div className="glass-card rounded-10 p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-fixed/30 rounded-full blur-3xl -z-10 group-hover:bg-primary-fixed/40 transition-colors duration-500"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl -z-10"></div>
          <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0">
            <img 
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-[0px_8px_24px_rgba(11,95,165,0.15)]" 
              alt={doctor.name} 
              src={doctor.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80"}
            />
            <div className="absolute bottom-2 right-2 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-4" title="Verified Professional">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">Dr. {doctor.name}</h1>
                <p className="font-body-lg text-body-lg text-primary font-medium">{doctor.specialities?.join(', ') || 'General Physician'}</p>
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-1 bg-surface-container-high px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-md text-label-md text-on-surface">{doctor.rating || 'New'}</span>
                  <span className="font-body-md text-body-md text-on-surface-variant text-2">({doctor.reviewCount || 0} reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 bg-surface-container-low text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-[16px]">work_history</span> {doctor.experienceYears || 0} Years Exp.
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pt-2">
              {doctor.bio || 'A dedicated medical professional committed to providing the highest quality of patient care.'}
            </p>
          </div>
        </div>

        {/* Bento Grid Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-6 p-6 col-span-1 md:col-span-2">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span> About Dr. {doctor.name?.split(' ')[0]}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {doctor.bio || 'Information about the doctor is currently limited.'}
            </p>
          </div>

          <div className="glass-card rounded-6 p-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2 text-10">
              <span className="material-symbols-outlined text-primary">school</span> Education & Qualifications
            </h2>
            <ul className="space-y-4">
              {doctor.qualifications && doctor.qualifications.length > 0 ? (
                doctor.qualifications.map((qual, idx) => (
                  <li key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-primary before:rounded-full">
                    <h3 className="font-label-md text-label-md text-on-surface">{qual.degree}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant text-2">{qual.institution} • {qual.year}</p>
                  </li>
                ))
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant">No qualifications listed.</p>
              )}
            </ul>
          </div>

          <div className="glass-card rounded-6 p-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2 text-10">
              <span className="material-symbols-outlined text-primary">medical_services</span> Specializations
            </h2>
            <div className="flex flex-wrap gap-2">
              {doctor.specialities?.map((spec, idx) => (
                <span key={idx} className="bg-primary-container/10 text-primary-container font-label-md text-label-md px-3 py-1 rounded-full border border-primary-container/20">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Sticky Booking Card (4 cols) */}
      <div className="lg:col-span-4 relative">
        <div className="glass-panel rounded-6 p-6 sticky top-28">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-outline-variant/20 pb-4">Book Appointment</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-label-md text-label-md text-on-surface">Select Date</h3>
              <span className="font-body-md text-body-md text-primary font-medium text-2">
                {selectedDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {dates.map((date, idx) => {
                const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                return (
                  <button 
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center w-14 h-16 rounded-10 shrink-0 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border border-primary bg-primary text-on-primary shadow-[0px_4px_12px_rgba(0,71,127,0.2)] transform scale-105' 
                        : 'border border-outline-variant/30 bg-surface-container-lowest hover:border-primary hover:bg-primary-fixed/20 text-on-surface'
                    }`}
                  >
                    <span className={`font-label-sm text-label-sm ${isSelected ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                      {getDayName(date)}
                    </span>
                    <span className="font-label-md text-label-md text-6">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-label-md text-label-md text-on-surface mb-3">Select Time Slot</h3>
            <div className="grid grid-cols-3 gap-3">
              {slots.length > 0 ? (
                slots.map((slot, idx) => {
                  const isSelected = selectedSlot && selectedSlot.startTime === slot.startTime;
                  return (
                    <button 
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-6 font-body-md text-body-md text-2 transition-colors cursor-pointer ${
                        isSelected
                          ? 'border border-primary bg-primary text-on-primary'
                          : 'border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-4 bg-surface-variant/20 rounded-6 border border-outline-variant/10 text-on-surface-variant font-body-sm">
                  No slots available for this date.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-6 border border-outline-variant/20 mb-6">
            <span className="font-body-md text-body-md text-on-surface-variant">Consultation Fee</span>
            <span className="font-headline-md text-headline-md text-primary">${doctor.consultationFee}</span>
          </div>

          <button 
            onClick={handleRequestAppointment}
            disabled={!selectedSlot || bookingLoading}
            className={`w-full font-label-md text-label-md text-6 py-4 rounded-full flex justify-center items-center gap-2 transition-all duration-300 ${
              !selectedSlot || bookingLoading
                ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-50'
                : 'bg-[#4EF27A] text-[#002108] hover:shadow-6 hover:-translate-y-0.5 shadow-[0px_4px_20px_rgba(78,242,122,0.4)] cursor-pointer'
            }`}
          >
            {bookingLoading ? 'Requesting...' : 'Request Appointment'} <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
