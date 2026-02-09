import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Issue, LatLng } from '../types';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default icon issue in React
// Use CDN URLs instead of direct imports to avoid module loading errors in browser environment
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom markers based on status
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const icons = {
  'New': createCustomIcon('#DC3545'),
  'In Progress': createCustomIcon('#FFC107'),
  'Resolved': createCustomIcon('#28A745'),
  'Disputed': createCustomIcon('#991B1B'),
};

interface MapComponentProps {
  center: LatLng;
  zoom: number;
  issues: Issue[];
  selectedIssueId?: string;
  onSelectIssue?: (id: string) => void;
}

const RecenterMap: React.FC<{center: LatLng, zoom: number}> = ({center, zoom}) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, {
            duration: 1.5,
            easeLinearity: 0.25
        });
    }, [center, zoom, map]);
    return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom, issues, selectedIssueId, onSelectIssue }) => {
  const navigate = useNavigate();
  const markerRefs = useRef<{[key: string]: L.Marker | null}>({});

  // Programmatically open popup when selectedIssueId changes
  useEffect(() => {
    if (selectedIssueId && markerRefs.current[selectedIssueId]) {
      markerRefs.current[selectedIssueId]?.openPopup();
    }
  }, [selectedIssueId]);

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full z-0">
      <RecenterMap center={center} zoom={zoom} />
      {/* Colorful Voyager Tiles for the "Public Service" Theme */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {issues.map((issue) => (
        <Marker
          key={issue.id}
          position={issue.coordinates}
          icon={icons[issue.status as keyof typeof icons] || icons['New']}
          ref={(ref) => {
            if (ref) {
              markerRefs.current[issue.id] = ref;
            }
          }}
          eventHandlers={{
            click: () => onSelectIssue && onSelectIssue(issue.id),
          }}
        >
          <Popup className="leaflet-popup-light">
             <div className="text-primary min-w-[200px]">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-primary text-base">{issue.type}</h3>
                    <StatusBadge status={issue.status} />
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">{issue.locationName}</p>
                <img src={issue.imageUrl} alt={issue.type} className="w-full h-24 object-cover rounded mb-3 border border-gray-200 shadow-sm"/>
                <button 
                    onClick={() => navigate(`/complaint/${issue.id}`)}
                    className="w-full bg-primary hover:bg-blue-800 text-white text-xs font-bold py-2 rounded transition shadow-sm"
                >
                    VIEW FULL DETAILS
                </button>
             </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;