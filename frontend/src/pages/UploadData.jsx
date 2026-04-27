import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeIssueDeep, createIssue } from "../api";
import SkillBadge from "../components/SkillBadge";

export default function UploadData() {
  const [formData, setFormData] = useState({ title: "", description: "", category: "", urgency: "", location: "" });
  const [submitted, setSubmitted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAIAnalyze = async () => {
    if (!formData.description) return alert("Please enter a description first!");
    setAnalyzing(true);
    setAiResult(null);
    setAiError(false);
    try {
      const result = await analyzeIssueDeep(formData.description);
      setAiResult(result);
      setFormData(prev => ({ ...prev, category: result.category, urgency: result.urgency }));
    } catch (err) {
      console.error("AI Analysis failed:", err.message);
      setAiError(true); // Show graceful fallback instead of crashing
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createIssue(formData);
      setSubmitted(true);
      setTimeout(() => navigate("/ngo-dashboard"), 2000);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📝 Report Community Issue</h1>
          <p className="text-sm text-gray-500">AI will auto-detect urgency and category from your description</p>
        </div>
        <Link to="/ngo-dashboard" className="text-primary font-medium hover:underline text-sm">← Dashboard</Link>
      </header>

      <main className="p-6 flex justify-center mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-soft w-full max-w-2xl">

          {submitted ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-14">
              <div className="text-7xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Issue Submitted!</h2>
              <p className="text-gray-500">Redirecting to your dashboard...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Issue Title *</label>
                <input type="text" name="title" required placeholder="e.g. Flooding at Sector 12 community park"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                  value={formData.title} onChange={handleChange} />
              </div>

              {/* Description + AI Button */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">Description *</label>
                  <button type="button" onClick={handleAIAnalyze} disabled={analyzing || !formData.description}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${analyzing || !formData.description ? "bg-gray-100 text-gray-400" : "bg-gradient-to-r from-purple-500 to-primary text-white shadow-sm hover:shadow-md"}`}>
                    {analyzing ? <span className="animate-pulse">⏳ Analyzing...</span> : <span>✨ Auto-Detect with AI</span>}
                  </button>
                </div>
                <textarea name="description" required rows={4} placeholder="Describe the community problem in detail. The more detail you add, the better the AI will classify it..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition resize-none text-sm"
                  value={formData.description} onChange={handleChange} />
              </div>

              {/* AI Result / Fallback */}
              <AnimatePresence>
                {analyzing && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-2xl"
                    role="status" aria-live="polite" aria-label="AI is analyzing your description"
                  >
                    <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin flex-shrink-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-purple-700">🤖 Gemini AI is analyzing your description...</p>
                  </motion.div>
                )}
                {aiError && !analyzing && (
                  <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3"
                    role="alert" aria-live="assertive"
                  >
                    <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-amber-800">AI analysis unavailable</p>
                      <p className="text-xs text-amber-700 mt-0.5">The AI service is temporarily delayed. Please select the category and urgency manually using the dropdowns below.</p>
                    </div>
                  </motion.div>
                )}
                {aiResult && !analyzing && (
                  <motion.div key="result" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-5"
                    role="region" aria-live="polite" aria-label="AI analysis results"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🤖</span>
                      <p className="font-bold text-purple-800 text-sm">AI Analysis Complete</p>
                      <span className="text-[10px] bg-purple-100 text-purple-600 font-bold px-2 py-0.5 rounded-full ml-auto">{aiResult.confidence} confidence</span>
                    </div>
                    <p className="text-xs text-purple-700 mb-3 italic">"{aiResult.aiSummary}"</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-bold bg-white text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                        📂 {aiResult.category}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${aiResult.urgency === "High" ? "bg-red-100 text-red-600" : aiResult.urgency === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-600"}`}>
                        ⚡ {aiResult.urgency} Urgency
                      </span>
                      {aiResult.requiredSkills?.map(s => <SkillBadge key={s} skill={s} size="sm" />)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category + Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <select name="category" required value={formData.category} onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary transition text-sm ${formData.category ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"}`}>
                    <option value="">Select Category</option>
                    {["Health","Education","Environment","Food Relief","Infrastructure"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Urgency *</label>
                  <select name="urgency" required value={formData.urgency} onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary transition text-sm ${formData.urgency ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"}`}>
                    <option value="">Select Urgency</option>
                    {["High","Medium","Low"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location / Area *</label>
                <input type="text" name="location" required placeholder="e.g. Sector 12, Block C, Jaipur"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                  value={formData.location} onChange={handleChange} />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition ${submitting ? "bg-gray-200 text-gray-400" : "bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-xl"}`}>
                  {submitting ? "⏳ Submitting..." : "🚀 Submit Issue"}
                </motion.button>
                <p className="text-xs text-center text-gray-400 mt-3">
                  Or upload many issues at once with the{" "}
                  <Link to="/survey" className="text-primary font-bold hover:underline">Survey Digitizer →</Link>
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
