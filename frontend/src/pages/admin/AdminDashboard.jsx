import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import PrescriptionViewer from "../../components/PrescriptionViewer";
import NotificationBell from "../../components/NotificationBell";
import RevenueChart from "../../components/RevenueChart";
import DashboardLayout from "../../components/DashboardLayout";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [applications, setApplications] = useState({
    individualDoctors: [],
    clinics: [],
    clinicDoctors: [],
  });
  const [appointmentsData, setAppointmentsData] = useState({
    appointments: [],
    platformRevenue: 0,
  });
  const [withdrawals, setWithdrawals] = useState([]);

  // Navigation State
  const [activeView, setActiveView] = useState("overview");
  const [approvalTab, setApprovalTab] = useState("individualDoctors");
  const [loading, setLoading] = useState(true);
  const [prescriptionViewerAppt, setPrescriptionViewerAppt] = useState(null);

  const fetchData = async () => {
    try {
      const [appsRes, apptsRes, withdrawalsRes] = await Promise.all([
        api.get("/admin/applications"),
        api.get("/admin/appointments"),
        api.get("/finance/admin/withdrawals"),
      ]);
      setApplications(appsRes.data);
      setAppointmentsData(apptsRes.data);
      setWithdrawals(withdrawalsRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (type, id, action, reason = "") => {
    try {
      await api.put(`/admin/applications/${type}/${id}/${action}`, { reason });
      fetchData();
    } catch (err) {
      alert(`Failed to ${action} application`);
    }
  };

  const handleWithdrawalAction = async (id, action, reason = "") => {
    try {
      await api.put(`/finance/admin/withdrawals/${id}/process`, {
        status: action,
        rejectionReason: reason,
      });
      fetchData();
    } catch (err) {
      alert(`Failed to ${action} withdrawal`);
    }
  };

  const totalPendingApprovals =
    (applications.individualDoctors?.length || 0) +
    (applications.clinics?.length || 0) +
    (applications.clinicDoctors?.length || 0);
  const totalPendingWithdrawals = withdrawals.length;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col justify-between border border-white/20 hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="font-label-lg opacity-90 mb-2 tracking-wide uppercase">
              Total Platform Revenue
            </p>
            <h2 className="text-display-md font-bold">
              ₹{appointmentsData.platformRevenue.toLocaleString()}
            </h2>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] opacity-10 rotate-12 transition-transform hover:rotate-0 duration-500">
            account_balance
          </span>
        </div>

        <div
          onClick={() => setActiveView("approvals")}
          className="glass-panel p-8 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]">
                how_to_reg
              </span>
            </div>
            {totalPendingApprovals > 0 && (
              <span className="bg-error text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm animate-pulse">
                {totalPendingApprovals} Pending
              </span>
            )}
          </div>
          <div className="relative z-10">
            <p className="font-label-lg text-on-surface-variant tracking-wide uppercase mb-1">
              Awaiting Review
            </p>
            <h2 className="text-display-md font-bold text-on-surface leading-none">
              {totalPendingApprovals}
            </h2>
          </div>
        </div>

        <div
          onClick={() => setActiveView("withdrawals")}
          className="glass-panel p-8 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]">
                payments
              </span>
            </div>
            {totalPendingWithdrawals > 0 && (
              <span className="bg-error text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm animate-pulse">
                {totalPendingWithdrawals} Pending
              </span>
            )}
          </div>
          <div className="relative z-10">
            <p className="font-label-lg text-on-surface-variant tracking-wide uppercase mb-1">
              Withdrawal Requests
            </p>
            <h2 className="text-display-md font-bold text-on-surface leading-none">
              {totalPendingWithdrawals}
            </h2>
          </div>
        </div>
      </div>

      {appointmentsData.revenueData && appointmentsData.revenueData.length > 0 && (
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <RevenueChart data={appointmentsData.revenueData} title="Platform Revenue (Last 7 Days)" />
        </div>
      )}

      <div className="bg-surface p-8 rounded-3xl border border-outline-variant/30 shadow-sm mt-8">
        <h3 className="text-headline-sm font-bold text-on-surface mb-6">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              setActiveView("approvals");
              setApprovalTab("individualDoctors");
            }}
            className="px-6 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-bold text-sm border border-outline-variant/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">person</span> Review
            Independent Doctors
          </button>
          <button
            onClick={() => {
              setActiveView("approvals");
              setApprovalTab("clinics");
            }}
            className="px-6 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-bold text-sm border border-outline-variant/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">local_hospital</span>{" "}
            Review Clinics
          </button>
          <button
            onClick={() => setActiveView("appointments")}
            className="px-6 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-bold text-sm border border-outline-variant/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">calendar_month</span>{" "}
            View All Appointments
          </button>
        </div>
      </div>
    </div>
  );

  const renderApprovalCard = (item, type) => (
    <div
      key={item._id}
      className="bg-surface rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center text-3xl font-bold uppercase shadow-inner group-hover:bg-primary group-hover:text-white transition-colors">
          {item.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-headline-sm font-bold text-on-surface flex items-center gap-3">
            {item.name}
            {type === "doctor" && item.providerType === "clinic_doctor" && (
              <span className="bg-secondary-container text-on-secondary-container text-xs px-3 py-1 rounded-full shadow-sm">
                Clinic Doc
              </span>
            )}
            {type === "clinic" && (
              <span className="bg-tertiary-container text-on-tertiary-container text-xs px-3 py-1 rounded-full shadow-sm">
                Clinic
              </span>
            )}
          </h3>
          <p className="text-body-md text-on-surface-variant mt-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">mail</span>{" "}
            {item.userId?.email || item.email}
          </p>
          {type === "doctor" &&
            item.providerType === "clinic_doctor" &&
            item.clinicId && (
              <p className="text-body-sm text-primary font-medium flex items-center gap-1 mt-1 bg-primary/5 w-fit px-2 py-0.5 rounded">
                <span className="material-symbols-outlined text-[16px]">
                  domain
                </span>{" "}
                Clinic: {item.clinicId.name}
              </p>
            )}
          {type === "clinic" && (
            <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[16px]">
                location_on
              </span>{" "}
              {item.city}, {item.state}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto mt-2 xl:mt-0">
        <a
          href={item.documentUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-2xl font-bold text-sm transition-colors border border-outline-variant/30"
        >
          <span className="material-symbols-outlined text-[20px]">
            description
          </span>
          View Document
        </a>
        <div className="flex gap-3 flex-1 xl:flex-none">
          <button
            onClick={() => handleAction(type, item._id, "approve")}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-[#4EF27A]/20 text-[#002108] hover:bg-[#4EF27A]/40 rounded-2xl font-bold text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              check_circle
            </span>
            Approve
          </button>
          <button
            onClick={() =>
              handleAction(type, item._id, "reject", "Does not meet criteria")
            }
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-error/10 text-error hover:bg-error/20 rounded-2xl font-bold text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              cancel
            </span>
            Reject
          </button>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-display-sm font-bold text-on-surface">
          Approvals Queue
        </h1>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap p-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-fit shadow-sm">
        {[
          {
            id: "individualDoctors",
            label: "Independent Doctors",
            count: applications.individualDoctors?.length,
          },
          {
            id: "clinics",
            label: "Clinics",
            count: applications.clinics?.length,
          },
          {
            id: "clinicDoctors",
            label: "Clinic Doctors",
            count: applications.clinicDoctors?.length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setApprovalTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${
              approvalTab === tab.id
                ? "bg-primary text-white shadow-md"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${approvalTab === tab.id ? "bg-white text-primary" : "bg-surface-variant text-on-surface-variant"}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 mt-6">
        {applications[approvalTab]?.length === 0 ? (
          <div className="bg-surface py-20 px-6 rounded-3xl text-center border border-outline-variant/30 text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[80px] mb-6 opacity-30 text-primary">
              done_all
            </span>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">
              All caught up!
            </h3>
            <p className="text-body-lg">
              There are no pending applications in this queue.
            </p>
          </div>
        ) : (
          applications[approvalTab]?.map((item) =>
            renderApprovalCard(
              item,
              approvalTab === "clinics" ? "clinic" : "doctor",
            ),
          )
        )}
      </div>
    </div>
  );

  const renderWithdrawals = () => (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-display-sm font-bold text-on-surface">
        Withdrawal Requests
      </h1>

      {withdrawals.length === 0 ? (
        <div className="bg-surface py-20 px-6 rounded-3xl text-center border border-outline-variant/30 text-on-surface-variant shadow-sm">
          <span className="material-symbols-outlined text-[80px] mb-6 opacity-30 text-primary">
            account_balance_wallet
          </span>
          <h3 className="text-headline-sm font-bold text-on-surface mb-2">
            No Pending Requests
          </h3>
          <p className="text-body-lg">
            There are currently no withdrawal requests to process.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {withdrawals.map((req) => (
            <div
              key={req._id}
              className="bg-surface rounded-3xl p-8 shadow-sm border border-outline-variant/30 flex flex-col xl:flex-row justify-between items-start xl:items-center hover:shadow-md transition-shadow gap-6"
            >
              <div className="w-full xl:w-auto">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-display-sm font-bold text-primary">
                    ₹{req.amount}
                  </h3>
                  <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {req.providerType}
                  </span>
                </div>
                <p className="text-body-lg text-on-surface-variant mb-6">
                  Requested by:{" "}
                  <span className="font-bold text-on-surface">
                    {req.userId?.email || "Unknown User"}
                  </span>
                </p>

                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/50 w-full xl:min-w-[400px]">
                  <p className="text-sm font-bold text-on-surface-variant mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      account_balance
                    </span>{" "}
                    Payment Details Provided
                  </p>
                  <pre className="text-sm font-mono whitespace-pre-wrap text-on-surface leading-relaxed">
                    {req.paymentDetails}
                  </pre>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row xl:flex-col gap-3 w-full xl:w-auto">
                <button
                  onClick={() => handleWithdrawalAction(req._id, "processed")}
                  className="flex-1 xl:flex-none px-8 py-3.5 bg-[#4EF27A]/20 text-[#002108] hover:bg-[#4EF27A]/40 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    done_all
                  </span>
                  Mark as Processed
                </button>
                <button
                  onClick={() =>
                    handleWithdrawalAction(
                      req._id,
                      "rejected",
                      "Invalid payment details",
                    )
                  }
                  className="flex-1 xl:flex-none px-8 py-3.5 bg-error/10 text-error hover:bg-error/20 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    block
                  </span>
                  Reject Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-display-sm font-bold text-on-surface mb-6">
        Appointments Directory
      </h1>

      {appointmentsData.appointments.length === 0 ? (
        <div className="bg-surface py-20 px-6 rounded-3xl text-center border border-outline-variant/30 text-on-surface-variant shadow-sm">
          <span className="material-symbols-outlined text-[80px] mb-6 opacity-30 text-primary">
            event_busy
          </span>
          <h3 className="text-headline-sm font-bold text-on-surface mb-2">
            No Appointments Yet
          </h3>
          <p className="text-body-lg">
            Platform has not processed any appointments.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="p-5 font-bold text-on-surface-variant text-sm uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="p-5 font-bold text-on-surface-variant text-sm uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="p-5 font-bold text-on-surface-variant text-sm uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="p-5 font-bold text-on-surface-variant text-sm uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="p-5 font-bold text-on-surface-variant text-sm uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {appointmentsData.appointments.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-surface-container-lowest transition-colors"
                  >
                    <td className="p-5">
                      <p className="font-bold text-on-surface">
                        {new Date(app.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        {app.startTime}
                      </p>
                    </td>
                    <td className="p-5 font-bold text-on-surface">
                      {app.patientId?.firstName} {app.patientId?.lastName}
                    </td>
                    <td className="p-5 text-on-surface-variant">
                      Dr. {app.doctorId?.name}
                    </td>
                    <td className="p-5 font-bold text-primary text-lg">
                      ₹{app.amount}
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-2 items-start">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                            app.status === "completed"
                              ? "bg-primary text-white"
                              : "bg-surface-variant text-on-surface-variant"
                          }`}
                        >
                          {app.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                            app.paymentStatus === "paid"
                              ? "bg-[#4EF27A]/20 text-[#002108]"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {app.paymentStatus}
                        </span>
                        {app.prescription && (
                          <button
                            onClick={() => setPrescriptionViewerAppt(app)}
                            className="text-[10px] bg-secondary text-on-secondary px-2 py-1 rounded-full shadow hover:shadow-md transition-all font-bold flex items-center gap-1 mt-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">description</span> View Rx
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const sidebarItems = [
    { id: "overview", icon: "dashboard", label: "Overview" },
    {
      id: "approvals",
      icon: "how_to_reg",
      label: "Approvals Queue",
      badge: totalPendingApprovals,
    },
    {
      id: "withdrawals",
      icon: "account_balance_wallet",
      label: "Withdrawal Requests",
      badge: totalPendingWithdrawals,
    },
    {
      id: "appointments",
      icon: "calendar_month",
      label: "Appointments",
    },
  ];

  return (

    <>
      <DashboardLayout
        user={user}
        userRole="admin"
        sidebarItems={sidebarItems}
        activeTab={activeView}
        onTabChange={setActiveView}
        title="Admin Dashboard"
        onLogout={logout}
      >
        <div className="animate-fade-in">
          {activeView === "overview" && renderOverview()}
          {activeView === "approvals" && renderApprovals()}
          {activeView === "withdrawals" && renderWithdrawals()}
          {activeView === "appointments" && renderAppointments()}
        </div>
      </DashboardLayout>
      
      {prescriptionViewerAppt && (
        <PrescriptionViewer 
          appointment={prescriptionViewerAppt} 
          onClose={() => setPrescriptionViewerAppt(null)} 
        />
      )}
    </>
  );
};

export default AdminDashboard;
