import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChatWidget from "../components/ChatWidget";
import ImpactChart from "../components/ImpactChart";
import NeedsHeatmap from "../components/NeedsHeatmap";
import { getNgoDashboard, completeIssue, getIssues } from "../api";

export default function NGODashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("sevasync_user")) || { name: "Community NGO" };

  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState([20.5937, 78.9629]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [data, allData] = await Promise.all([getNgoDashboard(), getIssues()]);
        setStats(data.stats);
        setCategories(data.categories);
        setIssues(data.issues);
        setAllIssues(allData);
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(pos =>
            setUserLocation([pos.coords.latitude, pos.coords.longitude]));
        }
      } catch (err) {
        console.error("Failed to fetch NGO Dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleComplete = async (issueId) => {
    if (!window.confirm("Mark this issue as Completed? Volunteers will receive their impact score.")) return;
    try {
      await completeIssue(issueId);
      // Refresh dashboard
      const data = await getNgoDashboard();
      setStats(data.stats); setCategories(data.categories); setIssues(data.issues);
    } catch (err) { alert("Error: " + err.message); }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case "High": return "bg-red-100 text-urgency";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Low": return "bg-green-100 text-success";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Open": return "bg-blue-100 text-primary";
      case "In Progress": return "bg-yellow-100 text-yellow-700";
      case "Completed": return "bg-green-100 text-success";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sevasync_user");
    localStorage.removeItem("sevasync_token");
    navigate("/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center font-bold text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name}</h1>
          <p className="text-sm text-gray-500">NGO Dashboard</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/upload" className="bg-primary text-white px-5 py-2 rounded-xl shadow hover:bg-blue-600 transition">
            Upload Issue
          </Link>
          <Link to="/profile" className="text-primary font-medium hover:underline flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Profile
          </Link>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition px-2">
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-soft flex items-center justify-between"
            >
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <div className={`w-4 h-4 rounded-full ${stat.color.replace('text-', 'bg-')}`}></div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: "/survey", icon: "📋", label: "Survey Digitizer", desc: "Bulk upload field reports & CSV", color: "from-purple-500 to-purple-700" },
            { to: "/ai-match", icon: "🤖", label: "AI Volunteer Match", desc: "Auto-rank best volunteers per issue", color: "from-primary to-blue-600" },
            { to: "/community-map", icon: "🗺️", label: "Community Heatmap", desc: "Live map of all active issues", color: "from-green-500 to-emerald-600" },
            { to: "/leaderboard", icon: "🏆", label: "Leaderboard", desc: "Top volunteer rankings", color: "from-yellow-500 to-orange-600" },
          ].map((action, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={action.to}
                className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 block`}>
                <div className="text-3xl">{action.icon}</div>
                <div>
                  <p className="font-bold text-sm">{action.label}</p>
                  <p className="text-xs text-white/75 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Live Community Heatmap Preview */}
        <section className="bg-white p-6 rounded-2xl shadow-soft">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Live Community Heatmap</h2>
              <p className="text-sm text-gray-500">{allIssues.length} active issues in your area</p>
            </div>
            <Link to="/community-map" className="text-primary font-bold text-sm hover:underline">Full Screen →</Link>
          </div>
          <NeedsHeatmap issues={allIssues} center={userLocation} height="300px" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Category Breakdown — now uses ImpactChart */}
          <section className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-soft">
            <ImpactChart categories={categories} title="SDG Impact by Category" />
          </section>

          {/* Issues List */}
          <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">My Created Issues</h2>
              <Link to="/tasks" className="text-primary text-sm font-medium hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {issues.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 mb-4">You haven't created any issues yet.</p>
                  <Link to="/upload" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-600 transition">
                    Upload First Issue
                  </Link>
                </div>
              ) : (
                issues.map((issue, i) => (
                  <motion.div 
                    key={issue._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <Link to={`/task/${issue._id}`} className="block group">
                        <h3 className="font-bold text-gray-800 mb-1 group-hover:text-primary transition flex items-center gap-2">
                          {issue.title}
                          <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">Open Details →</span>
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-xs mt-2">
                        <span className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
                          {issue.category}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md font-medium ${getUrgencyColor(issue.urgency)}`}>
                          {issue.urgency} Urgency
                        </span>
                        <span className="text-gray-500 flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {issue.location}
                        </span>
                      </div>
                    </div>
                    {issue.status === "Open" && (
                      <div className="text-xs text-gray-500 whitespace-nowrap bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        ⏳ Waiting for volunteer
                      </div>
                    )}
                    {issue.status === "In Progress" && (
                      <button onClick={() => handleComplete(issue._id)}
                        className="text-xs font-bold whitespace-nowrap bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition shadow-sm">
                        ✅ Mark Complete
                      </button>
                    )}
                    {issue.status === "Completed" && (
                      <div className="text-xs text-green-600 font-bold whitespace-nowrap bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                        🎉 Completed
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>
      <ChatWidget />
    </div>
  );
}
