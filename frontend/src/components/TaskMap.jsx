import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix Leaflet's default icon issue with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored icons for urgency
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const redIcon = createIcon('red');
const yellowIcon = createIcon('yellow');
const greenIcon = createIcon('green');

function LocationUpdater({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 14, { animate: true, duration: 1.5 });
    }
  }, [location, map]);
  return null;
}

export default function TaskMap({ tasks, onAccept, userLocation }) {
  // Default center (San Francisco / dummy location) or User's actual location
  const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [37.7749, -122.4194];

  const getMarkerIcon = (urgency) => {
    if (urgency === 'High') return redIcon;
    if (urgency === 'Medium') return yellowIcon;
    return greenIcon;
  };

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-soft border border-gray-100 relative z-0">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0','mt1','mt2','mt3']}
          attribution="&copy; Google Maps"
        />
        <LocationUpdater location={defaultCenter} />
        
        {tasks.map(task => (
          <Marker 
            key={task.id} 
            position={[task.lat, task.lng]}
            icon={getMarkerIcon(task.urgency)}
          >
            <Popup className="rounded-2xl">
              <div className="p-1">
                <h3 className="font-bold text-gray-800 text-sm mb-1">{task.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{task.location}</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    task.urgency === 'High' ? 'bg-red-100 text-red-600' :
                    task.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {task.urgency}
                  </span>
                  <button 
                    onClick={() => onAccept(task.id)}
                    className="bg-primary text-white text-[10px] px-2 py-1 rounded shadow-sm hover:bg-blue-600 transition"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
