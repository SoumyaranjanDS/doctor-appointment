import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../config/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/admin/auth/login", { email, password });

      // Save JWT token
      localStorage.setItem("adminToken", response.data.token);

      // Redirect to Admin Dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container h-screen w-full flex relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-primary font-label-md z-50 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white hover:bg-white transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">home</span>
        Return Home
      </Link>

      {/* Background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex w-full h-full relative z-10">
        {/* Left Panel: Hero Content */}
        <section className="hidden md:flex w-1/2 flex-col justify-center px-16 relative">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-secondary/5 -z-10"></div>
          <div className="">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-label-md mb-8">
              <span className="material-symbols-outlined text-[18px]">
                admin_panel_settings
              </span>
              <span>Platform Administration</span>
            </div>

            <h1 className="text-display-lg font-display-lg text-on-surface mb-6 leading-tight">
              Manage operations
              <br />
              <span className="text-primary">securely.</span>
            </h1>

            <p className="text-body-lg text-on-surface-variant mb-12">
              Oversee doctor applications, clinic registrations, and system
              configurations through the dedicated admin portal.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: "shield_person",
                  title: "Secure Access",
                  desc: "Protected by enterprise-grade JWT authentication.",
                },
                {
                  icon: "fact_check",
                  title: "Application Review",
                  desc: "Streamlined approval workflows for medical professionals.",
                },
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-outline-variant/20 shrink-0">
                    <span className="material-symbols-outlined">
                      {feature.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-label-md font-label-md text-on-surface mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-body-md text-on-surface-variant">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel: Authentication Form */}
        <section className="w-full md:w-1/2 bg-white p-6 md:p-14 flex flex-col md:justify-center items-center relative h-full">
          <div className="w-full max-w-[420px]">
            {/* Custom Header */}
            <div className="mb-8 text-center">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined filled text-[24px]">
                  shield
                </span>
              </div>
              <h2 className="text-headline-md font-headline-md text-on-surface mb-2">
                Admin Login
              </h2>
              <p className="text-body-md text-on-surface-variant">
                Enter your administrative credentials to continue.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-label-md text-center">
                {error}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="admin@dcp.com"
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-full font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? "Authenticating..." : "Access Dashboard"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;
