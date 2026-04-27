import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getNgoDashboard, aiMatchVolunteers, getIssues } from "../api";

export default function AIMatch() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matching, setMatching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIssues()
      .then(data => setIssues(data.filter(i => i.status === "Open")))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const runMatch = async (issue) => {
    setSelectedIssue(issue);
    setMatches([]);
    setMatching(true);
    try {
      const result = await aiMatchVolunteers(issue._id);
      setMatches(result.matches || []);
    } catch (err) {
      alert("Matching failed: " + err.message);
    } finally {
      setMatching(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white shadow-sm p-5 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🤖 AI Volunteer Matchmaker</h1>
          <p className="text-sm text-gray-500">Select an open issue to find the best-fit volunteers instantly</p>
        </div>
        <Link to="/ngo-dashboard" className="text-primary font-medium hover:underline text-sm">← Dashboard</Link>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Issue List */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Open Issues</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading issues...</div>
            ) : issues.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 mb-3">No open issues to match.</p>
                <Link to="/upload" className="text-primary font-bold hover:underline">Upload an Issue</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map(issue => (
                  <motion.button key={issue._id} onClick={() => runMatch(issue)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition shadow-soft ${selectedIssue?._id === issue._id ? "border-primary bg-blue-50" : "border-transparent bg-white hover:border-blue-200"}`}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800 text-sm">{issue.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ml-2 ${issue.urgency === "High" ? "bg-red-100 text-red-600" : issue.urgency === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-600"}`}>
                        {issue.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">📍 {issue.location} · {issue.category}</p>
                    {selectedIssue?._id === issue._id && (
                      <p className="text-xs text-primary font-bold mt-2">✓ Selected — finding matches below</p>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Match Results */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {selectedIssue ? `Best Volunteers for "${selectedIssue.title}"` : "Select an issue →"}
            </h2>

            {!selectedIssue && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="text-5xl mb-4">🤝</div>
                <p className="text-gray-500">Pick an open issue on the left to see the AI-ranked volunteers best suited for it.</p>
              </div>
            )}

            {matching && (
              <div className="text-center py-20 bg-white rounded-2xl">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-bold text-gray-700">AI is analyzing and ranking volunteers...</p>
                <p className="text-sm text-gray-400 mt-1">Checking location, experience, and impact score</p>
              </div>
            )}

            {!matching && matches.length > 0 && (
              <div className="space-y-3">
                {matches.map((vol, i) => (
                  <motion.div key={vol._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-white p-5 rounded-2xl shadow-soft">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-400 rounded-full flex items-center justify-center text-white font-bold uppercase">
                          {vol.name?.charAt(0) || "V"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{vol.name}</p>
                          <p className="text-xs text-gray-500">{vol.tasksCompleted} tasks · {vol.impactScore} impact pts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-extrabold px-3 py-1 rounded-xl ${getScoreColor(vol.matchScore)}`}>
                          {vol.matchScore}%
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">AI Match Score</p>
                      </div>
                    </div>

                    {/* Match score bar */}
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${vol.matchScore}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={`h-1.5 rounded-full ${vol.matchScore >= 80 ? "bg-green-500" : vol.matchScore >= 60 ? "bg-yellow-500" : "bg-gray-400"}`} />
                    </div>

                    <div className="flex gap-2 mt-3">
                      {i === 0 && <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">⭐ Top Match</span>}
                      <span className="text-[10px] bg-blue-50 text-primary font-bold px-2 py-0.5 rounded-full">📍 ~{vol.distanceKm} km away</span>
                    </div>
                  </motion.div>
                ))}

                <p className="text-xs text-gray-400 text-center pt-2">
                  Ranked by AI using location, experience, and impact score. Message volunteers via the Chat widget.
                </p>
              </div>
            )}

            {!matching && selectedIssue && matches.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl">
                <p className="text-gray-500">No registered volunteers found yet.</p>
                <p className="text-sm text-gray-400 mt-1">Volunteers who sign up will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
