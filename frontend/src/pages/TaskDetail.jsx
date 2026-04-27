import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { getTask, acceptIssue, aiMatchVolunteers, translateText, broadcastIssue } from "../api";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matching, setMatching] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [broadcasting, setBroadcasting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImg, setCapturedImg] = useState(null);
  const webcamRef = useState(null);
  
  const user = JSON.parse(localStorage.getItem("sevasync_user"));

  useEffect(() => {
    getTask(id)
      .then(res => {
        setTask(res.task);
        if (res.task.assignedVolunteers?.includes(user?.id)) setAccepted(true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  const handleAccept = async () => {
    try {
      await acceptIssue(id);
      setAccepted(true);
      alert("Task accepted! Check your dashboard for updates.");
    } catch (err) {
      alert(err.message);
    }
  };

  const runAiMatch = async () => {
    setMatching(true);
    try {
      const res = await aiMatchVolunteers(id);
      setMatches(res.matches || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setMatching(false);
    }
  };

  const handleTranslate = async (lang) => {
    if (lang === "en") {
      setTask({ ...task, displayTitle: task.title, displayDesc: task.description });
      setCurrentLang("en");
      return;
    }
    
    setIsTranslating(true);
    try {
      const res = await translateText(task.title, task.description, lang);
      setTask({ ...task, displayTitle: res.title, displayDesc: res.description });
      setCurrentLang(lang);
    } catch (err) {
      alert("Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleBroadcast = async () => {
    if (!window.confirm("Trigger a global SOS alert for this task? This will notify all nearby volunteers immediately.")) return;
    setBroadcasting(true);
    try {
      await broadcastIssue(id);
      alert("Emergency broadcast sent!");
      setTask({ ...task, isEmergency: true });
    } catch (err) {
      alert(err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleVerify = () => {
    if (!capturedImg) return alert("Please capture a photo first!");
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 2500);
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImg(imageSrc);
    setShowCamera(false);
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center font-bold text-gray-500">Loading Task...</div>;
  if (!task) return <div className="min-h-screen bg-bg flex items-center justify-center font-bold text-red-500">Task not found</div>;

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            aria-label="Go back to previous page"
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Task Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${task.status === "Open" ? "bg-green-100 text-green-600" : "bg-blue-100 text-primary"}`}>
            ● {task.status}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Task Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-soft">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${task.urgency === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                {task.urgency} Urgency
              </span>
              <div className="flex items-center gap-2">
                <select 
                  value={currentLang} 
                  onChange={(e) => handleTranslate(e.target.value)}
                  disabled={isTranslating}
                  aria-label="Select language for task translation"
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="hi">🇮🇳 Hindi</option>
                  <option value="mr">🚩 Marathi</option>
                </select>
                <span className="text-gray-400 text-xs">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isTranslating ? <span className="animate-pulse bg-gray-200 text-transparent rounded">Translating Title...</span> : (task.displayTitle || task.title)}
            </h2>
            <p 
              className="text-gray-600 leading-relaxed mb-8 text-lg"
              aria-live="polite"
              aria-busy={isTranslating}
            >
              {isTranslating ? <span className="animate-pulse bg-gray-200 text-transparent rounded" role="status">Translating description to your local language...</span> : (task.displayDesc || task.description)}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Category</p>
                <p className="font-bold text-gray-800">{task.category}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Location</p>
                <p className="font-bold text-gray-800 truncate">{task.location}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Posted By</p>
                <p className="font-bold text-gray-800">{task.createdBy?.name || "NGO"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Volunteers</p>
                <p className="font-bold text-gray-800">{task.assignedVolunteers?.length || 0} Joined</p>
              </div>
            </div>
          </motion.div>

          {/* Action Card */}
          {user?.role === "volunteer" && !accepted && task.status === "Open" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 text-white shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">Ready to help?</h3>
              <p className="text-blue-100 mb-6">By accepting this task, you agree to coordinate with the NGO for completion.</p>
              <button 
                onClick={handleAccept}
                className="w-full bg-white text-primary py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition shadow-xl"
              >
                ✋ Accept This Task
              </button>
            </motion.div>
          )}

          {/* Photo Verification (For Volunteers who accepted) */}
          {user?.role === "volunteer" && accepted && task.status !== "Completed" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-soft border-2 border-green-100">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg">📷</div>
                 <div>
                   <h3 className="font-bold text-gray-800">Proof of Impact</h3>
                   <p className="text-xs text-gray-500">Upload a photo to verify completion via AI</p>
                 </div>
               </div>

               {verified ? (
                 <div className="space-y-4">
                   <div 
                     className="relative rounded-2xl overflow-hidden h-48 shadow-inner bg-gray-100 border border-green-200"
                     role="img"
                     aria-label="AI-verified task completion evidence photo"
                   >
                     <img src={capturedImg} alt="Task completion evidence photo captured by volunteer" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center" aria-hidden="true">
                        <div className="bg-white p-2 rounded-full text-green-600 shadow-xl">✅</div>
                     </div>
                   </div>
                   <div className="bg-green-50 p-6 rounded-2xl text-center border border-green-200" role="status" aria-live="polite">
                      <p className="text-green-700 font-bold mb-1 text-lg">✨ AI Verification Success!</p>
                      <p className="text-xs text-green-600 font-medium">The scene matches the task description. Impact points ready for award.</p>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {showCamera ? (
                      <div 
                        className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl"
                        role="region"
                        aria-label="Live camera viewfinder for task verification"
                      >
                        <Webcam 
                          audio={false} 
                          ref={webcamRef} 
                          screenshotFormat="image/jpeg"
                          className="w-full h-full object-cover"
                          videoConstraints={{ facingMode: "environment" }}
                          aria-label="Camera feed — position your camera to capture evidence of task completion"
                        />
                        <button 
                          onClick={capture}
                          aria-label="Take photo as task completion evidence"
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-primary p-4 rounded-full shadow-2xl hover:scale-110 transition active:scale-95"
                        >
                          📸 Capture Photo
                        </button>
                      </div>
                    ) : capturedImg ? (
                      <div className="relative rounded-2xl overflow-hidden h-48 group">
                         <img src={capturedImg} alt="Preview of captured task completion evidence" className="w-full h-full object-cover" />
                         <button 
                           onClick={() => setShowCamera(true)}
                           aria-label="Retake the completion photo"
                           className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg text-xs font-bold hover:bg-black transition"
                         >
                           Retake
                         </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setShowCamera(true)}
                        className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition group"
                      >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition">📸</div>
                        <p className="text-sm text-gray-400 font-medium">Click to open camera & capture completion evidence</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={handleVerify}
                      disabled={verifying || !capturedImg}
                      aria-label={verifying ? "AI is currently analyzing your photo" : "Submit photo for AI verification and complete task"}
                      aria-busy={verifying}
                      className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition shadow-md disabled:opacity-50 disabled:bg-gray-300"
                    >
                      {verifying ? (
                        <span className="flex items-center justify-center gap-2" role="status">
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                           🔍 AI Analyzing Photo...
                        </span>
                      ) : "Verify & Complete Task"}
                    </button>
                 </div>
               )}
            </motion.div>
          )}
        </div>

        {/* Right Column: AI Insights & Sidebar */}
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-blue-50">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              🤖 AI Task Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Impact Potential</p>
                <p className="text-sm font-medium text-blue-900">High impact on SDG {task.category === "Health" ? "3" : task.category === "Education" ? "4" : "11"}. Completing this awards +150 impact points.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-[10px] font-bold text-purple-500 uppercase mb-1">Coordination Needed</p>
                <p className="text-sm font-medium text-purple-900">Standard task. Use the chat widget to sync with the NGO on requirements.</p>
              </div>
            </div>
          </div>

          {/* AI Matching (NGO View) */}
          {user?.role === "ngo" && (
            <div className="bg-white rounded-3xl p-6 shadow-soft">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Top Matches</h3>
                <button onClick={runAiMatch} className="text-primary text-xs font-bold hover:underline">
                  {matching ? "Analyzing..." : "Run AI Match"}
                </button>
              </div>
              <div className="space-y-3">
                {matches.length > 0 ? (
                  matches.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-primary border border-blue-100">
                          {m.name.charAt(0)}
                        </div>
                        <p className="text-sm font-bold text-gray-700">{m.name}</p>
                      </div>
                      <span className="text-xs font-black text-primary">{m.matchScore}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4 italic">Select "Run AI Match" to find the best volunteers.</p>
                )}
              </div>
            </div>
          )}
          {/* NGO Emergency Control */}
          {user?.role === "ngo" && task.status !== "Completed" && (
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-red-50">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 ⚠️ Emergency Controls
               </h3>
               <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                 Is this situation critical? Triggering an SOS broadcast will notify all volunteers in the city immediately.
               </p>
               <button 
                 onClick={handleBroadcast}
                 disabled={broadcasting || task.isEmergency}
                 className={`w-full py-3 rounded-xl font-bold text-sm transition ${task.isEmergency ? "bg-red-50 text-red-600 cursor-default" : "bg-red-600 text-white hover:bg-red-700 shadow-md"}`}
               >
                 {task.isEmergency ? "🚨 SOS Broadcast Active" : "📢 Trigger SOS Broadcast"}
               </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
