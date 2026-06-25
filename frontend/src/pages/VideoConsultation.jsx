import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const socket = io('/', { autoConnect: false });

const VideoConsultation = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [peerJoined, setPeerJoined] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [remoteName, setRemoteName] = useState("Client");
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();
  const streamRef = useRef(null);
  const pendingCandidates = useRef([]);

  // Ensure local video is attached safely
  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  // Ensure remote video is attached safely and autoplay is triggered
  useEffect(() => {
    if (userVideo.current && remoteStream) {
      userVideo.current.srcObject = remoteStream;
      // Explicitly call play to circumvent autoplay block if the element was hidden
      userVideo.current.play().catch(e => {
        console.warn("Autoplay prevented by mobile browser:", e);
        setAutoplayBlocked(true);
      });
    }
  }, [remoteStream]);

  const handleManualPlay = () => {
    if (userVideo.current) {
      userVideo.current.play()
        .then(() => setAutoplayBlocked(false))
        .catch(err => console.error("Manual play still blocked", err));
    }
  };

  // Fetch appointment data for names
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${roomId}`);
        setAppointment(res.data);
        if (user?.role === 'doctor') {
          setRemoteName(res.data.patientId?.name || "Patient");
        } else {
          setRemoteName(res.data.doctorId?.name ? `Dr. ${res.data.doctorId.name}` : "Doctor");
        }
      } catch (err) {
        console.error("Failed to fetch appointment details", err);
      }
    };
    if (user && roomId) fetchAppointment();
  }, [roomId, user]);

  useEffect(() => {
    let isMounted = true;
    socket.connect();

    const initWebRTC = async () => {
      try {
        // 1. Get Media
        let localStream;
        try {
          const constraints = {
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
              aspectRatio: { ideal: 16 / 9 }
            },
            audio: true
          };
          localStream = await navigator.mediaDevices.getUserMedia(constraints);
          setIsVideoOff(false);
          setIsMuted(false);
        } catch (mediaErr) {
          console.warn("Could not get video+audio, trying audio only", mediaErr);
          try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            setIsVideoOff(true);
            setIsMuted(false);
          } catch (audioErr) {
            console.error("No media devices", audioErr);
            localStream = new MediaStream();
            setIsVideoOff(true);
            setIsMuted(true);
            setErrorMsg("No camera or microphone access. Joining in receive-only mode.");
          }
        }
        
        if (!isMounted) {
          localStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        streamRef.current = localStream;
        setStream(localStream);
        
        // Immediately attach local video
        if (myVideo.current) {
          myVideo.current.srcObject = localStream;
        }

        // 2. Fetch TURN Credentials
        let iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
        try {
          const domain = import.meta.env.VITE_METERED_DOMAIN;
          const apiKey = import.meta.env.VITE_METERED_API_KEY;
          if (domain && apiKey) {
            const res = await fetch(`https://${domain}/api/v1/turn/credentials?apiKey=${apiKey}`);
            iceServers = await res.json();
            console.log("TURN credentials loaded");
          }
        } catch (turnErr) {
          console.error("TURN fetch failed", turnErr);
        }

        // 3. Setup RTCPeerConnection
        const peer = new RTCPeerConnection({ iceServers });
        peerRef.current = peer;

        if (localStream.getTracks().length > 0) {
          localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));
        }

        peer.ontrack = (event) => {
          if (!isMounted) return;
          if (userVideo.current) {
            userVideo.current.srcObject = event.streams[0];
          }
          setRemoteStream(event.streams[0]);
        };

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', roomId, event.candidate);
          }
        };

        peer.onconnectionstatechange = () => {
          if (peer.connectionState === 'connected') {
            setIsConnected(true);
          } else if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
            setIsConnected(false);
          }
        };

        // 4. Socket Events
        socket.on('user-connected', async (userId) => {
          setPeerJoined(true);
          try {
            if (peer.signalingState !== 'stable') return;
            const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
            await peer.setLocalDescription(offer);
            socket.emit('offer', roomId, offer);
          } catch (err) {
            console.error(`Offer failed: ${err.message}`);
          }
        });

        socket.on('offer', async (offer) => {
          setPeerJoined(true);
          try {
            if (peer.signalingState !== 'stable') {
              console.warn("Ignoring offer to prevent race condition");
              return;
            }
            await peer.setRemoteDescription(new RTCSessionDescription(offer));
            
            // Apply any ICE candidates that arrived early
            while (pendingCandidates.current.length > 0) {
              await peer.addIceCandidate(new RTCIceCandidate(pendingCandidates.current.shift()));
            }

            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit('answer', roomId, answer);
          } catch (err) {
            console.error("Failed to handle offer", err);
          }
        });

        socket.on('answer', async (answer) => {
          try {
            await peer.setRemoteDescription(new RTCSessionDescription(answer));
            
            // Apply any ICE candidates that arrived early
            while (pendingCandidates.current.length > 0) {
              await peer.addIceCandidate(new RTCIceCandidate(pendingCandidates.current.shift()));
            }
          } catch (err) {
            console.error("Failed to handle answer", err);
          }
        });

        socket.on('ice-candidate', async (candidate) => {
          try {
            if (peer.remoteDescription) {
              await peer.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              console.log("Queueing ICE candidate...");
              pendingCandidates.current.push(candidate);
            }
          } catch (err) {
            console.error("Failed to add ICE candidate", err);
          }
        });

        socket.on('user-disconnected', () => {
          console.log("User disconnected");
          setPeerJoined(false);
          setIsConnected(false);
          setRemoteStream(null);
          if (userVideo.current) userVideo.current.srcObject = null;
        });

        socket.emit('join-room', roomId, user?._id || 'guest');
        console.log(`Joined room ${roomId}`);

      } catch (err) {
        console.error("WebRTC Init Error:", err);
        setErrorMsg("Failed to initialize video call.");
      }
    };

    initWebRTC();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (peerRef.current) peerRef.current.close();
      socket.off('user-connected');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user]);

  const toggleMute = () => {
    if (stream && stream.getAudioTracks().length > 0) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    } else {
      alert("No microphone detected!");
    }
  };

  const toggleVideo = () => {
    if (stream && stream.getVideoTracks().length > 0) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    } else {
      alert("No camera detected! The hardware is unavailable or blocked by another application.");
    }
  };

  const leaveCall = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen w-full bg-[#202124] flex flex-col relative overflow-hidden font-body-md">

      {/* Error Overlay */}
      {errorMsg && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 font-medium">
          <AlertCircle size={20} />
          {errorMsg}
        </div>
      )}

      {/* Status Overlay */}
      <div className="absolute top-4 right-4 z-50">
        <div className="px-4 py-1.5 rounded-md text-xs font-medium bg-black/50 text-gray-300 backdrop-blur-sm border border-gray-700 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400 animate-pulse'}`}></div>
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Main Video Area (Grid) */}
      <div className="flex-1 w-full p-2 md:p-6 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 overflow-hidden relative z-10">
        
        {/* Local Video */}
        <div className={`relative bg-black rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 shadow-xl transition-all duration-300 ${remoteStream ? 'w-full h-1/2 md:w-1/2 md:h-full' : 'w-full h-full max-w-4xl max-h-[70vh]'}`}>
          <video 
            playsInline 
            muted 
            autoPlay 
            ref={myVideo} 
            className="w-full h-full object-contain mirror"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md border border-white/10 z-30">
            <span className="text-white text-sm font-medium tracking-wide">You</span>
          </div>
          {isVideoOff && (
            <div className="absolute inset-0 bg-[#3c4043] flex flex-col items-center justify-center text-gray-300 z-20">
              <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl text-white font-bold">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
              </div>
              <span className="text-sm font-medium text-gray-300">Camera is off</span>
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className={`relative bg-black rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 shadow-xl transition-all duration-300 ${remoteStream ? 'w-full h-1/2 md:w-1/2 md:h-full' : 'hidden'}`}>
          <video 
          playsInline 
          autoPlay 
          ref={userVideo}
          className={`w-full h-full object-contain ${!remoteStream ? 'hidden' : ''}`}
        />
        {autoplayBlocked && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
            <button 
              onClick={handleManualPlay}
              className="px-6 py-4 bg-primary text-white rounded-full font-bold shadow-xl animate-bounce flex items-center gap-3 border border-white/20"
            >
              <Mic size={24} />
              Tap to Enable Remote Audio
            </button>
            <p className="text-gray-300 text-sm mt-4 text-center max-w-xs">
              Your mobile browser paused the audio. Tap to unblock.
            </p>
          </div>
        )}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md border border-white/10 z-30">
            <span className="text-white text-sm font-medium tracking-wide">{remoteName}</span>
          </div>
        </div>

        {/* Waiting State (when no remote stream) */}
        {!remoteStream && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
            <div className="translate-y-32 flex flex-col items-center">
              <p className="text-gray-400 font-medium text-lg bg-[#202124]/80 px-6 py-2 rounded-full backdrop-blur-md">
                {peerJoined ? "Connecting video feed..." : "Waiting for the other person to join..."}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Control Bar (Zoom Style) */}
      <div className="h-20 md:h-24 bg-[#202124] flex items-center justify-center gap-4 md:gap-6 px-6 relative z-20">
        <button 
          onClick={toggleMute}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        <button 
          onClick={toggleVideo}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'}`}
          title={isVideoOff ? "Start Video" : "Stop Video"}
        >
          {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>

        <div className="w-px h-8 bg-gray-700 mx-2"></div>

        <button 
          onClick={leaveCall}
          className="px-6 h-10 md:h-12 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-all font-medium text-sm md:text-base cursor-pointer"
        >
          Leave Meeting
        </button>
      </div>

    </div>
  );
};

export default VideoConsultation;
