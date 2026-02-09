import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue, IssueStatus, LatLng, User as UserType } from '../types';
import { CHENNAI_CENTER } from '../constants';
import { analyzeIssueImage } from '../services/geminiService';
import { Camera, MapPin, Loader2, Sparkles, AlertCircle, RefreshCw, Smartphone, Mail, Phone, Clock, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

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

interface NewReportPageProps {
    onAddIssue: (issue: Issue) => void;
    existingIssues: Issue[];
    user?: UserType | null;
}

const NewReportPage: React.FC<NewReportPageProps> = ({ onAddIssue, existingIssues, user }) => {
  const navigate = useNavigate();
  
  // States
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [pincode, setPincode] = useState('');
  const [cityName, setCityName] = useState('');
  const [coordinates, setCoordinates] = useState<LatLng>(CHENNAI_CENTER);
  const [step, setStep] = useState(1);
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const [cameraError, setCameraError] = useState('');

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Check Cooldown (48 Hours)
    const cooldownRemaining = useMemo(() => {
        if (!existingIssues || !Array.isArray(existingIssues)) return null;

        // Admin users can post unlimited reports
        if (user?.role === 'admin') return null;

        const myIssues = existingIssues.filter(i => i.author === 'Me');
        if (myIssues.length === 0) return null;
    
        // Sort by createdAt descending with validation
        const sorted = [...myIssues]
                .filter(i => !isNaN(new Date(i.createdAt).getTime()))
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (sorted.length === 0) return null;

        const lastIssue = sorted[0];
        const lastDate = new Date(lastIssue.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - lastDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
    
        if (diffHours < 48) {
                return Math.ceil(48 - diffHours);
        }
        return null;
    }, [existingIssues, user]);

  // Initialize GPS immediately
  useEffect(() => {
     if (navigator.geolocation && !cooldownRemaining) {
         navigator.geolocation.getCurrentPosition(
             (pos) => {
                 const lat = pos.coords.latitude;
                 const lng = pos.coords.longitude;
                 setCoordinates({ lat, lng });
                 // Auto fetch address
                 fetchAddress(lat, lng);
             },
             (err) => {
                 console.error("GPS Error", err);
                 setLocationName("Location Access Denied - Using Default");
                 setCityName("CHN");
                 setPincode("600000");
             },
             { enableHighAccuracy: true }
         );
     }
  }, [cooldownRemaining]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [stream]);

  const startCamera = async () => {
      try {
          const newStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment' } // Prefer back camera
          });
          setStream(newStream);
          if (videoRef.current) {
              videoRef.current.srcObject = newStream;
          }
          setCameraError('');
      } catch (err) {
          console.error("Camera Error", err);
          setCameraError("Camera access denied or unavailable. Please enable camera permissions.");
      }
  };

  const fetchAddress = async (lat: number, lng: number) => {
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          
          const addr = data.address;
          const city = addr.city || addr.town || addr.village || addr.county || "Unknown";
          const zip = addr.postcode || "000000";
          
          const street = addr.road || addr.suburb || "";
          const area = addr.neighbourhood || city;
          const shortAddress = [street, area].filter(Boolean).join(', ');

          setCityName(city);
          setPincode(zip);
          setLocationName(shortAddress || "GPS Location");
      } catch (error) {
          console.error("Geocoding failed", error);
          setCityName("Chennai");
          setPincode("600000");
          setLocationName("Unknown Location");
      }
  };

  const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          if (context) {
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const barHeight = canvas.height * 0.25;
              const yStart = canvas.height - barHeight;
              
              context.fillStyle = 'rgba(0, 0, 0, 0.75)';
              context.fillRect(0, yStart, canvas.width, barHeight);

              const fontSize = Math.floor(canvas.width * 0.04);
              context.font = `bold ${fontSize}px sans-serif`;
              context.fillStyle = 'white';
              context.textBaseline = 'top';

              const padding = fontSize;
              const lineHeight = fontSize * 1.4;

              const dateStr = new Date().toLocaleString();
              const locStr = `Lat: ${coordinates.lat.toFixed(6)}, Lng: ${coordinates.lng.toFixed(6)}`;
              const addrStr = locationName || "Fetching location...";
              const pinStr = pincode ? `Pin: ${pincode}` : "";

              context.fillText(addrStr, padding, yStart + padding);
              context.fillText(locStr, padding, yStart + padding + lineHeight);
              context.fillText(`${dateStr}`, padding, yStart + padding + (lineHeight * 2));
              context.fillText(pinStr, padding, yStart + padding + (lineHeight * 3));

              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              setImage(dataUrl);

              if (stream) {
                  stream.getTracks().forEach(track => track.stop());
                  setStream(null);
              }

              analyzePhoto(dataUrl);
          }
      }
  };

  const analyzePhoto = async (base64Data: string) => {
      setAnalyzing(true);
      try {
          const cleanBase64 = base64Data.split(',')[1];
          const locationContext = `${locationName}, Pincode: ${pincode}, Lat: ${coordinates.lat}, Lng: ${coordinates.lng}`;
          
          const analysis = await analyzeIssueImage(cleanBase64, locationContext);

          if (analysis.isFraud) {
             alert(`FRAUD DETECTED: ${analysis.fraudReason || "Image validation failed."} Please capture a real civic issue.`);
             setImage(null);
             startCamera();
          } else {
              setIssueType(analysis.type);
              setDescription(analysis.description);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setAnalyzing(false);
      }
  };

  const generateComplaintID = useCallback(() => {
      const cleanCity = (cityName || "CTY").replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
      const pin = (pincode || "000000").replace(/[^0-9]/g, '');
      const prefix = `${cleanCity}${pin}`;

      const count = existingIssues.filter(i => i.id.startsWith(prefix)).length;
      const sequence = String(count + 1).padStart(3, '0');
      
      return `${prefix}-${sequence}`;
  }, [cityName, pincode, existingIssues]);


  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 7);

      const finalId = generateComplaintID();

      const newIssue: Issue = {
          id: finalId,
          type: issueType || 'General Issue',
          description: description,
          locationName: locationName || 'GPS Location',
          coordinates: coordinates,
          status: IssueStatus.NEW,
          imageUrl: image || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'Me',
          comments: [],
          timeline: [
              { status: 'Submitted', date: new Date().toLocaleString(), description: 'Report submitted via CHILL CITY App', active: true }
          ],
          assignedAuthority: "Assigning...",
          deadline: deadlineDate.toISOString().split('T')[0],
          contactNumber: contactNumber,
          contactEmail: contactEmail
      };
      onAddIssue(newIssue);
      navigate('/dashboard');
  };

  const handleRetake = () => {
      setImage(null);
      startCamera();
  };

  useEffect(() => {
      if (step === 1 && !image && !cooldownRemaining) {
          startCamera();
      }
  }, [step, image, cooldownRemaining]);

  if (cooldownRemaining !== null) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-background animate-fade-in relative">
              <button 
                onClick={() => navigate('/dashboard')}
                className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"
              >
                  <ArrowLeft size={24} />
              </button>
              
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-red-100">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
                      <Clock size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Report Limit Reached</h2>
                  <p className="text-slate-600 mb-6 text-sm">
                      To ensure quality and prevent spam, users can only submit one report every 48 hours.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Next Report Available In</span>
                      <span className="text-3xl font-black text-primary">{cooldownRemaining} Hours</span>
                  </div>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-transform active:scale-95"
                  >
                      Go to My Complaints
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col items-center p-4 overflow-y-auto pb-24 bg-background">
      
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-primary">GPS Issue Reporter</h1>
        
        <div className="flex justify-between mb-6 relative px-4">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-300 -z-10"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${step >= 1 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border border-gray-300'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${step >= 2 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border border-gray-300'}`}>2</div>
        </div>

        {step === 1 && (
            <div className="animate-fade-in space-y-4">
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-black aspect-[3/4] flex items-center justify-center">
                    {!image && (
                         <>
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center">
                                <MapPin size={12} className="mr-1 text-accent" /> {locationName || "Locating..."}
                            </div>
                            <button 
                                onClick={capturePhoto}
                                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-200 shadow-xl flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <div className="w-12 h-12 bg-primary rounded-full"></div>
                            </button>
                         </>
                    )}

                    {image && (
                        <img src={image} alt="Captured" className="w-full h-full object-cover" />
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                    
                    {cameraError && !image && (
                        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white p-6 text-center">
                            <AlertCircle size={48} className="text-red-500 mb-4" />
                            <p>{cameraError}</p>
                        </div>
                    )}
                </div>

                {analyzing ? (
                    <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-100 rounded-lg text-primary text-sm font-medium shadow-sm animate-pulse">
                        <Loader2 className="animate-spin mr-2" /> Validating & Analyzing...
                    </div>
                ) : image && (
                     <div className="space-y-4">
                         <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                            <div className="flex items-center text-primary mb-3 text-xs font-bold uppercase tracking-wide">
                                <Sparkles size={14} className="mr-2 text-accent" /> AI Detected Issue
                            </div>
                            <div className="mb-3">
                                <input 
                                    type="text" 
                                    value={issueType} 
                                    onChange={(e) => setIssueType(e.target.value)}
                                    placeholder="Issue Type"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-slate-800 font-bold focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <textarea 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Description"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-slate-700 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    rows={2}
                                />
                            </div>
                         </div>
                         
                         <div className="flex gap-3">
                             <button onClick={handleRetake} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg flex items-center justify-center hover:bg-gray-50">
                                 <RefreshCw size={18} className="mr-2" /> Retake
                             </button>
                             <button 
                                onClick={() => {
                                    setGeneratedId(generateComplaintID());
                                    setStep(2);
                                }} 
                                className="flex-[2] bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-800 shadow-md"
                            >
                                Next Step
                             </button>
                         </div>
                     </div>
                )}
            </div>
        )}

        {step === 2 && (
            <div className="animate-fade-in space-y-6">
                
                <div className="bg-gradient-to-r from-primary to-blue-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={100} />
                    </div>
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Generated Complaint ID</p>
                    <h2 className="text-3xl font-mono font-bold tracking-wider break-all">{generatedId}</h2>
                    <div className="mt-4 flex items-center text-xs text-blue-100 bg-white/10 p-2 rounded inline-flex">
                        <MapPin size={12} className="mr-2" /> {locationName}
                    </div>
                </div>

                <div className="h-48 rounded-xl overflow-hidden border border-gray-200 relative z-0 shadow-sm pointer-events-none">
                    <MapContainer center={coordinates} zoom={15} className="h-full w-full" zoomControl={false} dragging={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <Marker position={coordinates}></Marker>
                    </MapContainer>
                    <div className="absolute inset-0 bg-black/10 z-[400] flex items-center justify-center">
                        <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm">GPS Location Locked</span>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <Smartphone size={16} className="mr-2 text-gray-400" /> Contact Info (Optional)
                    </h3>
                    <div className="space-y-3">
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                            <input 
                                type="tel"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                placeholder="Mobile Number"
                                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                            <input 
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 italic">We will only use this to update you on status changes.</p>
                </div>

                <div className="flex gap-4">
                     <button onClick={() => setStep(1)} className="flex-1 bg-white border border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">Back</button>
                     <button onClick={handleSubmit} className="flex-1 bg-success text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20">Submit Complaint</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default NewReportPage;