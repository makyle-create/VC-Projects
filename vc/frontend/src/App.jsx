import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import { Login, Register } from './pages/Auth';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import Dashboard from './pages/Dashboard';
import MyActivities from './pages/MyActivities';
import OpportunityForm from './pages/OpportunityForm';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import SavedOpportunities from './pages/SavedOpportunities';
import About from './pages/About';
import Notifications from './pages/Notifications';
import OrganizationProfile from './pages/OrganizationProfile';
import Admin from './pages/Admin';
import { useEffect } from 'react';


function ScrollTop() { const { pathname } = useLocation();    useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }

function Protected({ role, children }) {
  const { user, ready, loggedOut } = useAuth();
  const { pathname } = useLocation();
  if (!ready) return <p className="mut" style={{ padding: 24 }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: loggedOut ? '/' : pathname }} />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
    <ScrollTop />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/saved" element={<SavedOpportunities />} />
        <Route path="/about" element={<About />} />
        <Route path="/organizations/:id" element={<OrganizationProfile />} />
        <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="/admin" element={<Protected role="admin"><Admin /></Protected>} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/activities" element={<Protected role="volunteer"><MyActivities /></Protected>} />
        <Route path="/post" element={<Protected role="organization"><OpportunityForm /></Protected>} />
        <Route path="/edit/:id" element={<Protected role="organization"><OpportunityForm /></Protected>} />
        <Route path="/reports" element={<Protected><Reports /></Protected>} />
<Route path="/profile" element={<Protected><Profile /></Protected>} />
      </Route>
    </Routes>
    </>
  );
}
