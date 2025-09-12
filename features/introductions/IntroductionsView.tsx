import React, { useState } from 'react';
import { Sparkles, CheckCircle, User, MessageCircle } from 'lucide-react';
import Spinner from '../../components/Spinner';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';
import { generateIntroductions } from '../../services/geminiService';
import { CHARACTERS } from '../../constants';
import confetti from 'canvas-confetti';

const IntroductionsView: React.FC = () => {
    const { role, currentUser, introductions, addIntroduction, participants } = useAppContext();
    const participantId = useParticipantId();
    const [formData, setFormData] = useState({ name: currentUser?.name || '', job: '', interests: '' });
    const [generated, setGenerated] = useState<Array<{ style: string, text: string }> | null>(null);
    const [selectedIntro, setSelectedIntro] = useState<{ style: string, text: string } | null>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<string>('🐰');
    const [isLoading, setIsLoading] = useState(false);

    const alreadySubmitted = introductions.find(i => i.participantId === participantId);
    
    const handleGenerate = async () => {
        if (!formData.name || !formData.job || !formData.interests) {
            alert('모든 항목을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        const result = await generateIntroductions(formData.name, formData.job, formData.interests);
        setGenerated(result);
        setIsLoading(false);
    };

    const handleSubmit = () => {
        if (selectedIntro) {
             addIntroduction({
                participantId: participantId,
                name: formData.name,
                style: selectedIntro.style,
                text: selectedIntro.text,
                character: selectedCharacter,
            });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
            alert('자기소개 스타일을 선택해주세요.');
        }
    };


    if (role === '관리자') {
        return (
             <div className="bg-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4">참가자 자기소개 ({introductions.length}/{participants.length})</h2>
                {introductions.length === 0 ? (
                    <p className="text-slate-400">아직 제출된 자기소개가 없습니다.</p>
                ) : (
                    <div className="space-y-4">
                        {introductions.map(intro => (
                            <div key={intro.participantId} className="bg-slate-700 p-4 rounded-lg">
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl mt-1">{intro.character || '👤'}</span>
                                    <div>
                                        <p className="font-bold text-lg text-white">{intro.name} <span className="text-sm font-normal text-brand-amber ml-2 bg-amber-500/20 px-2 py-1 rounded-full">{intro.style}</span></p>
                                        <p className="text-slate-300 mt-1">{intro.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (alreadySubmitted) {
        return (
             <div className="text-center max-w-md mx-auto bg-slate-800 p-8 rounded-2xl">
                <CheckCircle className="w-16 h-16 text-brand-emerald mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">자기소개 제출 완료!</h2>
                <p className="text-xl text-slate-300">다른 참가자들의 자기소개도 기대해주세요!</p>
                <div className="bg-slate-700 p-4 rounded-lg mt-6 text-left flex items-start gap-4">
                    <span className="text-4xl mt-1">{alreadySubmitted.character || '👤'}</span>
                    <div>
                        <p className="font-bold text-lg text-white">{alreadySubmitted.name} <span className="text-sm font-normal text-brand-amber ml-2 bg-amber-500/20 px-2 py-1 rounded-full">{alreadySubmitted.style}</span></p>
                        <p className="text-slate-300 mt-1">{alreadySubmitted.text}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-slate-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">AI 아이스브레이킹 💬</h2>
            {!generated ? (
                <div className="space-y-4">
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="이름" className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:border-brand-purple"/>
                    <input type="text" value={formData.job} onChange={e => setFormData({...formData, job: e.target.value})} placeholder="직업 또는 소속" className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:border-brand-purple"/>
                    <input type="text" value={formData.interests} onChange={e => setFormData({...formData, interests: e.target.value})} placeholder="관심사 (예: 여행, 코딩, 영화감상)" className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:border-brand-purple"/>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                        {isLoading ? <Spinner/> : <><Sparkles/><span>자기소개 생성하기</span></>}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2"><MessageCircle size={24}/> 1. 마음에 드는 스타일을 선택하세요!</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generated.map((intro, index) => (
                            <div key={index} onClick={() => setSelectedIntro(intro)} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedIntro?.text === intro.text ? 'border-brand-emerald bg-emerald-500/20' : 'border-slate-600 hover:border-brand-purple'}`}>
                                <h4 className="font-bold capitalize text-brand-amber">{intro.style}</h4>
                                <p className="text-slate-300">{intro.text}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2"><User size={24} /> 2. 나를 표현할 페르소나를 고르세요!</h3>
                        <div className="flex flex-wrap justify-center gap-2 bg-slate-700 p-3 rounded-lg">
                            {CHARACTERS.map(char => (
                                <button key={char.name} onClick={() => setSelectedCharacter(char.emoji)} className={`px-3 py-2 rounded-lg transition-all text-center ${selectedCharacter === char.emoji ? 'bg-brand-purple scale-125' : 'hover:bg-slate-600'}`}>
                                    <span className="text-2xl block">{char.emoji || '👤'}</span>
                                    <span className="text-xs text-slate-400">{char.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                     <button onClick={handleSubmit} disabled={!selectedIntro} className="w-full flex items-center justify-center gap-2 bg-brand-emerald text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                        <CheckCircle/><span>이대로 제출하기</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default IntroductionsView;