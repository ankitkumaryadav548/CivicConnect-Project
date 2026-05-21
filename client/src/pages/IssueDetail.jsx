import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { MapPin, Clock, ThumbsUp, Trash2, ArrowLeft, Send, MessageSquare, Navigation, Copy, RotateCcw, Layers, Lock, Wrench, CheckCircle } from 'lucide-react';
import { StatusBadge, CategoryBadge } from '../components/Badges';
import toast from 'react-hot-toast';
import { IssueCardSkeleton } from '../components/Skeleton';
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
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="color: ${category === 'water' || category === 'electricity' ? color : 'white'};">
        ${svgInner}
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [tileMode, setTileMode] = useState('street'); // 'street' or 'satellite'
  const [mapCoords, setMapCoords] = useState(null); // { lat, lng, isGeocoded }
  const [savingCoords, setSavingCoords] = useState(false);
  const miniMapContainerRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Dynamic Geocoding and Coordinate Resolver
  useEffect(() => {
    if (!issue) return;

    if (issue.latitude && issue.longitude) {
      setMapCoords({ lat: issue.latitude, lng: issue.longitude, isGeocoded: false });
    } else if (issue.location) {
      // Attempt dynamic geocoding for issues with only text location (e.g. legacy/Jalandhar)
      const triggerGeocode = async () => {
        try {
          // OpenStreetMap Nominatim Free Public Search API
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(issue.location)}&limit=1`);
          const data = await response.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setMapCoords({ lat, lng, isGeocoded: true });
          } else {
            setMapCoords(null);
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          setMapCoords(null);
        }
      };
      triggerGeocode();
    } else {
      setMapCoords(null);
    }
  }, [issue]);

  // Leaflet Mini Map Mounting & Coordination Updates
  useEffect(() => {
    if (!mapCoords || !miniMapContainerRef.current) return;

    // Clean previous instance on coordinates swap
    if (miniMapInstanceRef.current) {
      miniMapInstanceRef.current.remove();
      miniMapInstanceRef.current = null;
    }

    miniMapInstanceRef.current = L.map(miniMapContainerRef.current, {
      center: [mapCoords.lat, mapCoords.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(miniMapInstanceRef.current);

    L.marker([mapCoords.lat, mapCoords.lng], {
      icon: getCategoryMarkerIcon(issue.category)
    }).addTo(miniMapInstanceRef.current);
  }, [mapCoords]);

  useEffect(() => {
    if (!miniMapInstanceRef.current || !tileLayerRef.current) return;

    miniMapInstanceRef.current.removeLayer(tileLayerRef.current);

    if (tileMode === 'street') {
      tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      });
    } else {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
      });
    }

    tileLayerRef.current.addTo(miniMapInstanceRef.current);
  }, [tileMode]);

  useEffect(() => {
    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (miniMapInstanceRef.current && mapCoords) {
      miniMapInstanceRef.current.setView([mapCoords.lat, mapCoords.lng], 14, {
        animate: true,
        duration: 0.8
      });
    }
  };

  const handleGetDirections = () => {
    if (mapCoords) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${mapCoords.lat},${mapCoords.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyCoords = () => {
    if (mapCoords) {
      navigator.clipboard.writeText(`${mapCoords.lat.toFixed(6)}, ${mapCoords.lng.toFixed(6)}`);
      toast.success('Coordinates copied to clipboard!');
    }
  };

  const handleSaveCoords = async () => {
    if (!mapCoords) return;
    setSavingCoords(true);
    try {
      await axiosInstance.put(`/issues/${id}`, {
        latitude: mapCoords.lat,
        longitude: mapCoords.lng
      });
      toast.success('Precise coordinates saved to database!');
      setIssue({ ...issue, latitude: mapCoords.lat, longitude: mapCoords.lng });
      setMapCoords({ ...mapCoords, isGeocoded: false });
    } catch (error) {
      toast.error('Failed to save coordinates to database');
    } finally {
      setSavingCoords(false);
    }
  };

  useEffect(() => {
    fetchIssueAndComments();
  }, [id]);

  const fetchIssueAndComments = async () => {
    setLoading(true);
    try {
      const [issueRes, commentsRes] = await Promise.all([
        axiosInstance.get(`/issues/${id}`),
        axiosInstance.get(`/issues/${id}/comments`)
      ]);
      setIssue(issueRes.data.data);
      setComments(commentsRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please login to upvote');
      navigate('/login');
      return;
    }
    
    try {
      const res = await axiosInstance.patch(`/issues/${id}/upvote`);
      setIssue({ ...issue, upvotes: res.data.data });
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!user) {
      toast.error('Please login to comment');
      navigate('/login');
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await axiosInstance.post(`/issues/${id}/comments`, { text: newComment });
      setComments([res.data.data, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await axiosInstance.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm('Are you sure you want to delete this entire issue?')) return;
    
    try {
      await axiosInstance.delete(`/issues/${id}`);
      toast.success('Issue deleted');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const comment = window.prompt(`Enter optional resolution notes/comments for status "${newStatus.replace('_', ' ')}":`);
      
      const res = await axiosInstance.patch(`/issues/${id}/status`, { 
        status: newStatus,
        comment: comment || undefined
      });
      setIssue(res.data.data);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto py-12 px-4"><IssueCardSkeleton /></div>;
  if (!issue) return <div className="text-center py-20">Issue not found</div>;

  const hasUpvoted = user && issue.upvotes.some(u => u._id === user._id || u === user._id);
  const isOwnerOrAdmin = user && (issue.reportedBy._id === user._id || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 mb-6 transition-colors gap-1 uppercase tracking-wider"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Main Issue Card Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden mb-8">
        <div className="p-6 md:p-10">
          {/* Header Metadata */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <CategoryBadge category={issue.category} />
                <StatusBadge status={issue.status} />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                {issue.title}
              </h1>
            </div>
            
            {/* Municipal Admin controls */}
            {isAdmin && (
              <div className="flex-shrink-0 flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 p-2 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-2">Update Status</span>
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="block min-w-[130px] pl-3 pr-8 py-1.5 text-xs font-bold border-slate-200 bg-white text-slate-700 rounded-xl cursor-pointer border"
                >
                  <option value="open">🔓 Open</option>
                  <option value="in_progress">⚙️ In Progress</option>
                  <option value="resolved">✅ Resolved</option>
                  <option value="closed">🔒 Closed</option>
                </select>
              </div>
            )}
          </div>

          {/* User reported statistics */}
          <div className="flex flex-wrap gap-y-2 gap-x-5 text-xs text-slate-400 font-semibold mb-8">
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-indigo-500" /> {issue.location}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 self-center"></span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-slate-400" /> Reported {new Date(issue.createdAt).toLocaleDateString()}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 self-center"></span>
            <span>By <strong className="text-slate-600">{issue.reportedBy.name}</strong></span>
          </div>

          {/* Two-Column Grid for Details + Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left 2 Cols: Main details & photos */}
            <div className="lg:col-span-2 space-y-6">
              <div className="prose max-w-none text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </div>

              {issue.images && issue.images.length > 0 && (
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Supporting Visual Evidence</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {issue.images.map((img, i) => (
                      <a 
                        key={i} 
                        href={img} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block rounded-xl overflow-hidden border border-slate-200/60 aspect-video shadow-sm transition-transform duration-300 hover:scale-102 hover:shadow-md bg-white animate-fade-in"
                      >
                        <img src={img} alt={`Issue ${i}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Progress Timeline */}
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  ⏱️ Resolution Progress Timeline
                </h3>
                
                <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6">
                  {/* Step 1: Issue Reported */}
                  <div className="relative animate-fade-in">
                    <div className="absolute -left-[31px] top-0.5 bg-blue-500 text-white rounded-full p-1.5 shadow-md flex items-center justify-center">
                      <Clock size={12} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Issue Reported</h4>
                      <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                        {new Date(issue.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                      <p className="text-slate-600 text-xs mt-1.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        Reported by <strong className="text-slate-700">{issue.reportedBy.name}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Status Updates */}
                  {issue.history && issue.history.map((hist, index) => {
                    let iconBg = 'bg-blue-500';
                    let statusLabel = hist.status.replace('_', ' ');
                    let IconComponent = Clock;

                    if (hist.status === 'in_progress') {
                      iconBg = 'bg-amber-500';
                      IconComponent = Wrench;
                    } else if (hist.status === 'resolved') {
                      iconBg = 'bg-emerald-500';
                      IconComponent = CheckCircle;
                    } else if (hist.status === 'closed') {
                      iconBg = 'bg-rose-500';
                      IconComponent = Lock;
                    }

                    return (
                      <div key={hist._id || index} className="relative animate-fade-in">
                        <div className={`absolute -left-[31px] top-0.5 ${iconBg} text-white rounded-full p-1.5 shadow-md flex items-center justify-center`}>
                          <IconComponent size={12} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                            {statusLabel}
                          </h4>
                          <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                            {new Date(hist.changedAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })} by <strong className="text-slate-500">{hist.changedBy?.name || 'Municipal Officer'}</strong> ({hist.changedBy?.role || 'Officer'})
                          </p>
                          <p className="text-slate-600 text-xs mt-1.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-sm font-medium italic">
                            "{hist.comment}"
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Mini Map & Location sidebar card */}
            <div className="lg:col-span-1">
              {mapCoords ? (
                <div className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4.5 space-y-4 shadow-sm h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        📍 {mapCoords.isGeocoded ? 'Estimated Location' : 'Precise Location'}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        {mapCoords.isGeocoded 
                          ? 'Auto-geocoded address lookup. Pin is not saved yet.' 
                          : 'Mapped location of the reported concern.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative w-full h-[200px] lg:flex-grow min-h-[220px] rounded-xl border border-slate-200 shadow-inner overflow-hidden bg-slate-100">
                    <div 
                      ref={miniMapContainerRef} 
                      className="w-full h-full relative z-10"
                    />
                    
                    {/* Layer & Control overlay buttons */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5">
                      {/* Satellite / Street Layer Toggler */}
                      <button
                        type="button"
                        onClick={() => setTileMode(tileMode === 'street' ? 'satellite' : 'street')}
                        className="p-2 bg-white/95 backdrop-blur shadow-md hover:bg-white text-slate-600 hover:text-indigo-600 rounded-lg transition-all border border-slate-200/50 cursor-pointer active:scale-95"
                        title={tileMode === 'street' ? "Switch to Satellite Imagery" : "Switch to Street Map"}
                      >
                        <Layers size={13} className={tileMode === 'satellite' ? "text-indigo-600 fill-indigo-50" : ""} />
                      </button>

                      {/* Recenter Map Button */}
                      <button
                        type="button"
                        onClick={handleRecenter}
                        className="p-2 bg-white/95 backdrop-blur shadow-md hover:bg-white text-slate-600 hover:text-indigo-600 rounded-lg transition-all border border-slate-200/50 cursor-pointer active:scale-95"
                        title="Re-center on pin"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Coordinates view & copy button */}
                  <div className="bg-white p-2 px-3 rounded-xl border border-slate-200/60 text-[10px] font-mono font-bold flex justify-between items-center text-slate-500 shadow-sm flex-shrink-0">
                    <div className="flex gap-2.5">
                      <span>LAT: {mapCoords.lat.toFixed(6)}</span>
                      <span className="w-px bg-slate-200"></span>
                      <span>LNG: {mapCoords.lng.toFixed(6)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCoords}
                      className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-slate-50 rounded transition-all cursor-pointer active:scale-90"
                      title="Copy Coordinates"
                    >
                      <Copy size={11} />
                    </button>
                  </div>

                  {/* Save Coordinates or Get Directions Button */}
                  {mapCoords.isGeocoded && isOwnerOrAdmin ? (
                    <button
                      type="button"
                      disabled={savingCoords}
                      onClick={handleSaveCoords}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <MapPin size={13} className="fill-white/10 animate-pulse" />
                      <span>{savingCoords ? 'Saving GPS Pin...' : 'Save GPS Pin to Database'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGetDirections}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Navigation size={13} className="fill-white/10" />
                      <span>Get Navigation Directions</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50/70 border border-slate-200/60 border-dashed rounded-2xl p-6 text-center h-full flex flex-col justify-center items-center text-slate-400 space-y-2 py-10">
                  <div className="text-2xl">📍</div>
                  <h5 className="text-xs font-bold text-slate-600">No Geolocation Saved</h5>
                  <p className="text-[10px] max-w-[200px]">This issue was reported without precise GPS coordinates.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card footer details */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 ${
                hasUpvoted 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm shadow-indigo-100 scale-102' 
                  : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <ThumbsUp size={15} className={hasUpvoted ? 'fill-indigo-600' : ''} />
              <span>{issue.upvotes?.length || 0} Citizens Upvoted</span>
            </button>

            {isOwnerOrAdmin && (
              <button 
                onClick={handleDeleteIssue}
                className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
              >
                <Trash2 size={15} /> Delete Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discussion comments section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden">
        <div className="p-6 md:p-10">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <MessageSquare size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800">
              Community Discussion ({comments.length})
            </h3>
          </div>
          
          {/* Post custom comment form */}
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-grow">
                <textarea
                  rows="3"
                  className="block w-full border-slate-200 bg-slate-50 text-slate-800 rounded-2xl shadow-sm sm:text-sm px-4 py-3 placeholder-slate-400 focus:bg-white resize-none"
                  placeholder={user ? "Add helpful info or updates regarding this issue..." : "Login to participate in community discussions..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!user}
                ></textarea>
              </div>
            </div>
            <div className="mt-3.5 flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !user || !newComment.trim()}
                className={`inline-flex items-center gap-1.5 justify-center py-2 px-4 border border-transparent shadow-md text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-colors ${(!user || !newComment.trim() || submittingComment) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Send size={13} />
                <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>

          {/* List of comment elements */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                    {comment.userId.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-grow bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{comment.userId.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold ml-2.5">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {(user && (user.role === 'admin' || user._id === comment.userId._id)) && (
                      <button 
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                💬 No conversation has started yet. Be the first to leave a comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
