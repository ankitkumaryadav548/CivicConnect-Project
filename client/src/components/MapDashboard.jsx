import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

const getCategoryMarkerIcon = (category) => {
  let color = '#4f46e5'; // default indigo
  let svgInner = '';

  switch (category?.toLowerCase()) {
    case 'road':
      color = '#8b5cf6'; // violet
      svgInner = `<path d="M12 2v20M9 6h6M8 12h8M9 18h6" stroke="white" stroke-width="2.5" stroke-linecap="round" />`;
      break;
    case 'water':
      color = '#14b8a6'; // teal
      svgInner = `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="white" stroke="white" stroke-width="1" />`;
      break;
    case 'electricity':
      color = '#f59e0b'; // amber
      svgInner = `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" stroke="white" stroke-width="1" />`;
      break;
    case 'sanitation':
      color = '#f97316'; // orange
      svgInner = `<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="white" stroke-width="2.5" stroke-linecap="round" />`;
      break;
    default:
      color = '#64748b'; // slate
      svgInner = `<circle cx="12" cy="12" r="5" fill="white" stroke="white" stroke-width="1" />`;
  }

  const html = `
    <div style="
      background-color: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 4px ${color}25;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    " class="marker-hover-glow hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="color: ${category === 'water' || category === 'electricity' ? color : 'white'};">
        ${svgInner}
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return `<span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Open</span>`;
    case 'in_progress':
      return `<span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase;">In Progress</span>`;
    case 'resolved':
      return `<span style="background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Resolved</span>`;
    default:
      return `<span style="background-color: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Closed</span>`;
  }
};

const MapDashboard = ({ issues = [] }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map Instance
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 13,
        zoomControl: false // We will place a clean custom zoom control
      });

      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstanceRef.current);

      // Voyager map tiles look gorgeous and modern
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      markersGroupRef.current = L.featureGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear previous markers
    markersGroup.clearLayers();

    // Map through issues and add markers
    const validIssues = issues.filter(issue => issue.latitude && issue.longitude);

    validIssues.forEach((issue) => {
      const marker = L.marker([issue.latitude, issue.longitude], {
        icon: getCategoryMarkerIcon(issue.category)
      });

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; width: 220px; padding: 6px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.05em;">
              ${issue.category}
            </span>
            ${getStatusBadge(issue.status)}
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.3;">
            ${issue.title}
          </h4>
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #475569; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
            ${issue.description}
          </p>
          <div style="display: flex; align-items: center; justify-content: space-between; border-t: 1px solid #f1f5f9; pt: 8px; margin-top: 8px;">
            <span style="font-size: 10px; font-weight: 700; color: #64748b;">
              🔥 ${issue.upvotes?.length || 0} Upvotes
            </span>
            <button
              id="view-detail-btn-${issue._id}"
              style="
                background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                color: white;
                border: none;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(99, 102, 241, 0.15);
                transition: all 0.2s ease;
              "
              onmouseover="this.style.transform='translateY(-0.5px)'; this.style.boxShadow='0 4px 6px rgba(99, 102, 241, 0.25)';"
              onmouseout="this.style.transform='none'; this.style.boxShadow='0 2px 4px rgba(99, 102, 241, 0.15)';"
            >
              Inspect
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 260,
        className: 'custom-leaflet-popup'
      });

      // Handle popup open listener to bind details click router
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-detail-btn-${issue._id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            navigate(`/issues/${issue._id}`);
          });
        }
      });

      markersGroup.addLayer(marker);
    });

    // Auto fit map bounds if we have markers
    if (validIssues.length > 0) {
      map.fitBounds(markersGroup.getBounds(), {
        padding: [40, 40],
        maxZoom: 15
      });
    }

  }, [issues, navigate]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-[550px] rounded-3xl shadow-inner border border-slate-100 overflow-hidden relative z-10 bg-slate-50"
    />
  );
};

export default MapDashboard;
