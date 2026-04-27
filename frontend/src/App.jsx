import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NGODashboard from "./pages/NGODashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import UploadData from "./pages/UploadData";
import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";
import Impact from "./pages/Impact";
import Profile from "./pages/Profile";
import SurveyUpload from "./pages/SurveyUpload";
import CommunityMap from "./pages/CommunityMap";
import AIMatch from "./pages/AIMatch";
import Leaderboard from "./pages/Leaderboard";
import EmergencyBroadcast from "./components/EmergencyBroadcast";
import { AnimatePresence } from "framer-motion";

export function getUser() {
  const user = localStorage.getItem("sevasync_user");
  return user ? JSON.parse(user) : null;
}

function PrivateRoute({ children, role }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "ngo" ? "/ngo-dashboard" : "/volunteer-dashboard"} />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <EmergencyBroadcast />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/ngo-dashboard" element={<PrivateRoute role="ngo"><NGODashboard /></PrivateRoute>} />
          <Route path="/volunteer-dashboard" element={<PrivateRoute role="volunteer"><VolunteerDashboard /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute role="ngo"><UploadData /></PrivateRoute>} />
          <Route path="/survey" element={<PrivateRoute role="ngo"><SurveyUpload /></PrivateRoute>} />
          <Route path="/ai-match" element={<PrivateRoute role="ngo"><AIMatch /></PrivateRoute>} />
          <Route path="/community-map" element={<PrivateRoute><CommunityMap /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />

          <Route path="/tasks" element={<PrivateRoute><TaskList /></PrivateRoute>} />
          <Route path="/task/:id" element={<PrivateRoute><TaskDetail /></PrivateRoute>} />
          <Route path="/impact" element={<PrivateRoute role="volunteer"><Impact /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
