import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, UserPlus, RefreshCw, AlertTriangle, X, Upload } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';
import { Role } from '../../types';
import confetti from 'canvas-confetti';
import { generateWelcomeMessage } from '../../services/geminiService';
import Spinner from '../../components/Spinner';

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return <div className="text-sm text-slate-400 font-mono">{time.toLocaleTimeString('ko-KR')}</div>;
};

const AttendanceView: React.FC = () => {
    const { role, participants, addParticipant, removeParticipant } = useAppContext();
    const participantId = useParticipantId();
    
    const [name, setName] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const alreadyCheckedIn = participants.find(p => p.id === participantId);

    useEffect(() => {
        if (alreadyCheckedIn && !welcomeMessage) {
            setIsLoadingMessage(true);
            generateWelcomeMessage(alreadyCheckedIn.name).then(msg => {
                setWelcomeMessage(msg);
                setIsLoadingMessage(false);
            });
        }
    }, [alreadyCheckedIn, welcomeMessage]);


    const startCamera = async () => {
        setError('');
        setImage(null);
        setIsCameraReady(false);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsCameraReady(true);
                }
            } catch (err) {
                console.error("카메라 접근 오류:", err);
                if (err instanceof Error) {
                    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                        setError("카메라 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용한 후, '카메라 다시 시작' 버튼을 눌러주세요.");
                    } else {
                        setError(`카메라를 시작할 수 없습니다: ${err.message}`);
                    }
                } else {
                    setError("알 수 없는 카메라 오류가 발생했습니다.");
                }
            }
        } else {
            setError("이 브라우저에서는 카메라 기능을 지원하지 않습니다.");
        }
    };
    
    useEffect(() => {
        if (role === Role.Participant && !alreadyCheckedIn) {
            startCamera();
        }
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [role, alreadyCheckedIn]);

    const handleTakePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/png');
            setImage(dataUrl);
            
            // Stop camera after taking photo
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setIsCameraReady(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target?.result as string);
                if (videoRef.current && videoRef.current.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                    setIsCameraReady(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCheckIn = () => {
        if (!name.trim()) {
            setError('이름을 입력해주세요.');
            return;
        }
        if (!image) {
            setError('사진을 찍거나 업로드해주세요.');
            return;
        }
        setError('');
        
        const newParticipant = {
            id: participantId,
            name: name,
            checkInTime: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            checkInImage: image,
        };
        addParticipant(newParticipant);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    };

    const handleRemoveParticipant = (id: string, name: string) => {
        if (window.confirm(`'${name}' 참가자를 삭제하시겠습니까? 체크인 정보, 자기소개, 팀 소속 등 모든 관련 데이터가 영구적으로 삭제됩니다.`)) {
            removeParticipant(id);
        }
    };

    if (role === Role.Participant) {
        if (alreadyCheckedIn) {
            return (
                <div className="text-center max-w-md mx-auto bg-slate-800 p-8 rounded-2xl">
                    <CheckCircle className="w-16 h-16 text-brand-emerald mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">{alreadyCheckedIn.name}님, 체크인 완료!</h2>
                    {isLoadingMessage ? <Spinner /> : <p className="text-xl text-slate-300 italic">"{welcomeMessage}"</p>}
                    {alreadyCheckedIn.checkInImage && <img src={alreadyCheckedIn.checkInImage} alt={alreadyCheckedIn.name} className="w-32 h-32 rounded-full mx-auto mt-6 object-cover border-4 border-brand-purple" />}
                </div>
            );
        }
        
        return (
            <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">오늘의 체크인 🚀</h2>
                    <Clock />
                </div>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="이름을 입력하세요" 
                        className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:border-brand-purple"
                    />
                    <div className="w-full aspect-video bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                        {image ? (
                            <img src={image} alt="선택된 이미지" className="w-full h-full object-cover" />
                        ) : error ? (
                             <div className="text-center text-amber-400 p-4">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                                <p className="font-bold">카메라 오류</p>
                                <p className="text-sm text-slate-300">{error}</p>
                            </div>
                        ) : (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>

                    {error && (
                         <button 
                            onClick={startCamera} 
                            className="w-full flex items-center justify-center gap-2 bg-brand-amber text-black font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                        >
                            <RefreshCw />
                            <span>카메라 다시 시작</span>
                        </button>
                    )}

                    {!image ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleTakePhoto}
                                disabled={!isCameraReady}
                                className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Camera />
                                <span>사진 찍기</span>
                            </button>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-500 transition-colors"
                            >
                                <Upload />
                                <span>앨범 선택</span>
                            </button>
                        </div>
                    ) : (
                         <button 
                            onClick={handleCheckIn} 
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                        >
                            <UserPlus />
                            <span>이 사진으로 체크인하기</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }
    
    // Admin View
    return (
        <div className="bg-slate-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">참가자 체크인 현황 ({participants.length}명)</h2>
            {participants.length === 0 ? (
                <p className="text-slate-400">아직 체크인한 참가자가 없습니다.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {participants.map(p => (
                        <div key={p.id} className="relative group text-center bg-slate-700 p-3 rounded-lg">
                             <button 
                                onClick={() => handleRemoveParticipant(p.id, p.name)}
                                className="absolute top-1.5 right-1.5 z-10 p-1 bg-red-600/70 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`${p.name} 삭제`}
                            >
                                <X size={14} />
                            </button>
                            {p.checkInImage && <img src={p.checkInImage} alt={p.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-slate-600" />}
                            <p className="font-bold mt-2 truncate">{p.name}</p>
                            <p className="text-sm text-slate-400">{p.checkInTime}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendanceView;