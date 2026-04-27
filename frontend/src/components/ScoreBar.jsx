export default function ScoreBar({ label, value, weight }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", color: "#555" }}>
        <span>{label} (Weight: {weight})</span>
        <span style={{ fontWeight: "600" }}>{value}</span>
      </div>
      <div style={{ height: "6px", background: "#f0f0f0", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(value / parseInt(weight)) * 100}%`, background: "#667eea", borderRadius: "3px", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}
