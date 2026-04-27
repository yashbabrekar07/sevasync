import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getIssues } from "../api";
import SkillBadge from "../components/SkillBadge";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("sevasync_user")) || {};

  useEffect(() => {
    getIssues()
      .then(data => setTasks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s) => ({
    "Open": "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-primary",
    "Completed": "bg-gray-100 text-gray-500",
  }[s] || "bg-gray-100 text-gray-600");

  const urgencyColor = (u) => ({
    "High": "bg-red-100 text-red-600",
    "Medium": "bg-yellow-100 text-yellow-700",
    "Low": "bg-green-100 text-green-600",
  }[u] || "bg-gray-100 text-gray-600");

  const filtered = tasks.filter(t => {
    const matchFilter = filter === "All" || t.status === filter || t.urgency === filter || t.category === filter;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                        t.location?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Community Issues</h1>
          <p className="text-sm text-gray-500">{tasks.length} issues tracked across the platform</p>
        </div>
        <Link to={user.role === "ngo" ? "/ngo-dashboard" : "/volunteer-dashboard"} className="text-primary font-medium hover:underline text-sm">
          ← Dashboard
        </Link>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6 mt-2">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by title or location..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-soft focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {["All","Open","In Progress","Completed","High","Medium","Low"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filter === f ? "bg-primary text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-primary"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold">Loading issues...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-soft border border-dashed border-gray-200">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 font-bold">No issues match your search or filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Issue</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Urgency</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map((task, i) => (
                <motion.div
                  key={task._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 hover:bg-blue-50/20 transition items-center"
                >
                  <div className="md:col-span-4">
                    <h3 className="font-bold text-gray-800 text-base leading-tight">{task.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <span>📍</span>{task.location}
                    </p>
                    {task.createdBy?.name && (
                      <p className="text-[10px] text-gray-400 mt-0.5">By {task.createdBy.name}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <SkillBadge skill={task.category} size="sm" animate={false} />
                  </div>
                  <div className="md:col-span-2 md:text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${statusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 md:text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${urgencyColor(task.urgency)}`}>
                      {task.urgency}
                    </span>
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    <button
                      onClick={() => navigate(`/task/${task._id}`)}
                      className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow-sm"
                    >
                      View →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
