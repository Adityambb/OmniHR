
import React, { useState, useRef, useEffect } from 'react';
import { User, Client, LocationType } from '../types';
import { calculateDistance } from '../utils/geoUtils';

interface AttendanceTrackerProps {
  user: User;
  client: Client;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MOCK_BRANCH = {
  lat: 40.7128,
  lng: -74.0060,
  radius: 200 // meters
};

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ user, client, showToast }) => {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punching, setPunching] = useState(false);
  const [punchType, setPunchType] = useState<'IN' | 'OUT' | null>(null);
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType>(LocationType.OFFICE);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distFromOffice, setDistFromOffice] = useState<number | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location && selectedLocationType === LocationType.OFFICE) {
      const dist = calculateDistance(MOCK_BRANCH.lat, MOCK_BRANCH.lng, location.lat, location.lng);
      setDistFromOffice(dist);
    } else {
      setDistFromOffice(null);
    }
  }, [location, selectedLocationType]);

  const handleStartPunch = async (type: 'IN' | 'OUT') => {
    setPunchType(type);
    setPunching(true);
    setCapturedImage(null);
    setLocation(null);

    if (client.settings.requireGPS) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          showToast?.("GPS access required", "error");
        },
        { enableHighAccuracy: true }
      );
    }
    
    if (client.settings.requireSelfie) {
      setCameraActive(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        showToast?.("Camera access required", "error");
      }
    }
  };

  const captureSelfie = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvas.toDataURL('image/png'));
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach(t => t.stop());
      setCameraActive(false);
    }
  };

  const completePunch = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (punchType === 'IN') {
        setIsPunchedIn(true);
        setPunchInTime(new Date());
        showToast?.(`Clocked in!`, 'success');
      } else {
        setIsPunchedIn(false);
        setPunchInTime(null);
        showToast?.(`Clocked out!`, 'success');
      }
      setPunching(false);
      setPunchType(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelPunch = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setPunching(false);
    setCameraActive(false);
  };

  const isWithinGeofence = distFromOffice !== null && distFromOffice <= MOCK_BRANCH.radius;

  return (
    <div className="max-w-xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 md:p-12 text-white text-center relative">
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] mb-2 md:mb-4 uppercase">System Clock</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 md:mb-4 tabular-nums">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h1>
          <p className="text-sm md:text-lg font-medium text-slate-300">
            {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div className="p-6 md:p-10">
          {!punching ? (
            <div className="text-center space-y-6 md:space-y-10 py-2">
              <div className="flex flex-col items-center">
                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${isPunchedIn ? 'bg-amber-50 text-amber-500 shadow-xl rotate-12' : 'bg-indigo-50 text-indigo-600 shadow-xl'}`}>
                  <i className={`fas ${isPunchedIn ? 'fa-hourglass-half' : 'fa-fingerprint'} text-3xl md:text-5xl`}></i>
                </div>
                <div className="mt-6 md:mt-8">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">{isPunchedIn ? "Clocked In" : "Morning Check-in"}</h3>
                  <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
                    {isPunchedIn ? `Active since ${punchInTime?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : "Capture your presence now"}
                  </p>
                </div>
              </div>

              {!isPunchedIn && (
                <div className="flex justify-center">
                  <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    <button 
                      onClick={() => setSelectedLocationType(LocationType.OFFICE)}
                      className={`px-4 md:px-8 py-2 md:py-3 rounded-xl text-[10px] font-black uppercase transition-all ${selectedLocationType === LocationType.OFFICE ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}
                    >
                      Office
                    </button>
                    <button 
                      onClick={() => setSelectedLocationType(LocationType.WFH)}
                      className={`px-4 md:px-8 py-2 md:py-3 rounded-xl text-[10px] font-black uppercase transition-all ${selectedLocationType === LocationType.WFH ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}
                    >
                      WFH
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleStartPunch(isPunchedIn ? 'OUT' : 'IN')}
                className={`w-full h-14 md:h-16 ${isPunchedIn ? 'bg-rose-600' : 'bg-indigo-600'} text-white rounded-2xl font-black text-base md:text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3`}
              >
                 <i className={`fas ${isPunchedIn ? 'fa-sign-out-alt' : 'fa-sign-in-alt'}`}></i> 
                 Clock {isPunchedIn ? 'Out' : 'In Now'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Security Check</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verification Steps</p>
                </div>
                <button onClick={cancelPunch} className="w-8 h-8 text-slate-400"><i className="fas fa-times"></i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 flex flex-col items-center justify-center text-center ${location ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  {location ? (
                    <>
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2 md:mb-4 shadow-lg">
                        <i className="fas fa-map-check"></i>
                      </div>
                      <p className="text-xs font-black text-slate-900 uppercase">GPS Locked</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Coordinates Verified</p>
                    </>
                  ) : (
                    <div className="animate-pulse space-y-2">
                       <div className="w-8 h-8 bg-slate-200 rounded-full mx-auto"></div>
                       <p className="text-[10px] font-black text-slate-300 uppercase">Locating...</p>
                    </div>
                  )}
                </div>

                <div className="relative aspect-square bg-slate-900 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-white shadow-xl">
                  {cameraActive && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
                  {capturedImage && <img src={capturedImage} className="w-full h-full object-cover" alt="Verification" />}
                  {cameraActive && (
                    <button onClick={captureSelfie} className="absolute bottom-3 left-1/2 -translate-x-1/2 h-10 px-4 bg-white text-indigo-600 rounded-full text-[10px] font-black shadow-2xl">
                      Capture Image
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={cancelPunch} className="flex-1 h-12 bg-slate-50 text-slate-600 rounded-xl font-black text-xs">Abort</button>
                <button
                  disabled={loading || !location || (client.settings.requireSelfie && !capturedImage)}
                  onClick={completePunch}
                  className={`flex-1 h-12 rounded-xl font-black text-xs shadow-xl transition-all ${loading || !location ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white'}`}
                >
                  {loading ? 'Processing...' : 'Verify & Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
