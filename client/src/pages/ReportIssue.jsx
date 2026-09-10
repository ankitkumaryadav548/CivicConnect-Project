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

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();
      
      let formattedAddress = '';
      if (data && data.address) {
        const addr = data.address;
        const placeParts = [
          addr.amenity || addr.building || addr.road || addr.suburb || addr.neighbourhood,
          addr.city || addr.town || addr.village || addr.county || addr.state_district,
          addr.state,
          addr.country
        ].filter(Boolean);

        formattedAddress = placeParts.join(', ') || data.display_name;
      } else if (data && data.display_name) {
        formattedAddress = data.display_name;
      }

      if (formattedAddress) {
        setLocation(formattedAddress);

        if (markerRef.current) {
          markerRef.current.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 2px 4px; text-align: center; max-width: 200px;">
              <div style="font-size: 10px; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">📍 Selected Location</div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.3;">${formattedAddress}</div>
            </div>
          `, { offset: [0, -14], closeButton: false }).openPopup();
        }
      }

      return formattedAddress;
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat);
          setLongitude(lng);

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16);
            markerRef.current.setLatLng([lat, lng]);
          }

          const placeName = await reverseGeocode(lat, lng);
          if (placeName) {
            toast.success(`Location detected: ${placeName.split(',').slice(0, 2).join(',')}`);
          } else {
            toast.success('GPS coordinates detected!');
          }
        },
        (error) => {
          toast.error('Could not get GPS location. Drag the pin to select manually.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 13,
        zoomControl: false
      });

      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstanceRef.current);

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      markerRef.current = L.marker([latitude, longitude], {
        icon: getReportPinIcon(),
        draggable: true
      }).addTo(mapInstanceRef.current);

      // Bind drag event
      markerRef.current.on('dragend', () => {
        const position = markerRef.current.getLatLng();
        setLatitude(position.lat);
        setLongitude(position.lng);
        reverseGeocode(position.lat, position.lng);
      });

      // Bind map click event
      mapInstanceRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        setLatitude(lat);
        setLongitude(lng);
        reverseGeocode(lat, lng);
      });

      // Try initial GPS location auto-detect
      handleLocateMe();
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
    { value: 'other', label: 'Other Concerns', icon: '🙋', color: 'border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-50' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors gap-1 uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Hub
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100/80 dark:border-slate-800/80 overflow-hidden transition-colors duration-300">
        <div className="px-6 py-8 md:p-10">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Report a Civic Issue
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold mt-1">
              Submit your observations to let community leaders and municipal officers take action.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title field */}
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Issue Title
              </label>
              <input
                type="text"
                id="title"
                required
                maxLength="100"
                className="block w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 transition-colors duration-200"
                placeholder="E.g., Severe water leakage on North Avenue Road crossing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Category visual cards selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3.5">
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
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold scale-102 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
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
                <label htmlFor="location" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Location & Landmarks
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  className="block w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 transition-colors duration-200 animate-fade-in"
                  placeholder="E.g., Near Sector 4 Bus Stand, next to Municipal School"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Map Pin-Drop Location Selection */}
              <div className="bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4.5 space-y-3.5 shadow-sm transition-colors duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      📍 Drop Pin Coordinates
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold mt-0.5">
                      Drag the purple pin or click anywhere on the map to target the exact location.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleLocateMe}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      🎯 Detect My Location
                    </button>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-extrabold rounded-lg shadow-sm">
                      LAT: {latitude.toFixed(4)}
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-extrabold rounded-lg shadow-sm">
                      LNG: {longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div 
                  ref={mapContainerRef} 
                  className="w-full h-[280px] rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-inner overflow-hidden relative z-10 bg-slate-100 dark:bg-slate-900"
                />

                {location && (
                  <div className="flex items-center gap-2 p-2.5 bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs font-semibold text-indigo-900 dark:text-indigo-200 animate-fade-in">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">📍 Detected Place Name:</span>
                    <span className="truncate">{location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description field */}
            <div>
              <label htmlFor="description" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Detailed Description
              </label>
              <textarea
                id="description"
                rows="5"
                required
                maxLength="1000"
                className="block w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 resize-none transition-colors duration-200"
                placeholder="Describe the severity, duration, and details of the civic concern to assist officers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Attach Supporting Photos (Max 3)
              </label>
              
              <div className="flex flex-wrap gap-4 items-center">
                {images.map((img, index) => (
                  <div key={index} className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group">
                    <img src={URL.createObjectURL(img)} alt={`Upload preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1.5 hover:bg-rose-600 transition-colors shadow cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {images.length < 3 && (
                  <label className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200">
                    <UploadCloud size={28} className="text-slate-400 dark:text-slate-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Upload Photo</span>
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
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
