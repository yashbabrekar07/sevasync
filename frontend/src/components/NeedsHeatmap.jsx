import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";

// Auto-fit map to bounds
function FitBounds({ issues, center }) {
  const map = useMap();
  useEffect(() => {
    if (issues.length > 0) {
      const bounds = issues.map(i => [i.lat || center[0], i.lng || center[1]]);
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [issues, map, center]);
  return null;
}

const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const ICONS = { High: createIcon("red"), Medium: createIcon("yellow"), Low: createIcon("green") };

export default function NeedsHeatmap({ issues = [], center = [20.5937, 78.9629], height = "420px", showLabels = true }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-soft border border-gray-100">
      {showLabels && (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {[["🔴","High"],["🟡","Medium"],["🟢","Low"]].map(([icon, label]) => (
            <div key={label} className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-700 shadow flex items-center gap-1.5">
              {icon} {label} Urgency
            </div>
          ))}
        </div>
      )}

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg max-w-[220px] border border-gray-100"
        >
          <button onClick={() => setSelected(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
          <h4 className="font-bold text-gray-800 text-sm pr-4">{selected.title}</h4>
          <p className="text-xs text-gray-500 mt-1">📍 {selected.location}</p>
          <div className="flex gap-1.5 mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.urgency === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
              {selected.urgency}
            </span>
            <span className="text-[10px] bg-blue-50 text-primary font-bold px-2 py-0.5 rounded-full">{selected.category}</span>
          </div>
        </motion.div>
      )}

      <MapContainer center={center} zoom={12} style={{ height, width: "100%" }} zoomControl={false}>
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0','mt1','mt2','mt3']}
          attribution="&copy; Google Maps"
        />
        <FitBounds issues={issues} center={center} />

        {/* User location indicator */}
        <Circle
          center={center}
          radius={600}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.1, weight: 1 }}
        />

        {issues.map((issue) => (
          <Marker
            key={issue._id || issue.id}
            position={[issue.lat || center[0], issue.lng || center[1]]}
            icon={ICONS[issue.urgency] || ICONS["Low"]}
            eventHandlers={{ click: () => setSelected(issue) }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <h4 className="font-bold text-sm text-gray-800 mb-1">{issue.title}</h4>
                <p className="text-xs text-gray-500">📍 {issue.location}</p>
                <div className="flex gap-1 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${issue.urgency === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                    {issue.urgency}
                  </span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{issue.category}</span>
                </div>
                <p className={`text-[10px] font-bold mt-2 ${issue.status === "Open" ? "text-green-600" : "text-blue-600"}`}>● {issue.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {issues.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow text-gray-500 text-sm font-bold">
            No active issues to display
          </div>
        </div>
      )}
    </div>
  );
}
