
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';
import confetti from 'canvas-confetti';

const AttendanceView: React.FC = () => {
    const { role, participants, addParticipant } = useAppContext();
    const participantId = useParticipantId();
    const [name, setName] = useState('');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [checkedInParticipant, setCheckedInParticipant] = useState<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const currentParticipant = participants.find(p => p.id === participantId);
    
    useEffect(() => {
        if (role === '참가자' && !currentParticipant) {
            setupCamera();
        }
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [role, currentParticipant]);

    const setupCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraError(null);
                }
            } catch (err) {
                console.error("Camera error:", err);
                if (err instanceof Error) {
                    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                         setCameraError("카메라 접근이 거부되었습니다. 브라우저 설정에서 이 사이트의 카메라 권한을 허용해주세요.");
                    } else {
                         setCameraError(`카메라 오류: ${err.message}`);
                    }
                } else {
                    setCameraError("알 수 없는 카메라 오류가 발생했습니다.");
                }
            }
        } else {
            setCameraError("이 브라우저에서는 카메라 기능을 지원하지 않습니다.");
        }
    };
    
    const takeSnapshot = () => {
        if (!name.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }

        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const now = new Date();
                const dateTime = now.toLocaleString('ko-KR');
                
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.fillText(dateTime, 20, canvas.height - 50);
                ctx.fillText(name, 20, canvas.height - 20);

                const dataUrl = canvas.toDataURL('image/jpeg');
                const newParticipant = {
                    id: participantId,
                    name: name,
                    checkInTime: new Date().toISOString(),
                    checkInImage: dataUrl,
                };
                addParticipant(newParticipant);
                setCheckedInParticipant(newParticipant);
                
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    };

    if (role === '관리자') {
        return (
             <div className="bg-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4">참가자 현황 ({participants.length}명)</h2>
                {participants.length === 0 ? (
                    <p className="text-slate-400">아직 출석한 참가자가 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {participants.map(p => (
                            <div key={p.id} className="bg-slate-700 rounded-lg p-4 text-center">
                                {p.checkInImage ? (
                                    <img src={p.checkInImage} alt={p.name} className="w-full h-32 object-cover rounded-md mb-2" />
                                ) : <div className="w-full h-32 bg-slate-600 rounded-md mb-2 flex items-center justify-center text-slate-400">이미지 없음</div>}
                                <p className="font-bold">{p.name}</p>
                                <p className="text-xs text-slate-400">{p.checkInTime ? new Date(p.checkInTime).toLocaleTimeString() : '시간 정보 없음'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (currentParticipant || checkedInParticipant) {
        const participant = currentParticipant || checkedInParticipant;
        return (
            <div className="text-center max-w-md mx-auto bg-slate-800 p-8 rounded-2xl">
                <CheckCircle className="w-16 h-16 text-brand-emerald mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">출석 완료!</h2>
                <p className="text-xl text-slate-300">환영합니다, <span className="font-bold text-white">{participant.name}</span>님!</p>
                {participant.checkInImage && <img src={participant.checkInImage} alt="출석 사진" className="mt-4 rounded-lg w-full" />}
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto bg-slate-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">오늘의 체크인 🚀</h2>
            <div className="relative mb-4">
                <video ref={videoRef} autoPlay playsInline className={`w-full rounded-lg ${cameraError ? 'hidden' : ''}`}></video>
                {cameraError && (
                    <div className="w-full aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center text-center p-4">
                        <AlertCircle className="w-12 h-12 text-brand-amber mb-2" />
                        <p className="font-bold">카메라 오류</p>
                        <p className="text-sm text-slate-400">{cameraError}</p>
                    </div>
                )}
                 <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <div className="space-y-4">
                 <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:border-brand-purple transition-colors"
                />
                 <button 
                    onClick={takeSnapshot} 
                    disabled={!!cameraError || !name.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                    <Camera />
                    <span>출석하기</span>
                </button>
                <button 
                    onClick={setupCamera} 
                    className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-500 transition-colors">
                    <RefreshCw size={18}/>
                    <span>카메라 다시 시작</span>
                </button>
            </div>
        </div>
    );
};

export default AttendanceView;
