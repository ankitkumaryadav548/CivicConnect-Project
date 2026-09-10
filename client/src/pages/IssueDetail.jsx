import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { MapPin, Clock, ThumbsUp, Trash2, ArrowLeft, Send, MessageSquare, Navigation, Copy, RotateCcw, Layers, Lock, Wrench, CheckCircle } from 'lucide-react';
import { StatusBadge, CategoryBadge, DepartmentBadge, SLABadge } from '../components/Badges';
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
        } catch (err) {
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

    tileLayerRef.current = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '',
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
      tileLayerRef.current = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '',
        maxZoom: 20
      });
    } else {
      tileLayerRef.current = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '',
        maxZoom: 20
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

  const handleSaveGeocodedCoordinates = async () => {
    if (!mapCoords || !mapCoords.isGeocoded) return;
    setSavingCoords(true);
    try {
      const res = await axiosInstance.put(`/issues/${id}`, {
        latitude: mapCoords.lat,
        longitude: mapCoords.lng
      });
      setIssue(res.data.data);
      setMapCoords({ lat: mapCoords.lat, lng: mapCoords.lng, isGeocoded: false });
      toast.success('Pinned location permanently stored!');
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

  const handleDepartmentChange = async (newDept) => {
    try {
      const res = await axiosInstance.put(`/issues/${id}`, { department: newDept });
      setIssue(res.data.data);
      toast.success('Assigned Department updated!');
    } catch (error) {
      toast.error('Failed to update department');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const res = await axiosInstance.put(`/issues/${id}`, { priority: newPriority });
      setIssue(res.data.data);
      toast.success(`Priority updated to ${newPriority.toUpperCase()} (SLA recalculated)!`);
    } catch (error) {
      toast.error('Failed to update priority');
    }
  };

  const handleCitizenVerify = async (decision) => {
    try {
      let comment = '';
      if (decision === 'confirm') {
        comment = window.prompt('Optional feedback message (e.g. "Road repair verified satisfactorily"):') || 'Citizen confirmed issue resolution.';
      } else {
        comment = window.prompt('Please explain why the issue is still unresolved (e.g. "Water leak still leaking"):') || 'Citizen reported issue is NOT resolved.';
      }

      const res = await axiosInstance.patch(`/issues/${id}/citizen-verify`, {
        decision,
        comment
      });
      setIssue(res.data.data);
      if (decision === 'confirm') {
        toast.success('Thank you! Issue resolution confirmed and officially closed.');
      } else {
        toast.error('Issue has been reopened for further municipal action.');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update resolution state');
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto py-12 px-4"><IssueCardSkeleton /></div>;
  if (!issue) return <div className="text-center py-20">Issue not found</div>;

  const hasUpvoted = user && issue.upvotes.some(u => u._id === user._id || u === user._id);
  const isOwner = user && (issue.reportedBy._id === user._id || issue.reportedBy === user._id);
  const isOwnerOrAdmin = user && (isOwner || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors gap-1 uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Main Issue Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100/80 dark:border-slate-800/80 overflow-hidden mb-8 transition-colors duration-300">
        <div className="p-6 md:p-10">
          {/* Header Metadata */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <CategoryBadge category={issue.category} />
                <StatusBadge status={issue.status} />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                {issue.title}
              </h1>
            </div>
            
            {/* Municipal Admin Controls */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-3 rounded-2xl shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wide">Status:</span>
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer border shadow-sm"
                  >
                    <option value="open">🔓 Open</option>
                    <option value="in_progress">⚙️ In Progress</option>
                    <option value="resolved">✅ Resolved</option>
                    <option value="closed">🔒 Closed</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wide">Dept:</span>
                  <select
                    value={issue.department || 'general_municipal'}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer border shadow-sm"
                  >
                    <option value="water_board">💧 Water Board</option>
                    <option value="pwd_roads">🛣️ Public Works (PWD)</option>
                    <option value="electricity_board">⚡ Electricity Board</option>
                    <option value="sanitation_dept">🧹 Sanitation Dept</option>
                    <option value="general_municipal">🏛️ General Municipal</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wide">Priority:</span>
                  <select
                    value={issue.priority || 'medium'}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer border shadow-sm"
                  >
                    <option value="low">Low (7 Days SLA)</option>
                    <option value="medium">Medium (5 Days SLA)</option>
                    <option value="high">High (48 Hrs SLA)</option>
                    <option value="urgent">Urgent (24 Hrs SLA)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Department & SLA Tracking Header Panel */}
          <div className="mb-8 p-4.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DepartmentBadge department={issue.department} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Target Priority: <span className="text-slate-900 dark:text-slate-100 font-extrabold">{issue.priority || 'medium'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Resolution SLA:</span>
              <SLABadge slaDeadline={issue.slaDeadline} status={issue.status} priority={issue.priority} />
            </div>
          </div>

          {/* Citizen Resolution Verification Banner */}
          {issue.status === 'resolved' && isOwner && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/60 dark:via-teal-950/60 dark:to-indigo-950/60 border-2 border-emerald-300/80 dark:border-emerald-700/80 shadow-lg shadow-emerald-500/5 animate-pulse">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold text-base">
                    <CheckCircle size={22} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Municipal Officer Marked This Complaint as RESOLVED!</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                    As the citizen who reported this problem, please confirm if the repair near your home has been completed to your satisfaction:
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => handleCitizenVerify('confirm')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={16} />
                    <span>Yes, Confirm Solved</span>
                  </button>

                  <button
                    onClick={() => handleCitizenVerify('reject')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    <span>No, Issue Still Exists (Reopen)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Citizen Confirmation Status Banner */}
          {issue.status === 'closed' && (
            <div className="mb-8 p-4.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/90 dark:border-emerald-800 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
                <CheckCircle size={20} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200 uppercase tracking-wide">
                  {isAdmin ? "Resolution Officially Verified & Closed by Citizen" : "Your Issue is Solved and Closed"}
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  {isAdmin
                    ? "Reporting citizen has confirmed that the repair work near their location was completed successfully."
                    : "Thank you for confirming! Your reported complaint has been officially solved and closed."}
                </p>
              </div>
            </div>
          )}

          {/* User reported statistics */}
          <div className="flex flex-wrap gap-y-2 gap-x-5 text-xs text-slate-400 dark:text-slate-500 font-semibold mb-8">
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-indigo-500 dark:text-indigo-400" /> {issue.location}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 self-center"></span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-slate-400 dark:text-slate-500" /> Reported {new Date(issue.createdAt).toLocaleDateString()}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 self-center"></span>
            <span>By <strong className="text-slate-600 dark:text-slate-300">{issue.reportedBy.name}</strong></span>
          </div>

          {/* Two-Column Grid for Details + Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left 2 Cols: Main details & photos */}
            <div className="lg:col-span-2 space-y-6">
              <div className="prose max-w-none text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </div>

              {issue.images && issue.images.length > 0 && (
                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Supporting Visual Evidence</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {issue.images.map((img, i) => (
                      <a 
                        key={i} 
                        href={img} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700 aspect-video shadow-sm transition-transform duration-300 hover:scale-102 hover:shadow-md bg-white dark:bg-slate-900 animate-fade-in"
                      >
                        <img src={img} alt={`Issue ${i}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Progress Timeline */}
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  ⏱️ Resolution Progress Timeline
                </h3>
                
                <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 pl-6 space-y-6">
                  {/* Step 1: Issue Reported */}
                  <div className="relative animate-fade-in">
                    <div className="absolute -left-[31px] top-0.5 bg-blue-500 text-white rounded-full p-1.5 shadow-md flex items-center justify-center">
                      <Clock size={12} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">Issue Reported</h4>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold mt-0.5">
                        {new Date(issue.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs mt-1.5 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        Reported by <strong className="text-slate-700 dark:text-slate-200">{issue.reportedBy.name}</strong>.
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
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                            {statusLabel}
                          </h4>
                          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold mt-0.5">
                            {new Date(hist.changedAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })} by <strong className="text-slate-500 dark:text-slate-400">{hist.changedBy?.name || 'Municipal Officer'}</strong> ({hist.changedBy?.role || 'Officer'})
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 text-xs mt-1.5 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm font-medium italic">
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
                <div className="bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4.5 space-y-4 shadow-sm h-full flex flex-col justify-between transition-colors duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        📍 {mapCoords.isGeocoded ? 'Estimated Location' : 'Precise Location'}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold mt-0.5">
                        {mapCoords.isGeocoded 
                          ? 'Auto-geocoded address lookup. Pin is not saved yet.' 
                          : 'Mapped location of the reported concern.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative w-full h-[200px] lg:flex-grow min-h-[220px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden bg-slate-100 dark:bg-slate-900">
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
                        className="p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-md hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all border border-slate-200/50 dark:border-slate-700/50 cursor-pointer active:scale-95"
                        title={tileMode === 'street' ? "Switch to Satellite Imagery" : "Switch to Street Map"}
                      >
                        <Layers size={13} className={tileMode === 'satellite' ? "text-indigo-600 dark:text-indigo-400 fill-indigo-50 dark:fill-indigo-950" : ""} />
                      </button>

                      {/* Recenter Map Button */}
                      <button
                        type="button"
                        onClick={handleRecenter}
                        className="p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-md hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all border border-slate-200/50 dark:border-slate-700/50 cursor-pointer active:scale-95"
                        title="Re-center on pin"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Coordinates view & copy button */}
                  <div className="bg-white dark:bg-slate-900 p-2 px-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-mono font-bold flex justify-between items-center text-slate-500 dark:text-slate-400 shadow-sm flex-shrink-0">
                    <div className="flex gap-2.5">
                      <span>LAT: {mapCoords.lat.toFixed(6)}</span>
                      <span className="w-px bg-slate-200 dark:bg-slate-700"></span>
                      <span>LNG: {mapCoords.lng.toFixed(6)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCoords}
                      className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-all cursor-pointer active:scale-90"
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
                <div className="bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 border-dashed rounded-2xl p-6 text-center h-full flex flex-col justify-center items-center text-slate-400 dark:text-slate-500 space-y-2 py-10 transition-colors duration-300">
                  <div className="text-2xl">📍</div>
                  <h5 className="text-xs font-bold text-slate-600 dark:text-slate-300">No Geolocation Saved</h5>
                  <p className="text-[10px] max-w-[200px]">This issue was reported without precise GPS coordinates.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card footer details */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 ${
                hasUpvoted 
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm shadow-indigo-100 dark:shadow-indigo-950 scale-102' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ThumbsUp size={15} className={hasUpvoted ? 'fill-indigo-600 dark:fill-indigo-400' : ''} />
              <span>{issue.upvotes?.length || 0} Citizens Upvoted</span>
            </button>

            {isOwnerOrAdmin && (
              <button 
                onClick={handleDeleteIssue}
                className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold text-xs px-4 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40 transition-all cursor-pointer"
              >
                <Trash2 size={15} /> Delete Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discussion comments section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100/80 dark:border-slate-800/80 overflow-hidden transition-colors duration-300">
        <div className="p-6 md:p-10">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <MessageSquare size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Community Discussion ({comments.length})
            </h3>
          </div>
          
          {/* Post custom comment form */}
          {!user ? (
            <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 text-center flex flex-col items-center justify-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100/50 dark:border-indigo-900/50">
                <Lock size={20} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">Join the discussion</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  You need to be signed in to ask questions, share updates, or comment on community issues.
                </p>
              </div>
              <button
                onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                className="inline-flex items-center gap-1.5 justify-center py-2.5 px-6 border border-transparent shadow-md text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign In to Participate
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="flex gap-4">
                <div className="flex-grow">
                  <textarea
                    rows="3"
                    className="block w-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-sm sm:text-sm px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 resize-none transition-colors duration-200"
                    placeholder="Add helpful info or updates regarding this issue..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="mt-3.5 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className={`inline-flex items-center gap-1.5 justify-center py-2 px-4 border border-transparent shadow-md text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-colors ${(!newComment.trim() || submittingComment) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Send size={13} />
                  <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>
          )}

          {/* List of comment elements */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                    {comment.userId?.name ? comment.userId.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="flex-grow bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 transition-colors duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {comment.userId?.name || 'Anonymous User'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold ml-2.5">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {(user && (user.role === 'admin' || user._id === comment.userId?._id)) && (
                      <button 
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1 rounded-lg cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-semibold">
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
