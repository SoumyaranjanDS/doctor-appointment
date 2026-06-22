import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Agentation } from 'agentation';
import Layout from './components/Layout';
import Home from './pages/Home';
import FindDoctors from './pages/FindDoctors';
import Dashboard from './pages/Dashboard';
import DoctorProfile from './pages/DoctorProfile';

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
          
          {/* Dashboard has its own layout/sidebar */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
      <Agentation />
    </>
  )
}

export default App;
