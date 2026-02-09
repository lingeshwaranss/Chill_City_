import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Issue, IssueStatus, TimelineEvent, User } from '../types';
import StatusBadge from '../components/StatusBadge';
import IssueIcon from '../components/IssueIcon';
import { ChevronLeft, MapPin, Send, AlertTriangle, CheckCircle, ShieldAlert, Building2, CalendarClock, User as UserIcon, ArrowLeftRight, Maximize2, X, ChevronRight, Edit, Shield, Upload, Save } from 'lucide-react';

interface ComplaintDetailsPageProps {
  issues: Issue[];
  onUpdateIssue: (issue: Issue) => void;
  user: User | null;
}

const ComplaintDetailsPage: React.FC<ComplaintDetailsPageProps> = ({ issues, onUpdateIssue, user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const issue = issues.find(i => i.id === id);
  const [comment, setComment] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Admin State
  const [adminResolvedImage, setAdminResolvedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolvedFileInputRef = useRef<HTMLInputElement>(null);

  if (!issue) {
    return <div className="p-8 text-center text-gray-500">Complaint not found</div>;
  }

  const isAdmin = user?.role === 'admin';
  const isResolved = issue.status === IssueStatus.RESOLVED;

  // Gallery Logic
  const galleryImages = [
    { src: issue.imageUrl, label: 'Original Report', date: issue.createdAt },
    ...(issue.resolvedImageUrl ? [{ src: issue.resolvedImageUrl, label: 'Resolution Proof', date: issue.resolvedAt }] : [])
  ];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0));
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleAddComment = () => {
      if(!comment.trim()) return;
      const updatedIssue = {
          ...issue,
          comments: [...issue.comments, {
              id: Date.now().toString(),
              author: isAdmin ? 'Admin' : 'Me',
              text: comment,
              date: new Date().toLocaleString()
          }]
      };
      onUpdateIssue(updatedIssue);
      setComment('');
  };

  const handleDispute = () => {
      const newTimelineEvent: TimelineEvent = {
          status: IssueStatus.DISPUTED,
          date: new Date().toLocaleString(),
          description: 'Citizen raised dispute: Resolution unsatisfactory (Audit Requested).',
          active: true
      };
      const updatedIssue = {
          ...issue,
          status: IssueStatus.DISPUTED,
          timeline: [...issue.timeline, newTimelineEvent]
      };
      onUpdateIssue(updatedIssue);
      setShowDisputeModal(false);
  };

  const handleImageUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && issue) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              const updatedIssue = {
                  ...issue,
                  imageUrl: base64,
                  updatedAt: new Date().toISOString()
              };
              onUpdateIssue(updatedIssue);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleResolvedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAdminResolvedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAdminResolve = () => {
      if (!adminResolvedImage) return;

      const newTimelineEvent: TimelineEvent = {
          status: IssueStatus.RESOLVED,
          date: new Date().toLocaleString(),
          description: 'Issue marked as Resolved by Admin.',
          active: true
      };
      
      const updatedIssue: Issue = {
          ...issue,
          status: IssueStatus.RESOLVED,
          resolvedImageUrl: adminResolvedImage,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeline: [...issue.timeline, newTimelineEvent]
      };
      onUpdateIssue(updatedIssue);
      setAdminResolvedImage(null);
  };


  return (
    <div className="h-full flex flex-col md:flex-row bg-background overflow-hidden relative">
      
      {/* Back Button Mobile */}
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-30 md:hidden bg-white/80 p-2 rounded-full text-slate-800 shadow-md backdrop-blur-sm">
          <ChevronLeft />
      </button>

      {/* Main Content (Left/Top) */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-0">
         
         {/* Visual Proof Area (Comparison View) */}
         <div className="h-72 md:h-80 w-full relative">
             <div className="absolute inset-0 flex">
                {/* Original Image */}
                <div className="flex-1 relative bg-gray-100 border-r border-white/20 group">
                    <img src={issue.imageUrl} className="w-full h-full object-cover" alt="Reported Issue" />
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2 z-20">
                        <div className="bg-black/80 backdrop-blur-sm px-3 py-1.5 text-xs text-white rounded font-bold shadow-lg border-l-4 border-danger uppercase tracking-wider">
                            Original Report
                        </div>
                        {/* Edit Button: Visible for Author OR Admin */}
                        {(issue.author === 'Me' || isAdmin) && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                                className="bg-white/90 p-1.5 rounded-full text-slate-800 shadow-lg hover:text-primary transition-all hover:scale-105 flex items-center justify-center"
                                title="Change Photo"
                            >
                                <Edit size={14} />
                            </button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpdate} />
                </div>

                {/* Resolved Image (If available) */}
                {issue.resolvedImageUrl ? (
                    <div className="flex-1 relative">
                        <img src={issue.resolvedImageUrl} className="w-full h-full object-cover" alt="Resolution Proof" />
                        <div className="absolute inset-0 bg-success/10 mix-blend-multiply"></div>
                        <div className="absolute bottom-4 right-4 bg-success text-white px-3 py-1.5 text-xs rounded font-bold shadow-lg border-r-4 border-white uppercase tracking-wider flex items-center">
                            <CheckCircle size={12} className="mr-1" /> Resolution Proof
                        </div>
                        {/* Center Split Icon */}
                        <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white text-primary p-2 rounded-full shadow-xl z-10 border-2 border-gray-100">
                            <ArrowLeftRight size={16} />
                        </div>
                    </div>
                ) : isAdmin && !isResolved ? (
                    // Admin Resolution Placeholder
                    <div className="flex-1 relative bg-gray-200 flex items-center justify-center">
                        <div className="text-center p-4">
                            <p className="text-gray-500 text-sm font-bold mb-2">Pending Resolution</p>
                            <p className="text-xs text-gray-400">Upload proof to resolve</p>
                        </div>
                    </div>
                ) : null}
             </div>
             
             {/* Header Info Overlay */}
             <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10">
                 <div className="flex justify-between items-start">
                    <div>
                         <div className="flex items-center space-x-2">
                             <div className="bg-white/90 p-1.5 rounded-lg text-primary shadow-sm">
                                <IssueIcon type={issue.type} size={20} />
                             </div>
                             <h1 className="text-2xl font-bold text-white drop-shadow-md tracking-tight">{issue.type}</h1>
                         </div>
                         <div className="flex items-center text-gray-100 text-sm font-medium mt-1 ml-1 drop-shadow-sm">
                            <MapPin size={14} className="mr-1 text-accent" />
                            {issue.locationName}
                        </div>
                    </div>
                    <div className="pointer-events-auto">
                        <StatusBadge status={issue.status} size="md" />
                    </div>
                 </div>
             </div>
         </div>

         <div className="p-4 md:p-8 max-w-4xl mx-auto">
             
             {/* ADMIN ACTIONS PANEL */}
             {isAdmin && (
                 <div className="mb-8 bg-white border border-red-200 shadow-md shadow-red-900/5 rounded-xl overflow-hidden">
                     <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex items-center">
                         <Shield className="text-red-600 mr-2" size={16} />
                         <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Admin Cloud Controls</span>
                     </div>
                     <div className="p-6">
                        {!isResolved ? (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700">Intimate User & Resolve Issue</h3>
                                <div className="flex gap-4 items-start">
                                    <div 
                                        onClick={() => resolvedFileInputRef.current?.click()}
                                        className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        {adminResolvedImage ? (
                                            <img src={adminResolvedImage} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-400 mb-1" />
                                                <span className="text-[10px] text-gray-500 text-center px-2">Upload Proof</span>
                                            </>
                                        )}
                                        <input type="file" ref={resolvedFileInputRef} className="hidden" accept="image/*" onChange={handleResolvedImageUpload} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 mb-4">
                                            Upload a photo of the resolved issue to complete the ticket. This will update the status to "Resolved" and intimate the user.
                                        </p>
                                        <button 
                                            onClick={handleAdminResolve}
                                            disabled={!adminResolvedImage}
                                            className="bg-success hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-md"
                                        >
                                            <Save size={16} className="mr-2" /> Mark Resolved & Notify
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                                <CheckCircle size={20} className="mr-2" />
                                <span className="font-bold text-sm">This issue has been resolved and the user was intimated.</span>
                            </div>
                        )}
                     </div>
                 </div>
             )}

             {/* Key Details Cards */}
             <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
                     <Building2 className="text-primary mb-2" size={24} />
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Assigned Authority</p>
                     <p className="font-bold text-slate-800 text-sm md:text-base mt-1">{issue.assignedAuthority || "Pending..."}</p>
                 </div>
                 <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
                     <CalendarClock className="text-accent mb-2" size={24} />
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SLA Deadline</p>
                     <p className="font-bold text-slate-800 text-sm md:text-base mt-1 text-red-600">{issue.deadline ? new Date(issue.deadline).toLocaleDateString() : "Calculating..."}</p>
                 </div>
             </div>

             {/* Description */}
             <div className="mb-8">
                 <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Issue Description</h2>
                 <p className="text-slate-700 leading-relaxed bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-lg font-medium">
                     {issue.description}
                 </p>
             </div>

             {/* Photo Gallery */}
             <div className="mb-8">
                <div className="flex items-center justify-between mb-4 ml-1">
                    <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Evidence Gallery</h2>
                    <span className="text-xs text-gray-400 font-medium">{galleryImages.length} images</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((img, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => openLightbox(idx)}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-all bg-gray-100"
                        >
                            <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 className="text-white drop-shadow-md" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6">
                                <p className="text-white text-xs font-bold truncate">{img.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Resolution Verification (Dispute Logic) */}
             {isResolved && (
                 <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                            <h3 className="font-bold text-lg mb-1 flex items-center text-green-800">
                                <CheckCircle className="text-success mr-2" /> 
                                Issue Resolved
                            </h3>
                            <p className="text-green-700 mb-0 text-sm">
                                Please verify the "Resolution Proof" image above.
                            </p>
                         </div>
                         {!isAdmin && (
                            <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => setShowDisputeModal(true)}
                                    className="flex-1 md:flex-none whitespace-nowrap bg-white hover:bg-red-50 text-red-600 border border-red-200 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center shadow-sm"
                                >
                                    <ShieldAlert size={16} className="mr-2" />
                                    Raise Dispute
                                </button>
                            </div>
                         )}
                     </div>
                 </div>
             )}

             {/* Timeline */}
             <div className="mb-8">
                 <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 ml-1">Official Timeline</h2>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                         {issue.timeline.map((event, idx) => (
                             <div key={idx} className="relative pl-6">
                                 <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 shadow-sm z-10
                                    ${event.active ? 'bg-primary border-primary' : 'bg-gray-100 border-gray-300'}
                                    ${event.status === IssueStatus.DISPUTED ? 'bg-danger border-danger' : ''}
                                 `}></div>
                                 <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                                     <div>
                                         <span className={`text-xs font-bold px-2 py-0.5 rounded border mb-1 inline-block uppercase tracking-wide
                                            ${event.status === IssueStatus.DISPUTED ? 'bg-red-50 text-danger border-red-200' : 'bg-blue-50 text-primary border-blue-100'}
                                         `}>
                                             {event.status}
                                         </span>
                                         <p className="text-slate-800 font-medium mt-1">{event.description}</p>
                                     </div>
                                     <span className="text-xs text-gray-400 mt-2 sm:mt-0 font-medium font-mono">{event.date}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>

         </div>
      </div>

      {/* Sidebar (Right/Bottom) - Comments */}
      <div className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col h-96 md:h-auto shadow-lg z-10">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-700">Comments</h2>
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">{issue.comments.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {issue.comments.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8 flex flex-col items-center">
                      <UserIcon size={32} className="mb-2 opacity-20" />
                      No comments yet.
                  </div>
              ) : (
                  issue.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-primary flex items-center">
                                  <UserIcon size={12} className="mr-1" /> {comment.author}
                              </span>
                              <span className="text-[10px] text-gray-400">{comment.date}</span>
                          </div>
                          <p className="text-sm text-slate-700">{comment.text}</p>
                      </div>
                  ))
              )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                  <input 
                    type="text" 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-800 placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button onClick={handleAddComment} className="text-primary hover:text-blue-700 transition-colors ml-2">
                      <Send size={18} />
                  </button>
              </div>
          </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={closeLightbox}>
            <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors z-[110]" onClick={closeLightbox}>
                <X size={32} />
            </button>
            
            {galleryImages.length > 1 && (
                <>
                    <button className="absolute left-4 text-white/50 hover:text-white p-2 transition-colors z-[110] hidden md:block" onClick={prevImage}>
                        <ChevronLeft size={48} />
                    </button>
                    <button className="absolute right-4 text-white/50 hover:text-white p-2 transition-colors z-[110] hidden md:block" onClick={nextImage}>
                        <ChevronRight size={48} />
                    </button>
                </>
            )}

            <div className="max-w-5xl w-full max-h-[90vh] p-4 flex flex-col items-center justify-center relative" onClick={e => e.stopPropagation()}>
                <img 
                    src={galleryImages[lightboxIndex].src} 
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
                    alt="Fullscreen view"
                />
                <div className="mt-4 text-center">
                    <p className="text-white font-bold text-xl">{galleryImages[lightboxIndex].label}</p>
                    {galleryImages[lightboxIndex].date && <p className="text-gray-400 text-sm mt-1">{new Date(galleryImages[lightboxIndex].date!).toLocaleString()}</p>}
                </div>
            </div>
          </div>
      )}

      {/* Dispute Modal Overlay */}
      {showDisputeModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
                  <div className="flex items-center text-danger mb-4">
                      <div className="bg-red-50 p-2 rounded-full mr-3">
                        <AlertTriangle size={28} />
                      </div>
                      <h2 className="text-xl font-bold">Raise Official Dispute</h2>
                  </div>
                  <p className="text-slate-600 mb-6 font-medium">
                      Are you sure you want to mark this resolution as unsatisfactory? This will trigger an automatic audit for the <span className="font-bold text-slate-800">{issue.assignedAuthority}</span>.
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDisputeModal(false)}
                        className="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleDispute}
                        className="flex-1 py-3 bg-danger text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                      >
                          Yes, Audit Issue
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ComplaintDetailsPage;