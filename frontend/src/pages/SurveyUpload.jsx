import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { uploadSurveyBulk, analyzeIssueDeep } from "../api";

const TEMPLATES = [
  { title: "Health Camp Needed", description: "Community members require urgent medical assistance", category: "Health", urgency: "High", location: "" },
  { title: "School Supplies Shortage", description: "Students lack books and stationery for the upcoming term", category: "Education", urgency: "Medium", location: "" },
  { title: "Garbage Accumulation", description: "Waste not being collected, causing a health hazard", category: "Environment", urgency: "High", location: "" },
  { title: "Food Distribution Required", description: "Families in need of ration and nutritional support", category: "Food Relief", urgency: "High", location: "" },
  { title: "Road Damage", description: "Local road damaged and requires urgent repair", category: "Infrastructure", urgency: "Medium", location: "" },
];

export default function SurveyUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [entries, setEntries] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [rawText, setRawText] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  const addEntry = () => setEntries([...entries, { title: "", description: "", category: "Health", urgency: "Medium", location: "" }]);
  const removeEntry = (i) => setEntries(entries.filter((_, idx) => idx !== i));
  const updateEntry = (i, field, val) => setEntries(entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  const useTemplate = (tmpl) => { setEntries([...entries, { ...tmpl }]); setActiveTab("manual"); };

  const parseRawText = async () => {
    if (!rawText.trim()) return;
    setAiProcessing(true);
    try {
      const lines = rawText.split(/\n+/).filter(l => l.trim().length > 10).slice(0, 8);
      const parsed = [];
      for (const line of lines) {
        const result = await analyzeIssueDeep(line);
        parsed.push({ title: line.slice(0, 60), description: line, category: result.category, urgency: result.urgency, location: "From survey" });
      }
      setEntries([...entries, ...parsed]);
      setRawText("");
      setActiveTab("manual");
    } catch (err) { alert("AI parsing failed: " + err.message); }
    finally { setAiProcessing(false); }
  };

  const handleCSVUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split("\n").slice(1).filter(l => l.trim());
      const parsed = lines.map(line => {
        const [title, description, category, urgency, location] = line.split(",");
        return { title: title?.trim() || "Untitled", description: description?.trim() || "", category: category?.trim() || "Environment", urgency: urgency?.trim() || "Medium", location: location?.trim() || "Unknown" };
      });
      setEntries([...entries, ...parsed]);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleCSVUpload(file); else alert("Please drop a CSV file");
  };

  const handleSubmit = async () => {
    if (entries.length === 0) return alert("Add at least one entry");
    if (entries.find(e => !e.title || !e.location)) return alert("All entries need a title and location");
    setUploading(true);
    try { await uploadSurveyBulk(entries); setDone(true); setTimeout(() => navigate("/ngo-dashboard"), 2500); }
    catch (err) { alert("Upload failed: " + err.message); }
    finally { setUploading(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center bg-white p-12 rounded-3xl shadow-xl">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{entries.length} Issues Uploaded!</h2>
        <p className="text-gray-500">Volunteers will be notified. Redirecting...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white shadow-sm p-5 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">📋 Survey Data Digitizer</h1>
          <p className="text-sm text-gray-500">Upload field reports, CSV files, or paste raw survey text</p>
        </div>
        <Link to="/ngo-dashboard" className="text-primary font-medium hover:underline text-sm">← Dashboard</Link>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-soft">
          {[["manual", "✏️ Manual"], ["paste", "🤖 AI Parser"], ["template", "📄 Templates"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${activeTab === key ? "bg-primary text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* CSV Drop Zone */}
        <div onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${dragOver ? "border-primary bg-blue-50" : "border-gray-200 hover:border-primary hover:bg-blue-50/30"}`}>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={e => handleCSVUpload(e.target.files[0])} />
          <div className="text-4xl mb-2">📂</div>
          <p className="font-semibold text-gray-700">Drop a CSV file or click to upload</p>
          <p className="text-sm text-gray-400 mt-1">Format: title, description, category, urgency, location</p>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "paste" && (
            <motion.div key="paste" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white p-6 rounded-2xl shadow-soft">
              <h3 className="font-bold text-gray-800 mb-1">🤖 AI Text Parser</h3>
              <p className="text-sm text-gray-500 mb-4">Paste raw field notes. AI will parse each line into structured issues.</p>
              <textarea value={rawText} onChange={e => setRawText(e.target.value)} rows={6}
                placeholder={"Street flooding near bus stand, urgent medical camp needed\nSchool in ward 5 has no books\nGarbage piling up in Sector 12..."}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              <button onClick={parseRawText} disabled={aiProcessing || !rawText.trim()}
                className={`mt-3 w-full py-3 rounded-xl font-bold text-sm transition ${aiProcessing || !rawText.trim() ? "bg-gray-100 text-gray-400" : "bg-gradient-to-r from-purple-500 to-primary text-white hover:shadow-lg"}`}>
                {aiProcessing ? "⏳ AI Analyzing..." : "✨ Parse with AI"}
              </button>
            </motion.div>
          )}

          {activeTab === "template" && (
            <motion.div key="template" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {TEMPLATES.map((tmpl, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-soft flex items-center justify-between gap-4 hover:shadow-md transition">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{tmpl.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{tmpl.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tmpl.urgency === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>{tmpl.urgency}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-primary">{tmpl.category}</span>
                    </div>
                  </div>
                  <button onClick={() => useTemplate(tmpl)} className="bg-primary text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-blue-600 whitespace-nowrap">Use</button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual Entries */}
        {entries.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800">📝 Entries ({entries.length})</h3>
              <button onClick={addEntry} className="text-primary text-sm font-bold hover:underline">+ Add Row</button>
            </div>
            {entries.map((entry, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-5 rounded-2xl shadow-soft">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase">Entry #{i + 1}</span>
                  <button onClick={() => removeEntry(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={entry.title} onChange={e => updateEntry(i, "title", e.target.value)} placeholder="Issue Title *"
                    className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <input value={entry.location} onChange={e => updateEntry(i, "location", e.target.value)} placeholder="Location / Area *"
                    className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <textarea value={entry.description} onChange={e => updateEntry(i, "description", e.target.value)} placeholder="Description" rows={2}
                    className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none md:col-span-2" />
                  <select value={entry.category} onChange={e => updateEntry(i, "category", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {["Health","Education","Environment","Food Relief","Infrastructure"].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select value={entry.urgency} onChange={e => updateEntry(i, "urgency", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {["High","Medium","Low"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {entries.length === 0 && activeTab === "manual" && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 mb-4">No entries yet. Add manually, use a template, or paste survey text.</p>
            <button onClick={addEntry} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition">+ Add First Entry</button>
          </div>
        )}

        {entries.length > 0 && (
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={uploading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition shadow-lg ${uploading ? "bg-gray-200 text-gray-400" : "bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-xl"}`}>
            {uploading ? "⏳ Uploading..." : `🚀 Submit ${entries.length} Issue${entries.length > 1 ? "s" : ""} to Database`}
          </motion.button>
        )}
      </main>
    </div>
  );
}
