import { motion } from "framer-motion";

const CATEGORY_COLORS = {
  "Health":         { bar: "from-red-400 to-red-600",     bg: "bg-red-50",     text: "text-red-600",    icon: "🏥" },
  "Education":      { bar: "from-blue-400 to-blue-600",   bg: "bg-blue-50",    text: "text-primary",    icon: "📚" },
  "Environment":    { bar: "from-green-400 to-green-600", bg: "bg-green-50",   text: "text-green-600",  icon: "🌱" },
  "Food Relief":    { bar: "from-amber-400 to-amber-600", bg: "bg-amber-50",   text: "text-amber-600",  icon: "🍲" },
  "Infrastructure": { bar: "from-purple-400 to-purple-600", bg: "bg-purple-50", text: "text-purple-600", icon: "🏗️" },
};

const SDG_MAPPING = {
  "Health": "SDG 3",
  "Education": "SDG 4",
  "Environment": "SDG 13",
  "Food Relief": "SDG 2",
  "Infrastructure": "SDG 11",
};

export default function ImpactChart({ categories = [], title = "SDG Impact Breakdown" }) {
  const total = categories.reduce((sum, c) => sum + (c.count || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{total} Total Issues</span>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No issues tracked yet.</div>
      ) : (
        categories.map((cat, i) => {
          const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
          const colors = CATEGORY_COLORS[cat.name] || CATEGORY_COLORS["Environment"];
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{colors.icon}</span>
                  <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                    {SDG_MAPPING[cat.name] || "SDG"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-700">{cat.count}</span>
                  <span className="text-xs text-gray-400">({pct}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className={`h-2.5 rounded-full bg-gradient-to-r ${colors.bar}`}
                />
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
