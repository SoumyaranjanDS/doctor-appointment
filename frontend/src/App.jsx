import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Agentation } from 'agentation';
import Layout from './components/Layout';
import Home from './pages/Home';
import FindDoctors from './pages/FindDoctors';
import Dashboard from './pages/Dashboard';
import DoctorProfile from './pages/DoctorProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import OnboardingSelection from './pages/onboarding/OnboardingSelection';
import IndividualDoctorForm from './pages/onboarding/IndividualDoctorForm';
import ClinicForm from './pages/onboarding/ClinicForm';
import ClinicDoctorForm from './pages/onboarding/ClinicDoctorForm';
import CustomAuth from './pages/CustomAuth';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="find-doctors" element={<FindDoctors />} />
            <Route path="doctor/:id" element={<DoctorProfile />} />
          </Route>
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/auth" element={<CustomAuth />} />
          
          <Route path="/checkout-success" element={<PrivateRoute><CheckoutSuccess /></PrivateRoute>} />
          <Route path="/checkout-cancel" element={<PrivateRoute><CheckoutCancel /></PrivateRoute>} />
          
          <Route path="/onboarding" element={
            <PrivateRoute>
              <OnboardingSelection />
            </PrivateRoute>
          } />
          <Route path="/onboarding/doctor" element={
            <PrivateRoute>
              <IndividualDoctorForm />
            </PrivateRoute>
          } />
          <Route path="/onboarding/clinic" element={
            <PrivateRoute>
              <ClinicForm />
            </PrivateRoute>
          } />
          <Route path="/onboarding/clinic-doctor" element={
            <PrivateRoute>
              <ClinicDoctorForm />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
      <Agentation />
    </>
  )
}

export default App;
