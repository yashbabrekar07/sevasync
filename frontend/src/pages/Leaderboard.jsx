import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getLeaderboard } from "../api";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setVolunteers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const topThree = volunteers.slice(0, 3);
  const others = volunteers.slice(3);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center font-bold text-gray-500">Calculating Rankings...</div>;

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🏆 Community Heroes</h1>
            <p className="text-sm text-gray-500">The top impact makers in your region</p>
          </div>
        </div>
        <Link to="/" className="text-primary font-medium hover:underline text-sm">Home</Link>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-12">
        
        {/* Podium for Top 3 */}
        <div className="flex justify-center items-end gap-4 md:gap-12 pt-12">
          {/* Silver */}
          {topThree[1] && (
            <PodiumItem 
              rank={2} 
              user={topThree[1]} 
              height="h-40" 
              color="from-gray-300 to-gray-500" 
              delay={0.2}
            />
          )}
          {/* Gold */}
          {topThree[0] && (
            <PodiumItem 
              rank={1} 
              user={topThree[0]} 
              height="h-56" 
              color="from-yellow-300 to-yellow-600" 
              delay={0}
            />
          )}
          {/* Bronze */}
          {topThree[2] && (
            <PodiumItem 
              rank={3} 
              user={topThree[2]} 
              height="h-32" 
              color="from-orange-300 to-orange-600" 
              delay={0.4}
            />
          )}
        </div>

        {/* List for Others */}
        <div className="bg-white rounded-[2.5rem] shadow-soft overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Global Ranking</h3>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Impact Score</span>
          </div>
          <div className="divide-y divide-gray-50">
            {others.map((vol, i) => (
              <motion.div 
                key={vol._id} 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i * 0.05) }}
                className="p-5 flex items-center justify-between hover:bg-blue-50/30 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-400 w-6">#{i + 4}</span>
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {vol.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{vol.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{vol.tasksCompleted || 0} Tasks Done</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-primary text-lg">{vol.impactScore}</span>
                  <p className="text-[10px] text-gray-400 font-bold">PTS</p>
                </div>
              </motion.div>
            ))}
            {volunteers.length === 0 && (
              <div className="p-12 text-center text-gray-400">No volunteers ranked yet. Start helping to appear here!</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PodiumItem({ rank, user, height, color, delay }) {
  const icon = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay, duration: 0.8, type: "spring" }}
      className="flex flex-col items-center gap-4 w-24 md:w-32"
    >
      <div className="relative">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-xl border-4 border-white relative z-10">
          {user.name.charAt(0)}
        </div>
        <div className="absolute -top-4 -right-4 text-3xl z-20 animate-bounce">{icon}</div>
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-800 text-sm truncate w-full">{user.name}</p>
        <p className="text-xs text-primary font-black uppercase tracking-tighter">{user.impactScore} PTS</p>
      </div>
      <div className={`w-full ${height} bg-gradient-to-t ${color} rounded-t-3xl shadow-2xl flex items-center justify-center text-white font-black text-4xl opacity-90`}>
        {rank}
      </div>
    </motion.div>
  );
}
