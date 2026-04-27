import { motion } from "framer-motion";

const SKILL_THEMES = {
  "First Aid":               { color: "bg-red-100 text-red-700 border-red-200",     icon: "🩺" },
  "Medical Knowledge":       { color: "bg-red-50 text-red-600 border-red-100",      icon: "💊" },
  "CPR":                     { color: "bg-pink-100 text-pink-700 border-pink-200",  icon: "❤️" },
  "Teaching":                { color: "bg-blue-100 text-blue-700 border-blue-200",  icon: "📖" },
  "Communication":           { color: "bg-sky-100 text-sky-700 border-sky-200",     icon: "💬" },
  "Patience":                { color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: "🧘" },
  "Physical Fitness":        { color: "bg-green-100 text-green-700 border-green-200", icon: "💪" },
  "Environmental Awareness": { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "🌿" },
  "Logistics":               { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "📦" },
  "Food Handling":           { color: "bg-amber-100 text-amber-700 border-amber-200", icon: "🍱" },
  "Distribution":            { color: "bg-orange-100 text-orange-700 border-orange-200", icon: "🚚" },
  "Construction":            { color: "bg-stone-100 text-stone-700 border-stone-200",  icon: "🔧" },
  "Technical Skills":        { color: "bg-purple-100 text-purple-700 border-purple-200", icon: "⚙️" },
  "Heavy Lifting":           { color: "bg-gray-200 text-gray-700 border-gray-300",    icon: "🏋️" },
};

export default function SkillBadge({ skill, size = "md", animate = true }) {
  const theme = SKILL_THEMES[skill] || { color: "bg-blue-50 text-primary border-blue-100", icon: "✦" };
  const sizeClasses = size === "sm"
    ? "text-[10px] px-2 py-0.5 gap-1"
    : "text-xs px-3 py-1.5 gap-1.5";

  const Wrapper = animate ? motion.span : "span";
  const props = animate ? { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } } : {};

  return (
    <Wrapper
      {...props}
      className={`inline-flex items-center border font-bold rounded-full cursor-default select-none transition ${theme.color} ${sizeClasses}`}
    >
      <span>{theme.icon}</span>
      <span>{skill}</span>
    </Wrapper>
  );
}
