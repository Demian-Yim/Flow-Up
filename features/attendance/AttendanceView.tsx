
import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, UserPlus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';
import { Role } from '../../types';

const AttendanceView: React.FC = () => {
    const { role, participants, addParticipant } = useAppContext();
    const participantId = useParticipantId();
    
    const [name, setName] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const alreadyCheckedIn = participants.find(p => p.id === participantId);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
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
            setError('사진을 등록해주세요.');
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
    };

    if (role === Role.Participant) {
        if (alreadyCheckedIn) {
            return (
                <div className="text-center max-w-md mx-auto bg-slate-800 p-8 rounded-2xl">
                    <CheckCircle className="w-16 h-16 text-brand-emerald mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">체크인 완료!</h2>
                    <p className="text-xl text-slate-300">{alreadyCheckedIn.name}님, 환영합니다!</p>
                    {alreadyCheckedIn.checkInImage && <img src={alreadyCheckedIn.checkInImage} alt={alreadyCheckedIn.name} className="w-32 h-32 rounded-full mx-auto mt-6 object-cover border-4 border-brand-purple" />}
                </div>
            );
        }
        
        return (
            <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4 text-center">오늘의 체크인 🚀</h2>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="이름을 입력하세요" 
                        className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:border-brand-purple"
                    />
                    <div 
                        className="w-full h-48 bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-purple"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {image ? (
                            <img src={image} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <div className="text-center text-slate-400">
                                <Camera className="w-12 h-12 mx-auto mb-2" />
                                <p>클릭해서 사진 등록하기</p>
                            </div>
                        )}
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden" 
                    />
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button 
                        onClick={handleCheckIn} 
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                    >
                        <UserPlus />
                        <span>체크인하기</span>
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">참가자 체크인 현황 ({participants.length}명)</h2>
            {participants.length === 0 ? (
                <p className="text-slate-400">아직 체크인한 참가자가 없습니다.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {participants.map(p => (
                        <div key={p.id} className="text-center bg-slate-700 p-3 rounded-lg">
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
