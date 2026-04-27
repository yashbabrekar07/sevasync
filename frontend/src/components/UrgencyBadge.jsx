export default function UrgencyBadge({ urgency }) {
  let bg = "#e0e0e0";
  let color = "#333";
  
  if (urgency === "High") {
    bg = "#ffebee";
    color = "#c62828";
  } else if (urgency === "Medium") {
    bg = "#fff8e1";
    color = "#f57f17";
  } else if (urgency === "Low") {
    bg = "#e8f5e9";
    color = "#2e7d32";
  }

  return (
    <span style={{
      padding: "4px 8px",
      borderRadius: "12px",
      backgroundColor: bg,
      color: color,
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block"
    }}>
      {urgency}
    </span>
  );
}
