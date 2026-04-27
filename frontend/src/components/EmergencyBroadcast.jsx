import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { getIssues } from "../api";

export default function EmergencyBroadcast() {
  const [emergency, setEmergency] = useState(null);
  const token = localStorage.getItem("sevasync_token");

  useEffect(() => {
    if (!token) return;

    const checkEmergency = async () => {
      try {
        const issues = await getIssues();
        const activeEmergency = issues.find(i => i.isEmergency && i.status !== 'Completed');
        setEmergency(activeEmergency || null);
      } catch (err) {
        console.error("SOS Check failed", err);
      }
    };

    checkEmergency();
    const interval = setInterval(checkEmergency, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (!emergency) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white p-4 shadow-2xl flex items-center justify-center gap-4 border-b-4 border-red-800"
      >
        <div className="animate-ping w-3 h-3 bg-white rounded-full"></div>
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
          <p className="font-black tracking-tighter text-lg uppercase flex items-center gap-2">
            🚨 CRITICAL SOS: {emergency.title}
          </p>
          <div className="flex items-center gap-3">
             <span className="text-xs bg-red-800 px-2 py-1 rounded font-bold">{emergency.location}</span>
             <Link 
               to={`/task/${emergency._id}`}
               className="bg-white text-red-600 px-4 py-1 rounded-full font-bold text-sm hover:bg-gray-100 transition shadow-lg"
             >
               Respond Now
             </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
