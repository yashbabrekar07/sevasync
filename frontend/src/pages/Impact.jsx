import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { getVolunteerDashboard, getImpactStory } from "../api";

export default function Impact() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [story, setStory] = useState("");
  const [loadingStory, setLoadingStory] = useState(false);
  const certificateRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("sevasync_user") || "{}");

  const fetchData = async () => {
    try {
      const res = await getVolunteerDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      certificateRef.current.style.display = "block";
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      certificateRef.current.style.display = "none";
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${user.name?.replace(/\s+/g, '_') || "Volunteer"}_SDG_Impact_Certificate.png`;
      link.click();
    } catch (err) {
      console.error("Certificate generation failed", err);
      alert("Failed to generate certificate.");
    } finally {
      setDownloading(false);
    }
  };

  const handleGenerateStory = async () => {
    setLoadingStory(true);
    try {
      const res = await getImpactStory();
      setStory(res.story);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStory(false);
    }
  };

  const stats = [
    { label: "Tasks Completed", value: data?.stats?.tasksCompleted || 0, icon: "🏆", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Impact Score", value: data?.stats?.impactScore || 0, icon: "⭐", color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Hours Volunteered", value: data?.stats?.hoursVolunteered || 0, icon: "⏱️", color: "text-purple-600", bg: "bg-purple-50" }
  ];

  const sdgAlignment = [
    { goal: 3, name: "Good Health", color: "#4C9F38", count: data?.acceptedTasks?.filter(t => t.category === "Health").length || 0 },
    { goal: 4, name: "Quality Education", color: "#C5192D", count: data?.acceptedTasks?.filter(t => t.category === "Education").length || 0 },
    { goal: 11, name: "Sustainable Cities", color: "#FD9D24", count: data?.acceptedTasks?.filter(t => t.category === "Infrastructure" || t.category === "Environment").length || 0 },
    { goal: 2, name: "Zero Hunger", color: "#D3A029", count: data?.acceptedTasks?.filter(t => t.category === "Food Relief").length || 0 },
  ];

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center font-bold text-gray-500">Loading Report...</div>;

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Impact Report</h1>
            <p className="text-sm text-gray-500">Tracking your contribution to the Global Goals</p>
          </div>
        </div>
        <Link to="/volunteer-dashboard" className="text-primary font-medium hover:underline text-sm">Dashboard</Link>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Global Impact Header */}
        <div className="bg-gradient-to-br from-primary to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-black mb-2">{data?.stats?.impactScore || 0} PTS</h2>
              <p className="text-blue-100">Total SDG Impact Score</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-sm">
                <p className="text-2xl font-bold">{data?.stats?.tasksCompleted || 0}</p>
                <p className="text-xs text-blue-200">Tasks Done</p>
              </div>
              <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-sm">
                <p className="text-2xl font-bold">{data?.stats?.hoursVolunteered || 0}h</p>
                <p className="text-xs text-blue-200">Hours Given</p>
              </div>
            </div>
            <button 
              onClick={handleDownloadCertificate}
              disabled={downloading || (data?.stats?.tasksCompleted || 0) === 0}
              className={`px-6 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 ${(data?.stats?.tasksCompleted || 0) > 0 && !downloading ? "bg-white text-primary hover:shadow-lg transform hover:-translate-y-1" : "bg-white/30 text-white cursor-not-allowed"}`}
            >
              {downloading ? "Generating..." : "🎓 Download Certificate"}
            </button>
          </div>
        </div>

        {/* SDG Impact Section */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🌍 SDG Contribution Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sdgAlignment.map((goal, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-soft border-l-8 flex items-center justify-between"
                style={{ borderColor: goal.color }}
              >
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Goal {goal.goal}</p>
                  <h4 className="text-lg font-bold text-gray-800">{goal.name}</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gray-900">{goal.count}</div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Tasks</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Impact Storyteller */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="bg-purple-100 text-purple-600 text-[10px] font-black uppercase px-2 py-1 rounded-md">AI Powered</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            ✨ Your Impact Story
          </h3>
          {story ? (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-gray-600 italic leading-relaxed text-lg"
            >
              "{story}"
            </motion.p>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-6 text-sm">Let AI weave your contributions into a powerful narrative for your portfolio.</p>
              <button 
                onClick={handleGenerateStory}
                disabled={loadingStory}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50"
              >
                {loadingStory ? "Generating Narrative..." : "Generate My Story"}
              </button>
            </div>
          )}
        </section>

        {/* Badges Section */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6">🎖️ Achievement Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Badge icon="🥉" name="First Step" desc="1st Task Done" earned={(data?.stats?.tasksCompleted || 0) >= 1} />
            <Badge icon="🥈" name="Active Hero" desc="5 Tasks Done" earned={(data?.stats?.tasksCompleted || 0) >= 5} />
            <Badge icon="🥇" name="Master Sync" desc="10 Tasks Done" earned={(data?.stats?.tasksCompleted || 0) >= 10} />
            <Badge icon="💠" name="Top 1%" desc="High Impact" earned={(data?.stats?.impactScore || 0) >= 1000} />
          </div>
        </section>
      </main>

      <div style={{ display: "none" }}>
        <div 
          ref={certificateRef} 
          className="w-[800px] h-[600px] bg-white relative overflow-hidden"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <div className="absolute inset-0 border-[16px] border-primary"></div>
          <div className="absolute inset-0 border-[20px] border-transparent border-t-blue-100 border-b-blue-100"></div>
          <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
            <h3 className="text-primary font-black tracking-widest uppercase text-xl mb-2">SevaSync Community</h3>
            <h1 className="text-5xl font-black text-gray-800 mb-8" style={{ fontFamily: "serif" }}>Certificate of Impact</h1>
            <p className="text-gray-500 text-lg mb-2">This is proudly presented to</p>
            <h2 className="text-4xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 px-12 inline-block mb-8">{user.name || "Volunteer"}</h2>
            <p className="text-gray-600 text-lg max-w-lg mb-10 leading-relaxed">In recognition of exceptional dedication to community service and advancing the UN Sustainable Development Goals.</p>
            <div className="flex gap-12 text-center">
              <div>
                <p className="text-3xl font-black text-primary">{data?.stats?.impactScore || 0}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Impact Score</p>
              </div>
              <div>
                <p className="text-3xl font-black text-green-600">{data?.stats?.tasksCompleted || 0}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tasks Completed</p>
              </div>
              <div>
                <p className="text-3xl font-black text-blue-600">{data?.stats?.hoursVolunteered || 0}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Hours Given</p>
              </div>
            </div>
            <div className="absolute bottom-12 left-12 flex items-end gap-4">
               <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg">S</div>
               <div className="text-left">
                 <p className="font-bold text-gray-800">SevaSync Platform</p>
                 <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
               </div>
            </div>
            
            <div className="absolute bottom-12 right-12 text-right">
              <p className="font-bold text-gray-800 border-t border-gray-800 pt-2 w-40 inline-block">Official Record</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, name, desc, earned }) {
  return (
    <motion.div 
      whileHover={earned ? { y: -5 } : {}}
      className={`p-5 rounded-3xl text-center border-2 transition ${earned ? "bg-white border-primary shadow-soft" : "bg-gray-50 border-transparent grayscale opacity-50"}`}
    >
      <div className="text-4xl mb-3">{earned ? icon : "🔒"}</div>
      <p className="font-bold text-gray-800 text-sm leading-tight">{name}</p>
      <p className="text-[10px] text-gray-500 mt-1">{desc}</p>
    </motion.div>
  );
}
