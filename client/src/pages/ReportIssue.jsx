import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';
import { UploadCloud, X, ArrowLeft, Landmark, Droplets, Zap, Trash2, HelpCircle } from 'lucide-react';
import L from 'leaflet';

const getReportPinIcon = () => {
  const html = `
    <div style="
      background-color: #6366f1;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(99, 102, 241, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      transition: all 0.2s ease;
    " class="hover:scale-110 active:cursor-grabbing">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-report-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const ReportIssue = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('road');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center in San Francisco
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 13,
        zoomControl: false
      });

      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstanceRef.current);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      markerRef.current = L.marker([37.7749, -122.4194], {
        icon: getReportPinIcon(),
        draggable: true
      }).addTo(mapInstanceRef.current);

      // Bind drag event
      markerRef.current.on('dragend', () => {
        const position = markerRef.current.getLatLng();
        setLatitude(position.lat);
        setLongitude(position.lng);
      });

      // Bind map click event
      mapInstanceRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        setLatitude(lat);
        setLongitude(lng);
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      toast.error('You can only upload up to 3 images');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('location', location);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      await axiosInstance.post('/issues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Issue reported successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  // Interactive Card Options
  const categoriesList = [
    { value: 'road', label: 'Roads & Streets', icon: '🛣️', color: 'border-violet-200 text-violet-700 bg-violet-50/50 hover:bg-violet-50' },
    { value: 'water', label: 'Water & Supply', icon: '💧', color: 'border-teal-200 text-teal-700 bg-teal-50/50 hover:bg-teal-50' },
    { value: 'electricity', label: 'Electricity', icon: '⚡', color: 'border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-50' },
    { value: 'sanitation', label: 'Sanitation', icon: '🧹', color: 'border-orange-200 text-orange-700 bg-orange-50/50 hover:bg-orange-50' },
    { value: 'other', label: 'Other Concerns', icon: '🙋', color: 'border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-50' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 mb-6 transition-colors gap-1 uppercase tracking-wider"
      >
        <ArrowLeft size={14} /> Back to Hub
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden">
        <div className="px-6 py-8 md:p-10">
          <div className="border-b border-slate-100 pb-5 mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Report a Civic Issue
            </h2>
            <p className="text-slate-400 text-sm font-semibold mt-1">
              Submit your observations to let community leaders and municipal officers take action.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title field */}
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Issue Title
              </label>
              <input
                type="text"
                id="title"
                required
                maxLength="100"
                className="block w-full px-4 py-3 bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl sm:text-sm placeholder-slate-400 focus:bg-white"
                placeholder="E.g., Severe water leakage on North Avenue Road crossing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Category visual cards selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
                Select Infrastructure Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {categoriesList.map((item) => {
                  const isSelected = category === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer text-center transition-all duration-200 ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-700 font-bold scale-102 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <span className="text-2xl mb-2">{item.icon}</span>
                      <span className="text-xs tracking-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location field */}
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Location & Landmarks
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  className="block w-full px-4 py-3 bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl sm:text-sm placeholder-slate-400 focus:bg-white animate-fade-in"
                  placeholder="E.g., Near Sector 4 Bus Stand, next to Municipal School"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Map Pin-Drop Location Selection */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      📍 Drop Pin Coordinates
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      Drag the purple pin or click anywhere on the map to target the exact location.
                    </p>
                  </div>
                  <div className="flex gap-2 text-[10px] font-mono font-extrabold self-end sm:self-auto">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm">
                      LAT: {latitude.toFixed(6)}
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm">
                      LNG: {longitude.toFixed(6)}
                    </span>
                  </div>
                </div>

                <div 
                  ref={mapContainerRef} 
                  className="w-full h-[280px] rounded-xl border border-slate-200/80 shadow-inner overflow-hidden relative z-10 bg-slate-100"
                />
              </div>
            </div>

            {/* Description field */}
            <div>
              <label htmlFor="description" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Detailed Description
              </label>
              <textarea
                id="description"
                rows="5"
                required
                maxLength="1000"
                className="block w-full px-4 py-3 bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl sm:text-sm placeholder-slate-400 focus:bg-white resize-none"
                placeholder="Describe the severity, duration, and details of the civic concern to assist officers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Attach Supporting Photos (Max 3)
              </label>
              
              <div className="flex flex-wrap gap-4 items-center">
                {images.map((img, index) => (
                  <div key={index} className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={URL.createObjectURL(img)} alt={`Upload preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1.5 hover:bg-rose-600 transition-colors shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {images.length < 3 && (
                  <label className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-indigo-50/20 hover:border-indigo-400 transition-all duration-200">
                    <UploadCloud size={28} className="text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Upload Photo</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Actions Form Footer */}
            <div className="pt-6 border-t border-slate-100 flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Discard Report
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2.5 border border-transparent rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting Report...' : 'Publish Community Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
