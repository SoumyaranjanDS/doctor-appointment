import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../config/api";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
// --- Mock Data ---
const trustIndicators = [
  {
    icon: "verified_user",
    text: "Verified Doctors",
  },
  {
    icon: "lock",
    text: "Secure Records",
  },
  {
    icon: "video_camera_front",
    text: "Online & Clinic",
  },
  {
    icon: "payments",
    text: "Safe Payments",
  },
  {
    icon: "notifications_active",
    text: "Reminders",
  },
  {
    icon: "prescriptions",
    text: "Digital Rx",
  },
];
const reviews = [
  {
    id: 1,
    name: "J.D.",
    type: "Online Consult",
    text: "Very seamless experience booking an online consult. The doctor was punctual and the digital prescription was ready immediately.",
    rating: 5,
    avatar: "JD",
  },
  {
    id: 2,
    name: "M.S.",
    type: "Clinic Visit",
    text: "Found a great pediatrician for my son. The clinic visit was organized and we didn't have to wait at all.",
    rating: 4.5,
    avatar: "MS",
  },
  {
    id: 3,
    name: "A.K.",
    type: "Family Account",
    text: "Managing appointments for my elderly parents has never been easier. The reminder feature is a lifesaver.",
    rating: 5,
    avatar: "AK",
  },
  {
    id: 4,
    name: "L.B.",
    type: "Online Consult",
    text: "Incredible platform. I was able to consult a specialist within an hour of feeling sick.",
    rating: 5,
    avatar: "LB",
  },
  {
    id: 5,
    name: "R.T.",
    type: "Clinic Visit",
    text: "The transparent pricing really helped me choose the right doctor for my budget without compromising on quality.",
    rating: 4.5,
    avatar: "RT",
  },
  {
    id: 6,
    name: "S.P.",
    type: "Online Consult",
    text: "Love the UI and how fast it works. The digital prescription downloaded straight to my phone.",
    rating: 5,
    avatar: "SP",
  },
];
const faqs = [
  {
    q: "How do I join a video consultation?",
    a: "You will receive a secure link via email and SMS 15 minutes before your appointment. You can also join directly from your patient dashboard.",
  },
  {
    q: "Can I cancel or reschedule my appointment?",
    a: "Yes, you can cancel or reschedule up to 2 hours before the scheduled time without any penalty through your dashboard.",
  },
  {
    q: "Are my medical records safe?",
    a: "Absolutely. We use HIPAA-compliant, end-to-end bank-level encryption to ensure your medical records are completely secure.",
  },
  {
    q: "Do you accept health insurance?",
    a: "We provide detailed, itemized invoices that you can submit to your insurance provider for reimbursement. Some clinics also accept direct insurance billing.",
  },
];
const Home = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [hoveredDoc, setHoveredDoc] = useState(null);
  const [hoveredClinic, setHoveredClinic] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [topDoctors, setTopDoctors] = useState([]);
  const [topClinics, setTopClinics] = useState([]);

  useEffect(() => {
    const fetchTopData = async () => {
      try {
        const docRes = await api.get('/doctors?limit=5');
        if (docRes.data && docRes.data.success) {
          setTopDoctors(docRes.data.data.slice(0, 5));
        }
        
        const clinicRes = await api.get('/clinics?limit=4');
        if (clinicRes.data && clinicRes.data.success) {
          setTopClinics(clinicRes.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch top data for home", err);
      }
    };
    fetchTopData();
  }, []);

  const bookingSectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: bookingSectionRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const step = Math.min(3, Math.floor(latest * 4));
    if (step !== activeStep) {
      setActiveStep(step);
    }
  });

  const handleStepClick = (idx) => {
    setActiveStep(idx);
    if (bookingSectionRef.current) {
      const rect = bookingSectionRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const top = rect.top + scrollY;
      // We know the container is 400vh tall (4 times the viewport).
      // The scrollable distance inside it is 300vh.
      const totalScrollableDistance = window.innerHeight * 3;
      const targetProgress = (idx / 4) + 0.125;
      const targetScroll = top + (totalScrollableDistance * targetProgress);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };
  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };
  return (
    <main className="pt-xxl">
      {/* 2. Hero + Doctor Search */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-12 py-16 border-b border-outline-variant overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{
              opacity: 0,
              x: -50,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="space-y-10"
          >
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-low text-primary font-caption text-caption rounded-full">
                <span
                  className="material-symbols-outlined filled text-[16px]"
                  data-icon="verified"
                >
                  verified
                </span>
                Over 10,000 Verified Specialists
              </span>

              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight leading-tight">
                Find Trusted Doctors.
                <br />
                <span className="text-primary">Book Care Without Waiting.</span>
              </h1>
              {/* Feedback 1: Fixed max-width issue */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl w-full mt-4">
                Connect with top-rated medical professionals, book instant
                appointments, and manage your health records seamlessly.
                Experience modern healthcare tailored to your schedule.
              </p>
            </div>
            {/* Search Strip */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-2 flex flex-col md:flex-row items-center relative z-10 w-full shadow-lg">
              <div className="flex-1 px-4 py-3 border-b md:border-b-0 border-outline-variant w-full md:w-auto flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-outline"
                  data-icon="search"
                >
                  search
                </span>

                <input
                  className="w-full bg-transparent border-none focus:ring-0 text-body-md font-body-md placeholder:text-outline p-0 outline-none"
                  placeholder="Describe your symptoms (e.g. headache, fever)..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/find-doctors`, { state: { initialSymptoms: searchQuery } });
                  }}
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 flex-col md:flex-row px-2 md:px-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/find-doctors`, { state: { initialSymptoms: searchQuery } })}
                  className="bg-primary text-white hover:bg-primary-container hover:text-on-primary-container transition-colors rounded-full px-8 py-3 font-label-md text-label-md w-full md:w-auto flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined">smart_toy</span>
                  AI Search
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 50,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.2,
            }}
            className="relative h-[500px] w-full hidden md:block rounded-3xl overflow-hidden bg-surface-container-low border border-outline-variant shadow-2xl"
          >
            <img
              className="object-cover w-full h-full object-top mix-blend-multiply opacity-90 transition-transform duration-1000 hover:scale-105"
              alt="Professional Doctor"
              src="https:
//lh3.googleusercontent.com/aida-public/AB6AXuCKTG1RgHR1vkAYCaezq-VsXeDAJRHwpgnX6ySs2RbQYQ4hoSNjC6U5F_6-T_7ETbTEtwrLeZKQjdtb9EGrjiG420ufZV3Hp_QEZNecydSzN6JtPyIrD9rJm_JiXCM6na7TAw_OKyIr2Y45Eyo6T9deqTKg9j5ZyADfZFuws3J04E3S3kLtN3aNUYMm7HfAq3roY3YgMXaU3D_z_QO6Vo7Fn_lnlWhBT-0MRvVPzN6tmPA9T7dM3wutrZ6zLoI0Pf_Rj46m8yQaWd8"
            />
          </motion.div>
        </div>
      </section>
      {/* 3. Trust Indicators (Feedback 2: Infinite Scroll) */}
      <section className="border-b border-outline-variant bg-white/30 backdrop-blur-md border border-white/40 shadow-sm overflow-hidden">
        <div className="w-full overflow-hidden flex relative bg-white/30 backdrop-blur-md border border-white/40 shadow-sm py-6 shadow-inner">
          <div className="flex w-max animate-marquee pause-on-hover">
            {[...trustIndicators, ...trustIndicators, ...trustIndicators].map(
              (item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-on-surface-variant mx-8 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {item.icon}
                  </span>

                  <span className="font-caption text-caption uppercase tracking-wider">
                    {item.text}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
      {/* 5. How Booking Works (Interactive App Preview) */}
      <section ref={bookingSectionRef} className="relative h-[400vh] w-full bg-surface-container-low border-b border-outline-variant">
        <div className="sticky top-0 h-[100dvh] w-full flex items-center overflow-hidden py-4 md:py-8">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 w-full">
          <div className="text-center mb-8">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              How Booking Works
            </h2>

            <p className="text-on-surface-variant font-body-md mt-4 max-w-2xl mx-auto">
              Experience a seamless journey from finding your specialist to
              joining your consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side: Steps */}
            <div className="space-y-3">
              {[
                {
                  num: 1,
                  title: "Search Doctor",
                  desc: "Find a specialist by name, speciality, or location. Filter by availability and ratings.",
                  icon: "search",
                },
                {
                  num: 2,
                  title: "Select Slot",
                  desc: "Choose a convenient date and time for your visit from the doctor's real-time calendar.",
                  icon: "calendar_month",
                },
                {
                  num: 3,
                  title: "Confirm",
                  desc: "Review details, secure your appointment, and receive instant booking confirmation.",
                  icon: "check_circle",
                },
                {
                  num: 4,
                  title: "Consult",
                  desc: "Meet your doctor online via secure video or visit the clinic in person.",
                  icon: "video_camera_front",
                },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => handleStepClick(idx)}
                  className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                    activeStep === idx
                      ? "bg-white/60 backdrop-blur-xl border-primary shadow-lg shadow-primary/10"
                      : "bg-transparent border-transparent hover:bg-white/50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      activeStep === idx
                        ? "bg-primary text-white"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {step.icon}
                    </span>
                  </div>

                  <div>
                    <h3
                      className={`font-headline-md text-headline-md mb-2 ${
                        activeStep === idx ? "text-primary" : "text-on-surface"
                      }`}
                    >
                      {step.title}
                    </h3>

                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Right Side: Mockup Frame */}
            <div className="relative h-[380px] md:h-[450px] lg:h-[500px] w-full rounded-3xl bg-white/20 backdrop-blur-md border border-white/40 shadow-2xl overflow-hidden flex items-center justify-center">
              {/* Fake UI Header */}
              <div className="absolute top-0 left-0 w-full h-10 bg-surface-container-low border-b border-outline-variant flex items-center px-4 gap-2 z-20">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>

                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>

                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>

              <div className="w-full h-full pt-12 relative z-10 bg-surface">
                <AnimatePresence mode="wait">
                  {activeStep === 0 && (
                    <motion.div
                      key="step0"
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -20,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="p-8 space-y-6"
                    >
                      <div className="h-12 w-full bg-white rounded-full border border-outline-variant shadow-sm flex items-center px-4 gap-3 text-outline">
                        <span className="material-symbols-outlined">
                          search
                        </span>

                        <span>Cardiologist in New York...</span>
                      </div>

                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 rounded-xl border border-outline-variant flex gap-4 items-center"
                          >
                            <div className="w-12 h-12 rounded-full bg-surface-dim"></div>

                            <div className="space-y-2 flex-grow">
                              <div className="h-4 w-32 bg-surface-dim rounded"></div>

                              <div className="h-3 w-24 bg-surface-dim rounded"></div>
                            </div>

                            <div className="w-16 h-8 rounded-full bg-primary/10"></div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}{" "}
                  {activeStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -20,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="p-8 space-y-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-label-md">October 2024</span>

                        <div className="flex gap-2">
                          <span className="material-symbols-outlined text-outline">
                            chevron_left
                          </span>

                          <span className="material-symbols-outlined text-on-surface">
                            chevron_right
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-6">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                          <div
                            key={i}
                            className="text-center text-caption text-outline"
                          >
                            {d}
                          </div>
                        ))}{" "}
                        {Array.from({
                          length: 14,
                        }).map((_, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-full flex items-center justify-center text-sm ${
                              i === 5
                                ? "bg-primary text-white"
                                : "hover:bg-surface-dim text-on-surface"
                            }`}
                          >
                            {i + 10}
                          </div>
                        ))}
                      </div>

                      <div className="h-[1px] bg-outline-variant w-full my-4"></div>

                      <div className="flex flex-wrap gap-2">
                        {["09:00 AM", "10:30 AM", "02:00 PM", "04:15 PM"].map(
                          (t, i) => (
                            <div
                              key={i}
                              className={`px-4 py-2 border rounded-full text-sm ${
                                i === 1
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-outline-variant text-on-surface-variant"
                              }`}
                            >
                              {t}
                            </div>
                          ),
                        )}
                      </div>
                    </motion.div>
                  )}{" "}
                  {activeStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{
                        opacity: 0,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="p-8 h-full flex flex-col justify-center items-center text-center space-y-6"
                    >
                      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                        <span className="material-symbols-outlined text-[48px]">
                          check_circle
                        </span>
                      </div>

                      <h3 className="font-headline-md text-on-surface">
                        Booking Confirmed!
                      </h3>

                      <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 w-full rounded-xl border border-outline-variant text-left space-y-2">
                        <p className="text-sm text-outline uppercase font-caption">
                          Appointment Details
                        </p>

                        <p className="font-label-md text-on-surface">
                          Dr. Sarah Jenkins
                        </p>

                        <p className="text-on-surface-variant text-sm">
                          Oct 15, 2024 at 10:30 AM
                        </p>
                      </div>
                    </motion.div>
                  )}{" "}
                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="w-full h-full relative bg-surface-dim"
                    >
                      {/* Fake Video Call */}
                      <img
                        src="/docv-ideo.png"
                        className="w-full h-full object-cover"
                        alt="Doctor Video Call"
                      />

                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-white/30 backdrop-blur-md border border-white/40 shadow-sm/80 backdrop-blur px-6 py-3 rounded-full border border-white/20 shadow-xl">
                        <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-on-surface">
                          <span className="material-symbols-outlined">
                            mic_off
                          </span>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-on-surface">
                          <span className="material-symbols-outlined">
                            videocam
                          </span>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                          <span className="material-symbols-outlined">
                            call_end
                          </span>
                        </div>
                      </div>
                      {/* Self Video PIP */}
                      <div className="absolute top-6 right-6 w-24 h-32 bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl border-white shadow-lg overflow-hidden">
                        <img
                          src="/pat.png"
                          className="w-full h-full object-cover"
                          alt="Patient Video"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
      {/* 6. Verified Doctors (Feedback 4: 5 more + Hover effect) */}
      <section className="py-20 w-full max-w-[1280px] mx-auto px-4 md:px-12 border-b border-outline-variant">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Top Verified Doctors
            </h2>

            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Highly rated specialists ready to help
            </p>
          </div>

          <Link
            to="/find-doctors"
            className="font-label-md text-label-md text-primary hover:underline hidden md:block"
          >
            View all doctors
          </Link>
        </div>

        <div className="space-y-2">
          {topDoctors.map((doc, idx) => (
            <motion.div
              key={doc._id}
              initial={{
                opacity: 0,
                x: -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.3,
                delay: idx * 0.05,
              }}
              onMouseEnter={() => setHoveredDoc(doc._id)}
              onMouseLeave={() => setHoveredDoc(null)}
              className="relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl hover:bg-white/50 hover:backdrop-blur-md border border-transparent hover:border-white/60 transition-colors gap-4 z-10 hover:z-50"
            >
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/doctor/${doc._id}`)}>
                <div className="w-16 h-16 rounded-full bg-surface-dim overflow-hidden shadow-sm flex items-center justify-center text-on-surface-variant font-bold text-xl">
                  {doc.userId?.profileImageUrl ? (
                    <img
                      alt={doc.userId?.firstName}
                      className="w-full h-full object-cover"
                      src={doc.userId?.profileImageUrl}
                    />
                  ) : (
                    doc.userId?.firstName?.charAt(0) || 'D'
                  )}
                </div>

                <div>
                  <h3 className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                    Dr. {doc.userId?.firstName} {doc.userId?.lastName}
                    <span className="material-symbols-outlined text-primary text-[16px] filled">
                      verified
                    </span>
                  </h3>

                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {doc.specialities?.[0]} • {doc.experienceYears} Yrs Exp.
                  </p>

                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-primary text-[14px] filled">
                      star
                    </span>

                    <span className="font-caption text-caption text-on-surface-variant">
                      {doc.averageRating || 'New'} ({doc.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button 
                  onClick={() => navigate(`/doctor/${doc._id}`)}
                  className="flex-1 md:flex-none px-6 py-2 border border-primary text-primary rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                >
                  View Profile
                </button>

                <button 
                  onClick={() => navigate(`/doctor/${doc._id}`)}
                  className="flex-1 md:flex-none px-6 py-2 bg-primary-container text-white rounded-full font-label-md text-label-md hover:bg-primary transition-colors shadow-sm"
                >
                  Book
                </button>
              </div>
              {/* Hover Modal */}
              <AnimatePresence>
                {hoveredDoc === doc._id && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    className="absolute z-50 top-full left-0 md:left-1/2 md:-translate-x-1/2 w-[350px] bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl p-6 rounded-2xl mt-2"
                  >
                    <div className="flex items-center gap-4 mb-4 border-b border-outline-variant pb-4">
                      <div className="w-16 h-16 rounded-full bg-surface-dim overflow-hidden flex items-center justify-center font-bold text-xl text-on-surface-variant shadow-sm">
                        {doc.userId?.profileImageUrl ? (
                          <img
                            alt={doc.userId?.firstName}
                            className="w-full h-full object-cover"
                            src={doc.userId?.profileImageUrl}
                          />
                        ) : (
                          doc.userId?.firstName?.charAt(0) || 'D'
                        )}
                      </div>

                      <div>
                        <h4 className="font-label-md text-on-surface">
                          Dr. {doc.userId?.firstName} {doc.userId?.lastName}
                        </h4>

                        <p className="text-primary text-caption font-label-md">
                          {doc.specialities?.[0]}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 font-body-md text-on-surface-variant">
                      <div className="flex justify-between">
                        <span className="text-on-surface">Education</span>{" "}
                        <span>{doc.education?.[0]?.degree || 'MD'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-on-surface">Experience</span>{" "}
                        <span>{doc.experienceYears} Yrs Exp.</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-on-surface">Consultation Fee</span>{" "}
                        <span className="text-primary font-label-md">
                          ${doc.consultationFee}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>
      {/* 7. Featured Clinics (Feedback 5: 5 more + Hover effect) */}
      <section className="py-20 w-full max-w-[1280px] mx-auto px-4 md:px-12 border-b border-outline-variant">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Featured Clinics
            </h2>

            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Top-rated medical centers near you
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topClinics.map((clinic, idx) => (
            <motion.div
              key={clinic._id}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.4,
                delay: idx * 0.1,
              }}
              onMouseEnter={() => setHoveredClinic(clinic._id)}
              onMouseLeave={() => setHoveredClinic(null)}
              className="relative flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl hover:border-primary hover:shadow-lg transition-all gap-4 cursor-pointer z-10 hover:z-50"
            >
              <div>
                <h3 className="font-label-md text-label-md text-on-surface mb-2">
                  {clinic.name}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-body-md text-body-md">
                  <span className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[16px]">
                      location_on
                    </span>{" "}
                    {clinic.city || clinic.address || 'City Center'}
                  </span>

                  <span className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[16px]">
                      group
                    </span>{" "}
                    {clinic.doctorCount || 0} Doctors
                  </span>

                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[16px] filled">
                      star
                    </span>{" "}
                    4.9
                  </span>
                </div>
              </div>

              <button className="px-6 py-2 border border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary hover:text-white transition-colors w-full md:w-auto shrink-0 mt-4 md:mt-0">
                View Clinic
              </button>
              {/* Hover Modal */}
              <AnimatePresence>
                {hoveredClinic === clinic._id && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    className="absolute z-50 top-full left-1/2 -translate-x-1/2 w-72 bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl p-5 rounded-2xl mt-2"
                  >
                    <h4 className="font-label-md text-primary mb-2 border-b border-outline-variant pb-2">
                      Medical Center
                    </h4>

                    <p className="font-body-md text-on-surface-variant text-sm mb-3">
                      State-of-the-art facilities equipped with modern
                      diagnostic tools and highly trained medical staff.
                    </p>

                    <div className="flex justify-between items-center text-caption font-label-md">
                      <span>Open 24/7</span>

                      <span className="text-primary hover:underline">
                        Get Directions →
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>
      {/* 8. Consultation Comparison (Feedback 6: Redesign + 3 more points) */}
      <section className="py-20 bg-surface-container-low border-b border-outline-variant">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-12">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-16 text-center">
            Ways to Consult
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {/* Online Card */}
            <motion.div
              whileHover={{
                y: -5,
              }}
              className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 rounded-3xl shadow-xl border border-outline-variant flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <span className="material-symbols-outlined text-[32px]">
                  videocam
                </span>
              </div>

              <h3 className="font-headline-md text-headline-md text-on-surface mb-6">
                Online Video Consult
              </h3>

              <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant flex-grow">
                {[
                  "No travel or waiting room required",
                  "Instant digital prescriptions",
                  "Best for follow-ups & minor issues",
                  "Available 24/7 from anywhere",
                  "Secure encrypted video connection",
                  "Easy file sharing for lab reports",
                ].map((pt, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>

                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <button className="mt-8 w-full py-3 bg-primary-container text-white rounded-xl font-label-md hover:bg-primary transition-colors">
                Book Online Consult
              </button>
            </motion.div>
            {/* In-Clinic Card */}
            <motion.div
              whileHover={{
                y: -5,
              }}
              className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 rounded-3xl shadow-xl border border-outline-variant flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <span className="material-symbols-outlined text-[32px]">
                  local_hospital
                </span>
              </div>

              <h3 className="font-headline-md text-headline-md text-on-surface mb-6">
                In-Clinic Visit
              </h3>

              <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant flex-grow">
                {[
                  "Comprehensive physical exam",
                  "On-site tests and diagnostics",
                  "Best for severe or complex symptoms",
                  "Direct access to specialized medical equipment",
                  "In-person doctor-patient rapport",
                  "Immediate emergency intervention if needed",
                ].map((pt, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      check_circle
                    </span>

                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <button className="mt-8 w-full py-3 bg-white border-2 border-primary text-primary rounded-xl font-label-md hover:bg-primary/5 transition-colors">
                Book Clinic Visit
              </button>
            </motion.div>
          </div>
        </div>
      </section>
      {/* 9. Privacy Section (Feedback 7 & 8: Full width bg + Animated icon) */}
      <section className="bg-white/30 backdrop-blur-md border border-white/40 shadow-sm w-full py-24 border-b border-outline-variant overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(0,106,106,0.05),transparent_50%)]"></div>

        <div className="max-w-[1280px] mx-auto px-4 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{
                opacity: 0,
                x: -30,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
              }}
            >
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6 leading-tight">
                Your Health Data,
                <br />
                <span className="text-primary">Fully Secured.</span>
              </h2>

              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                We use bank-level encryption to ensure your medical records,
                prescriptions, and consultation history remain strictly
                confidential. You control who sees your data.
              </p>

              <ul className="space-y-4 font-body-md text-body-md text-on-surface flex flex-col gap-2">
                {[
                  {
                    i: "lock",
                    t: "HIPAA Compliant Infrastructure",
                  },
                  {
                    i: "security",
                    t: "End-to-End 256-bit Encryption",
                  },
                  {
                    i: "visibility_off",
                    t: "100% Private Consultations",
                  },
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-4 bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 rounded-xl shadow-sm border border-outline-variant w-fit pr-8"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        {item.i}
                      </span>
                    </div>

                    <span className="font-label-md">{item.t}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <div className="flex justify-center lg:justify-end relative mt-12 lg:mt-0">
              {/* 3D Glassmorphic Security Shield */}{" "}
              {/* 3D Glassmorphic Security Shield */}
              <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center perspective-[1000px] [transform-style:preserve-3d]">
                {/* Glowing Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-emerald-400 blur-[70px] rounded-full opacity-50 shadow-[0_0_150px_rgba(16,185,129,0.8)] [transform:translateZ(-100px)]"></div>

                <motion.div
                  animate={{
                    y: [-8, 8, -8],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 flex items-center justify-center w-full h-full [transform-style:preserve-3d]"
                >
                  {/* Orbiting Glow Rings (3D Animated) */}
                  <motion.div
                    initial={{
                      rotateZ: 0,
                    }}
                    animate={{
                      rotateZ: 360,
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-1/2 left-1/2 w-[120%] h-[120%] rounded-full border border-red-400/40 [transform-style:preserve-3d]"
                    style={{
                      x: "-50%",
                      y: "-50%",
                      rotateX: 75,
                      rotateY: 15,
                    }}
                  >
                    <div className="absolute top-0 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]">
                      <motion.div
                        initial={{
                          rotateZ: 0,
                        }}
                        animate={{
                          rotateZ: -360,
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-full h-full [transform-style:preserve-3d]"
                      >
                        <div
                          className="w-full h-full bg-red-100 flex items-center justify-center rounded-full shadow-[0_0_25px_10px_#ef4444]"
                          style={{
                            transform: "rotateY(-15deg) rotateX(-75deg)",
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px] text-red-600">
                            bug_report
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{
                      rotateZ: 360,
                    }}
                    animate={{
                      rotateZ: 0,
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-1/2 left-1/2 w-[100%] h-[100%] rounded-full border border-orange-400/40 [transform-style:preserve-3d]"
                    style={{
                      x: "-50%",
                      y: "-50%",
                      rotateX: 70,
                      rotateY: -15,
                    }}
                  >
                    <div className="absolute bottom-0 left-1/2 w-7 h-7 -translate-x-1/2 translate-y-1/2 [transform-style:preserve-3d]">
                      <motion.div
                        initial={{
                          rotateZ: -360,
                        }}
                        animate={{
                          rotateZ: 0,
                        }}
                        transition={{
                          duration: 12,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-full h-full [transform-style:preserve-3d]"
                      >
                        <div
                          className="w-full h-full bg-orange-100 flex items-center justify-center rounded-full shadow-[0_0_20px_8px_#f97316]"
                          style={{
                            transform: "rotateY(15deg) rotateX(-70deg)",
                          }}
                        >
                          <span className="material-symbols-outlined text-[16px] text-orange-600">
                            opacity
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{
                      rotateZ: 0,
                    }}
                    animate={{
                      rotateZ: 360,
                    }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-1/2 left-1/2 w-[140%] h-[140%] rounded-full border-[2px] border-dashed border-emerald-300/40"
                    style={{
                      x: "-50%",
                      y: "-50%",
                      rotateX: 80,
                    }}
                  ></motion.div>
                  {/* The Glass Shield */}
                  <div className="relative w-36 h-44 md:w-44 md:h-52 [transform:translateZ(0px)] drop-shadow-[0_20px_30px_rgba(16,185,129,0.5)]">
                    <svg viewBox="0 0 100 120" className="w-full h-full">
                      <defs>
                        <linearGradient
                          id="shieldGrad"
                          x1="0%"
                          y1="100%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#10b981" />

                          <stop offset="50%" stopColor="#34d399" />

                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>

                        <linearGradient
                          id="shieldInner"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />

                          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                      </defs>
                      {/* Outer Shield Shape */}
                      <path
                        d="M50 5 C80 5 95 15 95 15 C95 50 85 90 50 115 C15 90 5 50 5 15 C5 15 20 5 50 5 Z"
                        fill="url(#shieldGrad)"
                      />
                      {/* Inner Bevel */}
                      <path
                        d="M50 10 C76 10 88 18 88 18 C88 48 79 83 50 105 C21 83 12 48 12 18 C12 18 24 10 50 10 Z"
                        fill="url(#shieldInner)"
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="1"
                      />
                      {/* Checkmark */}
                      <path
                        d="M35 55 L45 65 L65 40"
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {/* Floating Badges */} {/* Badge 1: Check */}
                  <motion.div
                    animate={{
                      y: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 4,
                      delay: 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-[20%] left-[5%] bg-white/90 backdrop-blur-md border border-white/50 shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-2xl p-3 flex items-center justify-center [transform:translateZ(40px)]"
                  >
                    <span className="material-symbols-outlined text-emerald-500 font-bold">
                      check
                    </span>
                  </motion.div>
                  {/* Badge 2: User */}
                  <motion.div
                    animate={{
                      y: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 4.5,
                      delay: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-[40%] right-[0%] bg-white/90 backdrop-blur-md border border-white/50 shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-2xl px-4 py-3 flex items-center gap-2 [transform:translateZ(30px)]"
                  >
                    <span className="material-symbols-outlined text-emerald-600">
                      badge
                    </span>
                  </motion.div>
                  {/* Badge 3: Password/Lock */}
                  <motion.div
                    animate={{
                      y: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 3.5,
                      delay: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute bottom-[15%] right-[15%] bg-white/90 backdrop-blur-md border border-white/50 shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-2xl px-4 py-3 flex items-center gap-2 [transform:translateZ(50px)]"
                  >
                    <span className="material-symbols-outlined text-emerald-500 text-[20px]">
                      lock
                    </span>

                    <div className="flex gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>

                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>

                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>

                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 10. Digital Prescription (Feedback 9: Redesign realistic) */}
      <section className="py-24 w-full px-4 md:px-12 border-b border-outline-variant bg-surface">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Instant Digital Prescriptions
          </h2>

          <p className="text-on-surface-variant font-body-md mt-4 max-w-2xl mx-auto">
            Valid at any pharmacy. Securely signed and instantly available on
            your phone.
          </p>
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="max-w-3xl mx-auto bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant rounded-md relative overflow-hidden"
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <span className="material-symbols-outlined text-[300px]">
              medical_services
            </span>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-primary pb-6 mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[24px]">
                    local_hospital
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-md text-primary font-bold tracking-tight">
                    DR. SARAH JENKINS, MD
                  </h3>

                  <p className="font-caption text-on-surface-variant uppercase tracking-widest">
                    Cardiology Specialist
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right font-caption text-on-surface-variant space-y-1">
                <p>123 Health Ave, Medical District</p>

                <p>Reg No: MED-8947-22</p>

                <p>Ph: +1 (555) 123-4567</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white/50 backdrop-blur-xl border border-white/60 shadow-md p-4 rounded-lg border border-outline-variant">
              <div>
                <p className="font-caption text-outline mb-1 uppercase tracking-wider">
                  Patient Details
                </p>

                <p className="font-label-md text-on-surface font-bold">
                  John Doe
                </p>

                <p className="font-body-md text-on-surface-variant">
                  Age: 34 • Male
                </p>
              </div>

              <div className="text-left md:text-right mt-4 md:mt-0">
                <p className="font-caption text-outline mb-1 uppercase tracking-wider">
                  Prescription Details
                </p>

                <p className="font-label-md text-on-surface font-bold">
                  Date: Oct 24, 2024
                </p>

                <p className="font-body-md text-on-surface-variant">
                  Rx No: #RX-104928
                </p>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-4xl font-serif text-primary italic font-bold pr-4">
                  Rx
                </span>

                <div className="h-[2px] bg-outline-variant flex-grow"></div>
              </div>

              <div className="space-y-6 pl-4 md:pl-12">
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-primary hidden md:block"></div>

                  <h4 className="font-label-md text-lg text-on-surface font-bold">
                    1. Lisinopril 10mg Tablets
                  </h4>

                  <p className="font-body-md text-on-surface-variant mt-1">
                    Take one (1) tab let orally once daily in the morning.
                  </p>

                  <p className="font-caption text-primary mt-2 font-medium bg-primary/5 inline-block px-2 py-1 rounded">
                    Qty: 30 Tablets • Refills: 2
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-primary hidden md:block"></div>

                  <h4 className="font-label-md text-lg text-on-surface font-bold">
                    2. Amlodipine 5mg Tablets
                  </h4>

                  <p className="font-body-md text-on-surface-variant mt-1">
                    Take one (1) tab let orally once nightly.
                  </p>

                  <p className="font-caption text-primary mt-2 font-medium bg-primary/5 inline-block px-2 py-1 rounded">
                    Qty: 30 Tablets • Refills: 2
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center md:items-end pt-8 border-t border-outline-variant gap-6">
              <div className="text-center md:text-left">
                <img
                  src="https:
//api.qrserver.com/v1/create-qr-code/?size=80x80&data=RX-104928"
                  alt="QR Verify"
                  className="w-16 h-16 opacity-80 mx-auto md:mx-0"
                />

                <p className="font-caption text-on-surface-variant mt-2 text-[10px]">
                  Scan to verify authenticity
                </p>
              </div>

              <div className="text-center">
                <div className="font-signature text-3xl text-primary/80 mb-2 transform -rotate-2">
                  Sarah Jenkins
                </div>

                <div className="w-48 h-[1px] bg-on-surface mb-1"></div>

                <p className="font-label-md text-on-surface uppercase tracking-wider text-xs">
                  Digital Signature
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      {/* 11. Family Health (Feedback 10: Orbit Animation) */}
      <section className="py-24 bg-surface-container-low border-b border-outline-variant overflow-hidden">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex justify-center relative min-h-[400px]">
              {/* Orbital System */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mt-10 md:mt-0">
                {/* Center Node (Self) */}
                <motion.div
                  whileHover={{
                    scale: 1.1,
                  }}
                  className="absolute z-20 w-24 h-24 bg-primary text-white rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[36px] mb-1">
                    face
                  </span>

                  <span className="font-label-md text-[10px] uppercase tracking-wider">
                    You
                  </span>
                </motion.div>
                {/* Orbit Path 1 */}
                <div className="absolute w-[140%] h-[140%] md:w-[150%] md:h-[150%] border border-outline-variant/50 rounded-full animate-orbit-slow">
                  {/* Child Node */}
                  <motion.div
                    whileHover={{
                      scale: 1.2,
                    }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white border-2 border-primary text-primary rounded-full shadow-lg flex flex-col items-center justify-center cursor-pointer -rotate-0 [animation:orbit-reverse_20s_linear_infinite]"
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      child_care
                    </span>

                    <span className="font-caption text-[8px] uppercase font-bold mt-0.5">
                      Child
                    </span>
                  </motion.div>
                  {/* Parent Node */}
                  <motion.div
                    whileHover={{
                      scale: 1.2,
                    }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white border-2 border-primary text-primary rounded-full shadow-lg flex flex-col items-center justify-center cursor-pointer -rotate-180 [animation:orbit-reverse_20s_linear_infinite]"
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      elderly
                    </span>

                    <span className="font-caption text-[8px] uppercase font-bold mt-0.5">
                      Parent
                    </span>
                  </motion.div>
                  {/* Spouse Node */}
                  <motion.div
                    whileHover={{
                      scale: 1.2,
                    }}
                    className="absolute top-1/2 -left-8 -translate-y-1/2 w-16 h-16 bg-white border-2 border-primary text-primary rounded-full shadow-lg flex flex-col items-center justify-center cursor-pointer -rotate-90 [animation:orbit-reverse_20s_linear_infinite]"
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      favorite
                    </span>

                    <span className="font-caption text-[8px] uppercase font-bold mt-0.5">
                      Partner
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
                Manage Health for the Whole Family
              </h2>

              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                Keep track of appointments, medical records, and prescriptions
                for your children, parents, and partner all from a single secure
                account. No more juggling multiple logins.
              </p>

              <ul className="space-y-4 mb-8 font-body-md text-on-surface">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    check_circle
                  </span>{" "}
                  Shared family medical history
                </li>

                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    check_circle
                  </span>{" "}
                  Book appointments on behalf of dependents
                </li>

                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    check_circle
                  </span>{" "}
                  Centralized payment methods
                </li>
              </ul>

              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="px-8 py-3 bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-lg w-full md:w-auto"
              >
                Add Family Member
              </motion.button>
            </div>
          </div>
        </div>
      </section>
      {/* 12. Payments & Safety (Feedback 11: Redesign Width & Structure) */}
      <section className="py-24 w-full bg-white/30 backdrop-blur-md border border-white/40 shadow-sm border-b border-outline-variant">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Transparent & Secure Payments
            </h2>

            <p className="font-body-md text-body-md text-on-surface-variant mt-4 max-w-2xl mx-auto">
              Know the cost upfront, pay securely. We integrate with world-class
              payment processors to guarantee safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                i: "credit_score",
                t: "Secure Checkout",
                d: "PCI-compliant payment gateways protect your financial data globally.",
              },
              {
                i: "receipt_long",
                t: "Transparent Pricing",
                d: "No hidden fees. See consultation charges before you book an appointment.",
              },
              {
                i: "health_and_safety",
                t: "Insurance Support",
                d: "Download detailed invoices for easy insurance reimbursement processing.",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{
                  y: -10,
                }}
                className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-8 text-center shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <span className="material-symbols-outlined text-[32px]">
                    {card.i}
                  </span>
                </div>

                <h3 className="font-headline-md text-on-surface mb-3">
                  {card.t}
                </h3>

                <p className="font-body-md text-on-surface-variant">{card.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* 13. Dashboard Preview (Feedback 12: Premium Full-width screen) */}
      <section className="py-24 w-full bg-surface-container-low border-b border-outline-variant overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Your Personal Health Dashboard
          </h2>

          <p className="font-body-md text-body-md text-on-surface-variant mt-4">
            Everything you need, beautifully organized in one place.
          </p>
        </div>
        {/* Full width stretching mockup */}
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8">
          <motion.div
            initial={{
              y: 100,
              opacity: 0,
            }}
            whileInView={{
              y: 0,
              opacity: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.8,
              type: "spring",
            }}
            className="w-full bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl md:rounded-t-3xl md:rounded-b-none shadow-[0_-10px_60px_rgba(0,106,106,0.15)] border border-outline-variant flex flex-col md:flex-row overflow-hidden min-h-[500px]"
          >
            {/* Sidebar Mockup */}
            <div className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-outline-variant p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  JD
                </div>

                <div>
                  <p className="font-label-md text-on-surface">John Doe</p>

                  <p className="font-caption text-on-surface-variant">
                    Premium Member
                  </p>
                </div>
              </div>

              <div className="space-y-2 flex-grow hidden md:block">
                {[
                  "Dashboard",
                  "Appointments",
                  "Medical Records",
                  "Prescriptions",
                  "Billing",
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 rounded-lg font-label-md flex items-center gap-3 ${
                      i === 1
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        i === 1 ? "bg-primary" : "bg-transparent"
                      }`}
                    ></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Main Content Mockup */}
            <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h3 className="font-headline-md text-on-surface">
                  Upcoming Appointments
                </h3>

                <button className="bg-primary text-white px-4 py-2 rounded-lg font-label-md text-sm w-full md:w-auto">
                  + New Booking
                </button>
              </div>
              {/* Active Appointment Card */}
              <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>

                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <img
                      src="/doc1.png"
                      alt="Doc"
                      className="w-14 h-14 rounded-full object-cover shadow-sm hidden sm:block"
                    />

                    <div>
                      <h4 className="font-label-md text-on-surface text-lg">
                        Dr. Sarah Jenkins
                      </h4>

                      <p className="font-body-md text-primary">
                        Cardiology Consult
                      </p>
                    </div>
                  </div>

                  <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider">
                    Confirmed
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-surface-container px-4 py-2 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                      calendar_today
                    </span>

                    <span className="font-label-md text-on-surface">
                      Tomorrow, 10:00 AM
                    </span>
                  </div>

                  <div className="bg-surface-container px-4 py-2 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                      videocam
                    </span>

                    <span className="font-label-md text-on-surface">
                      Online Video
                    </span>
                  </div>
                </div>

                <button className="w-full py-3 bg-primary text-white rounded-xl font-label-md flex justify-center items-center gap-2 hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined">play_circle</span>
                  Join Video Call
                </button>
              </div>
              {/* Past appointments skeleton */}
              <h3 className="font-headline-md text-on-surface mt-10 mb-4">
                Recent History
              </h3>

              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-full h-16 bg-surface-container rounded-xl animate-pulse flex items-center px-4 gap-4"
                  >
                    <div className="w-10 h-10 bg-outline-variant/30 rounded-full"></div>

                    <div className="space-y-2 flex-grow">
                      <div className="h-3 bg-outline-variant/30 rounded w-1/4"></div>

                      <div className="h-2 bg-outline-variant/20 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* 14. Reviews (Feedback 13: Infinite scroll marquee + hover pause) */}
      <section className="py-24 w-full bg-white/30 backdrop-blur-md border border-white/40 shadow-sm border-b border-outline-variant overflow-hidden">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-16 text-center">
          Patient Experiences
        </h2>

        <div className="w-full overflow-hidden flex relative pb-4">
          <div className="flex w-max animate-marquee pause-on-hover gap-6 px-6">
            {[...reviews, ...reviews, ...reviews].map((rev, idx) => (
              <motion.div
                key={idx}
                whileHover={{
                  y: -5,
                }}
                className="w-80 md:w-96 bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 shadow-sm flex flex-col cursor-pointer shrink-0"
              >
                <div className="flex items-center gap-1 mb-4 text-[#FFB400]">
                  {Array.from({
                    length: 5,
                  }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[18px] filled"
                    >
                      {i < Math.floor(rev.rating)
                        ? "star"
                        : i < rev.rating
                          ? "star_half"
                          : "star_outline"}
                    </span>
                  ))}
                </div>

                <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-grow italic leading-relaxed">
                  "{rev.text}"
                </p>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-outline-variant">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-label-md font-bold">
                    {rev.avatar}
                  </div>

                  <div>
                    <p className="font-label-md text-on-surface">{rev.name}</p>

                    <p className="font-caption text-primary">{rev.type}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* 15. FAQ (Feedback 14: Accordion Animation) */}
      <section className="py-24 w-full max-w-[800px] mx-auto px-4 md:px-12 border-b border-outline-variant">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-12 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <motion.div
                key={idx}
                layout
                className={`border rounded-2xl overflow-hidden transition-colors ${
                  isOpen
                    ? "bg-primary/5 border-primary/30"
                    : "bg-white border-outline-variant hover:border-primary/50"
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <h3
                    className={`font-label-md text-lg ${
                      isOpen ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {faq.q}
                  </h3>

                  <motion.span
                    animate={{
                      rotate: isOpen ? 180 : 0,
                    }}
                    className={`material-symbols-outlined transition-colors ${
                      isOpen ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    expand_more
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      <p className="px-6 pb-6 font-body-md text-on-surface-variant leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>
      {/* 16. Join CTA */}
      <section className="bg-primary py-24 border-b border-outline-variant relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)]"></div>

        <div className="max-w-[1280px] mx-auto px-4 md:px-12 text-center relative z-10">
          <h2 className="font-headline-lg text-headline-lg text-white mb-6">
            Are you a healthcare provider?
          </h2>

          <p className="font-body-lg text-body-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of doctors growing their practice with Medicare
            Connect. Manage appointments, digital records, and patient
            follow-ups easily.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="bg-white text-primary px-10 py-4 rounded-full font-label-md text-label-md hover:bg-white/30 backdrop-blur-md border border-white/40 shadow-sm transition-colors w-full md:w-auto shadow-xl"
            >
              Register as Doctor
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="border-2 border-white text-white px-10 py-4 rounded-full font-label-md text-label-md hover:bg-white/10 transition-colors w-full md:w-auto"
            >
              Register Clinic
            </motion.button>
          </div>
        </div>
      </section>
      {/* Feedback 15: Removed duplicate Footer block entirely. Layout.jsx handles it. */}
    </main>
  );
};
export default Home;
