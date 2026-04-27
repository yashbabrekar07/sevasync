import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TaskMap from "../components/TaskMap";
import ChatWidget from "../components/ChatWidget";
import { getIssues, getVolunteerDashboard, acceptIssue } from "../api";

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("sevasync_user")) || { name: "Volunteer" };
  
  const [nearbyTasks, setNearbyTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [stats, setStats] = useState({ impactScore: 0, tasksCompleted: 0, hoursVolunteered: 0 });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Calculate distance in km
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchData = useCallback(async () => {
    try {
      const [dashData, issues] = await Promise.all([
        getVolunteerDashboard(),
        getIssues()
      ]);
      setStats(dashData.stats);
      setActiveTasks(dashData.acceptedTasks || []);

      const formattedTasks = issues.map(issue => {
        let distStr = "Nearby";
        if (userLocation) {
          const d = getDistance(userLocation.lat, userLocation.lng, issue.lat || 18.5204, issue.lng || 73.8567);
          distStr = d < 1 ? `${Math.round(d * 1000)}m away` : `${d.toFixed(1)}km away`;
        }
        return {
          id: issue._id,
          title: issue.title,
          distance: distStr,
          urgency: issue.urgency,
          location: issue.location,
          lat: issue.lat || 18.5204,
          lng: issue.lng || 73.8567
        };
      });
      setNearbyTasks(formattedTasks);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [userLocation]); // Re-run when location is acquired

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10s for sync
    return () => clearInterval(interval);
  }, [userLocation]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.warn("Location denied, using Pune defaults", error)
      );
    }
  }, []);

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case "High": return "bg-red-100 text-urgency";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Low": return "bg-green-100 text-success";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      await acceptIssue(taskId);
      alert("Task accepted successfully!");
      fetchData(); // Reload data
    } catch (err) {
      alert(`Error: ${err.message}`);
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
      <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hello, {user.name}</h1>
          <p className="text-sm text-gray-500">Ready to make an impact?</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-primary font-medium hover:underline flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Profile
          </Link>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition px-2">
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8 mt-4">
        
        {/* Volunteer Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-3xl shadow-soft text-white flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Impact Score</p>
              <h2 className="text-4xl font-bold">{stats.impactScore}</h2>
            </div>
            <div className="text-5xl opacity-80">⭐</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-soft flex items-center justify-between">
            <div>
              <p className="text-gray-500 mb-1">Tasks Completed</p>
              <h2 className="text-4xl font-bold text-gray-800">{stats.tasksCompleted}</h2>
            </div>
            <div className="w-14 h-14 bg-green-100 text-success rounded-full flex items-center justify-center text-2xl">✓</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-soft flex items-center justify-between">
            <div>
              <p className="text-gray-500 mb-1">Hours Volunteered</p>
              <h2 className="text-4xl font-bold text-gray-800">{stats.hoursVolunteered}h</h2>
            </div>
            <div className="w-14 h-14 bg-blue-100 text-primary rounded-full flex items-center justify-center text-2xl">⏱️</div>
          </motion.div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/community-map" className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 block">
              <div className="text-3xl">🗺️</div>
              <div>
                <p className="font-bold text-sm">Community Needs Heatmap</p>
                <p className="text-xs text-white/75 mt-0.5">See live issues across your area</p>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link to="/impact" className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 block">
              <div className="text-3xl">📈</div>
              <div>
                <p className="font-bold text-sm">My Impact Report</p>
                <p className="text-xs text-white/75 mt-0.5">View your SDG contribution stats</p>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link to="/leaderboard" className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 block">
              <div className="text-3xl">🏆</div>
              <div>
                <p className="font-bold text-sm">Top Community Heroes</p>
                <p className="text-xs text-white/75 mt-0.5">View regional rankings</p>
              </div>
            </Link>
          </motion.div>
        </section>

        {/* Active Tasks Section - Refactored to match premium NGO aesthetic */}
        {activeTasks.length > 0 && (
          <section className="bg-white p-6 rounded-2xl shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Active Tasks</h2>
              <span className="text-xs bg-blue-50 text-primary font-bold px-3 py-1 rounded-full">
                {activeTasks.filter(t => t.status !== 'Completed').length} Pending
              </span>
            </div>
            
            <div className="space-y-4">
              {activeTasks.map((task, i) => (
                <motion.div 
                  key={task._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="p-5 border border-gray-100 rounded-2xl hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
                >
                  <div className="flex-1">
                    <Link to={`/task/${task._id}`} className="block group">
                      <h3 className="font-bold text-gray-800 mb-2 group-hover:text-primary transition flex items-center gap-2">
                        {task.title}
                        <span className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">View →</span>
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${task.status === "Completed" ? "bg-green-100 text-green-600" : "bg-blue-100 text-primary"}`}>
                        {task.status === "Completed" ? "COMPLETED" : "IN PROGRESS"}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
                        {task.category || "General"}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md font-medium ${getUrgencyColor(task.urgency)}`}>
                        {task.urgency} Urgency
                      </span>
                      <span className="text-gray-500 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {task.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {task.status === "Completed" ? (
                      <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 font-bold text-sm shadow-sm">
                        <span>💖</span> Completed
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl border border-yellow-100 font-bold text-sm">
                        <span>⏳</span> In Progress
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Interactive Map Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Live Open Tasks Heatmap</h2>
            <div className="text-sm text-gray-500 flex items-center gap-3">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> High</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Med</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Low</span>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <TaskMap tasks={nearbyTasks} onAccept={handleAcceptTask} userLocation={userLocation} />
          </motion.div>
        </section>

        {/* Nearby Tasks */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Nearby Open Tasks List</h2>
            <div className="text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              Auto-detecting location
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {nearbyTasks.map((task, i) => {
              const isAccepted = activeTasks.some(t => t._id === task.id);
              if (isAccepted) return null; // Hide already accepted tasks from open list
              
              return (
                <motion.div 
                  key={task.id} 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl shadow-soft overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${getUrgencyColor(task.urgency)}`}>
                        {task.urgency} Urgency
                      </span>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md flex items-center">
                        📍 {task.distance}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">{task.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-auto">
                      {task.location}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button 
                      onClick={() => handleAcceptTask(task.id)}
                      className="w-full py-3 rounded-xl font-bold text-sm transition shadow-sm bg-primary text-white hover:bg-blue-600 hover:shadow-md"
                    >
                      Accept Task
                    </button>
                  </div>
                </motion.div>
              );
            })}
            
            {nearbyTasks.length === 0 && (
              <div className="col-span-4 p-8 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
                No open tasks available nearby. You're all caught up!
              </div>
            )}
          </div>
        </section>

      </main>
      <ChatWidget />
    </div>
  );
}
