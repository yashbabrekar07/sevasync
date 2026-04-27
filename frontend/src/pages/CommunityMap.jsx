import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { getCommunityStats, getIssues } from "../api";

// Urgency icons
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const icons = { High: createIcon("red"), Medium: createIcon("yellow"), Low: createIcon("green") };

const CATEGORY_COLORS = {
  "Health": "#ef4444", "Education": "#3b82f6",
  "Environment": "#22c55e", "Food Relief": "#f59e0b", "Infrastructure": "#8b5cf6"
};

function LocationUpdater({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 14, { animate: true, duration: 1.5 });
    }
  }, [location, map]);
  return null;
}

export default function CommunityMap() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [userLocation, setUserLocation] = useState([20.5937, 78.9629]); // India center default

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
    const load = async () => {
      try {
        const [issuesData, statsData] = await Promise.all([getIssues(), getCommunityStats()]);
        setIssues(issuesData);
        setStats(statsData);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = filter === "All" ? issues : issues.filter(i => i.urgency === filter || i.category === filter);

  const user = JSON.parse(localStorage.getItem("sevasync_user")) || {};

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🗺️ Community Needs Heatmap</h1>
          <p className="text-sm text-gray-500">Live view of all active community issues</p>
        </div>
        <Link to={user.role === "ngo" ? "/ngo-dashboard" : "/volunteer-dashboard"} className="text-primary font-medium hover:underline text-sm">← Dashboard</Link>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 gap-0">
        {/* Sidebar */}
        <div className="lg:w-80 bg-white border-r border-gray-100 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 70px)" }}>
          {/* Stats */}
          {stats && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Community Overview</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.byUrgency?.High || 0}</p>
                  <p className="text-xs text-gray-500">High</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.byStatus?.Completed || 0}</p>
                  <p className="text-xs text-gray-500">Done</p>
                </div>
              </div>

              {/* Category breakdown */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">By Category</h4>
                {Object.entries(stats.byCategory || {}).map(([cat, count]) => (
                  <div key={cat} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${(count / stats.total) * 100}%`, backgroundColor: CATEGORY_COLORS[cat] || "#6b7280" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter Map</h4>
            <div className="flex flex-wrap gap-2">
              {["All", "High", "Medium", "Low", "Health", "Education", "Environment", "Food Relief", "Infrastructure"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Issue List */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Issues ({filtered.length})</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filtered.map(issue => (
                <div key={issue._id} className="p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition cursor-pointer">
                  <p className="font-semibold text-gray-800 text-xs truncate">{issue.title}</p>
                  <div className="flex gap-1 mt-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${issue.urgency === "High" ? "bg-red-100 text-red-600" : issue.urgency === "Medium" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>{issue.urgency}</span>
                    <span className="text-[10px] text-gray-500">{issue.location}</span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No issues match this filter</p>}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Legend</h4>
            {[["🔴", "High Urgency"], ["🟡", "Medium Urgency"], ["🟢", "Low Urgency"]].map(([icon, label]) => (
              <p key={label} className="text-xs text-gray-600 mb-1">{icon} {label}</p>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative z-0" style={{ minHeight: "500px" }}>
          {loading ? (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Loading community data...</p>
              </div>
            </div>
          ) : (
            <MapContainer center={userLocation} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={['mt0','mt1','mt2','mt3']}
                attribution="&copy; Google Maps"
              />
              <LocationUpdater location={userLocation} />
              {/* User location pulse */}
              <Circle center={userLocation} radius={500} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15 }} />

              {filtered.map(issue => (
                <Marker key={issue._id} position={[issue.lat || userLocation[0], issue.lng || userLocation[1]]} icon={icons[issue.urgency] || icons["Low"]}>
                  <Popup>
                    <div className="p-1 min-w-[180px]">
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{issue.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">📍 {issue.location}</p>
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${issue.urgency === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>{issue.urgency}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{issue.category}</span>
                      </div>
                      <p className={`text-[10px] mt-2 font-bold ${issue.status === "Open" ? "text-primary" : "text-green-600"}`}>● {issue.status}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
